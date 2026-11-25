import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { Button, HerWords, IconButton, LangToggle, SuggestionChip, UnsureNotice } from '../components/ui'
import { useStore } from '../lib/store'
import { AskSheet } from './AskSheet'

export function Cook({ id, step }: { id: string; step: number }) {
  const { t, getRecipe, replace, back, notify, recordingFor } = useStore()
  const recipe = getRecipe(id)
  const [askOpen, setAskOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audio = useRef<HTMLAudioElement>(null)

  const url = recordingFor(id)

  const stopAudio = useCallback(() => {
    if (audio.current) {
      audio.current.pause()
      audio.current.currentTime = 0
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setPlaying(false)
  }, [])

  // Stop her voice whenever the step changes or we leave cook mode.
  useEffect(() => stopAudio, [step, stopAudio])

  if (!recipe) return null
  const current = recipe.steps[step]
  const total = recipe.steps.length
  const isLast = step === total - 1

  const play = () => {
    if (playing) return stopAudio()
    if (url && audio.current) {
      audio.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
      return
    }
    // Placeholder voice: read her exact words aloud in Spanish.
    if (!('speechSynthesis' in window)) {
      notify('error', t.noAudioLead, t.noAudio)
      return
    }
    const u = new SpeechSynthesisUtterance(current.words)
    u.lang = 'es-MX'
    u.rate = 0.92
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('es'))
    if (voice) u.voice = voice
    u.onend = () => setPlaying(false)
    u.onerror = () => setPlaying(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
    setPlaying(true)
  }

  const goTo = (n: number) => replace({ name: 'cook', id, step: n })

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {url && <audio ref={audio} src={url} onEnded={() => setPlaying(false)} />}

      <header className="flex items-center gap-2 px-3 py-2">
        <IconButton icon="x" label={t.close} onClick={back} />
        <div className="flex-1 truncate">
          <p className="truncate font-display text-lead font-semibold">{recipe.dish}</p>
          <p className="text-caption font-bold text-ink-soft">{t.fromHolder(recipe.from)}</p>
        </div>
        <LangToggle />
      </header>

      {/* Progress */}
      <div className="px-5">
        <div className="flex items-center justify-between text-small font-extrabold text-terracotta-dark">
          <span>{t.stepOf(step + 1, total)}</span>
        </div>
        <div
          className="mt-2 flex gap-1"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={step + 1}
          aria-label={t.stepOf(step + 1, total)}
        >
          {recipe.steps.map((s, i) => (
            <span key={s.id} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-terracotta' : 'bg-line'}`} />
          ))}
        </div>
      </div>

      <div key={step} className="scrollbar-none flex-1 animate-fade-in overflow-y-auto px-5 pb-4 pt-6">
        <HerWords size="step">{current.words}</HerWords>

        {current.suggestion && <SuggestionChip suggestion={current.suggestion} compact />}
        {current.unsure && <UnsureNotice holder={recipe.from} />}

        <button
          type="button"
          onClick={play}
          aria-pressed={playing}
          className="mt-6 flex min-h-tap-lg w-full items-center gap-3 rounded-card bg-yellow-soft px-3 py-2 text-left transition-colors hover:bg-yellow"
        >
          <span className="flex size-tap shrink-0 items-center justify-center rounded-full bg-terracotta text-paper">
            <Icon name={playing ? 'pause' : 'play'} filled={!playing} className="size-6" />
          </span>
          <span className="flex-1">
            <span className="block text-body font-bold text-ink">
              {playing ? t.stopVoice : t.playVoice(recipe.from)}
            </span>
            <span className="block text-caption text-ink-soft">({url ? t.herRecording : t.sampleAudio})</span>
          </span>
          <Icon name="speaker" className="size-6 text-terracotta" />
        </button>

        {current.notes.length > 0 && (
          <ul className="mt-5 flex flex-col gap-3">
            {current.notes.map((n) => (
              <li key={n.id} className="rounded-card border-2 border-green-soft bg-paper p-4">
                <p className="text-caption text-ink-soft">
                  {t.you}: “{n.question}”
                </p>
                {n.reply ? (
                  <>
                    <p className="mt-2 flex items-center gap-1.5 text-caption font-extrabold uppercase tracking-wide text-green">
                      <Icon name="chat" className="size-4" />
                      {t.noteFrom(recipe.from)}
                    </p>
                    <HerWords>{n.reply}</HerWords>
                  </>
                ) : (
                  <p className="mt-2 text-small italic text-ink-soft">{t.typing(recipe.from)}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        <Button variant="secondary" icon="chat" className="mt-5 w-full" onClick={() => setAskOpen(true)}>
          {t.askHolder(recipe.from)}
        </Button>
      </div>

      <footer className="flex gap-3 border-t border-line bg-cream px-5 pb-6 pt-3">
        <Button
          variant="secondary"
          size="lg"
          icon="back"
          className="flex-1"
          disabled={step === 0}
          onClick={() => goTo(step - 1)}
        >
          {t.prev}
        </Button>
        {isLast ? (
          <Button
            size="lg"
            icon="check"
            className="flex-1"
            onClick={() => {
              notify('success', t.doneLead, t.done)
              back()
            }}
          >
            {t.finish}
          </Button>
        ) : (
          <Button size="lg" className="flex-1" onClick={() => goTo(step + 1)}>
            {t.next}
            <Icon name="next" />
          </Button>
        )}
      </footer>

      {askOpen && <AskSheet recipe={recipe} stepIndex={step} onClose={() => setAskOpen(false)} />}
    </div>
  )
}
