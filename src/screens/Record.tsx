import { useCallback, useEffect, useRef, useState } from 'react'
import { recordedDraft } from '../data/recipes'
import { Icon } from '../components/Icon'
import { Feedback, TopBar } from '../components/ui'
import { useStore } from '../lib/store'

type Phase = 'idle' | 'recording' | 'processing'
const BARS = 28

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function Record() {
  const { t, createDraft, replace } = useStore()
  const [phase, setPhase] = useState<Phase>('idle')
  const [practice, setPractice] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0.08))

  const recorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const stream = useRef<MediaStream | null>(null)
  const audioCtx = useRef<AudioContext | null>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const raf = useRef<number>(0)
  const timer = useRef<number>(0)
  const processingTimer = useRef<number>(0)

  const cleanup = useCallback(() => {
    cancelAnimationFrame(raf.current)
    window.clearInterval(timer.current)
    stream.current?.getTracks().forEach((tr) => tr.stop())
    stream.current = null
    audioCtx.current?.close().catch(() => {})
    audioCtx.current = null
    analyser.current = null
  }, [])

  useEffect(
    () => () => {
      cleanup()
      window.clearTimeout(processingTimer.current)
      if (recorder.current && recorder.current.state !== 'inactive') {
        recorder.current.onstop = null
        recorder.current.stop()
      }
    },
    [cleanup],
  )

  const animate = useCallback(() => {
    const a = analyser.current
    if (a) {
      const data = new Uint8Array(a.frequencyBinCount)
      a.getByteFrequencyData(data)
      const step = Math.floor(data.length / BARS / 1.5) || 1
      setLevels(Array.from({ length: BARS }, (_, i) => Math.max(0.08, data[i * step] / 255)))
    } else {
      // Practice mode: a gentle, speech-like wobble
      const now = performance.now() / 1000
      setLevels(
        Array.from({ length: BARS }, (_, i) =>
          Math.max(0.08, 0.35 + 0.3 * Math.sin(now * 5 + i * 0.6) * Math.sin(now * 1.3 + i) + Math.random() * 0.15),
        ),
      )
    }
    raf.current = requestAnimationFrame(animate)
  }, [])

  const startTimerAndWave = () => {
    setSeconds(0)
    timer.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    raf.current = requestAnimationFrame(animate)
  }

  const start = async () => {
    chunks.current = []
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error('unsupported')
      }
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.current = s
      const rec = new MediaRecorder(s)
      rec.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data)
      rec.start()
      recorder.current = rec

      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (Ctx) {
        const ctx = new Ctx()
        const src = ctx.createMediaStreamSource(s)
        const an = ctx.createAnalyser()
        an.fftSize = 256
        src.connect(an)
        audioCtx.current = ctx
        analyser.current = an
      }
      setPractice(false)
    } catch {
      // Permission denied or no mic: fake recording with a timer
      recorder.current = null
      setPractice(true)
    }
    setPhase('recording')
    startTimerAndWave()
  }

  const finish = (url?: string) => {
    setPhase('processing')
    processingTimer.current = window.setTimeout(() => {
      const id = createDraft(url)
      replace({ name: 'review', id })
    }, 2000)
  }

  const stop = () => {
    cleanup()
    setLevels(Array(BARS).fill(0.08))
    const rec = recorder.current
    if (rec && rec.state !== 'inactive') {
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: rec.mimeType || 'audio/webm' })
        finish(blob.size ? URL.createObjectURL(blob) : undefined)
      }
      rec.stop()
    } else {
      finish()
    }
  }

  if (phase === 'processing') {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title={t.recordTitle} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center" role="status">
          <div className="flex size-record items-center justify-center rounded-full bg-yellow-soft text-terracotta">
            <Icon name="pot" className="size-14" />
          </div>
          <p className="font-display text-display font-semibold">
            {t.processing.replace('…', '')}
            {[0, 1, 2].map((i) => (
              <span key={i} className="animate-dots" style={{ animationDelay: `${i * 0.2}s` }}>.</span>
            ))}
          </p>
          <p className="text-body text-ink-soft">{t.processingSub}</p>
        </div>
      </div>
    )
  }

  const recording = phase === 'recording'

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t.recordTitle} />
      <div className="flex flex-1 flex-col items-center px-6 pb-8 pt-4 text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-terracotta-soft px-4 py-2 text-small font-bold text-terracotta-dark">
          <Icon name="flame" className="size-5" />
          {t.recordingFor(recordedDraft.from)}
        </p>

        <p className="mt-6 font-display text-title font-semibold text-green">{t.recordHint}</p>

        <div className="mt-6 font-display text-timer font-semibold tabular-nums text-ink" aria-live="off">
          {formatTime(seconds)}
        </div>
        <p className="mt-1 text-small font-bold text-ink-soft" aria-live="polite">
          {recording ? (
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-error" aria-hidden="true" />
              {practice ? t.practiceMode : t.listening}
            </span>
          ) : (
            t.tapToStart
          )}
        </p>

        <div className="mt-6 flex h-wave w-full items-center justify-center gap-1" aria-hidden="true">
          {levels.map((l, i) => (
            <span
              key={i}
              className={`w-1.5 rounded-full transition-[height] duration-75 ${recording ? 'bg-terracotta' : 'bg-line'}`}
              style={{ height: `${Math.round(l * 100)}%` }}
            />
          ))}
        </div>

        <div className="relative mt-auto flex items-center justify-center pt-6">
          {recording && (
            <span className="absolute size-record animate-pulse-ring rounded-full bg-terracotta" aria-hidden="true" />
          )}
          <button
            type="button"
            onClick={recording ? stop : start}
            aria-label={recording ? t.stopRecording : t.startRecording}
            className={`relative flex size-record flex-col items-center justify-center gap-1 rounded-full text-paper shadow-card transition-colors ${
              recording ? 'bg-terracotta-dark' : 'bg-terracotta hover:bg-terracotta-dark'
            }`}
          >
            <Icon name={recording ? 'stop' : 'mic'} className="size-12" filled={recording} />
            <span className="text-small font-extrabold">{recording ? t.stopRecording : t.startRecording}</span>
          </button>
        </div>

        {practice && recording && (
          <Feedback kind="warning" lead={t.micDeniedLead} className="mt-6 w-full text-left">
            {t.micDenied}
          </Feedback>
        )}
      </div>
    </div>
  )
}
