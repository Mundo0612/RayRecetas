import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import type { Suggestion, Tone } from '../data/recipes'
import { useStore, type FeedbackKind } from '../lib/store'
import { Icon, type IconName } from './Icon'

/* ---------- Button ---------- */

type Variant = 'primary' | 'secondary' | 'quiet' | 'green'
const variants: Record<Variant, string> = {
  primary: 'bg-terracotta text-paper hover:bg-terracotta-dark shadow-card',
  green: 'bg-green text-paper hover:bg-green-dark shadow-card',
  secondary: 'bg-paper text-green border-2 border-green hover:bg-green-soft',
  quiet: 'bg-transparent text-ink-soft hover:bg-cream-deep',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: 'md' | 'lg'
  icon?: IconName
}) {
  const sizing = size === 'lg' ? 'min-h-tap-lg px-6 text-lead' : 'min-h-tap px-4 text-body'
  return (
    <button
      type="button"
      className={`inline-flex min-w-tap items-center justify-center gap-2 rounded-card font-bold transition-colors disabled:opacity-50 ${sizing} ${variants[variant]} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} className="size-6 shrink-0" />}
      {children}
    </button>
  )
}

/** Round icon-only button, 44×44 minimum */
export function IconButton({
  icon,
  label,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-tap shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream-deep ${className}`}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  )
}

/* ---------- Language toggle (every screen) ---------- */

export function LangToggle({ onDark = false }: { onDark?: boolean }) {
  const { lang, setLang, t } = useStore()
  const base = onDark ? 'bg-green-dark/40 text-paper' : 'bg-cream-deep text-ink'
  return (
    <div role="group" aria-label={t.langLabel} className={`flex rounded-full p-1 ${base}`}>
      {(['es', 'en'] as const).map((l) => {
        const active = lang === l
        return (
          <button
            key={l}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(l)}
            className={`min-h-tap min-w-tap rounded-full px-2 text-small font-extrabold uppercase transition-colors ${
              active ? 'bg-paper text-terracotta-dark shadow-card' : 'opacity-80 hover:opacity-100'
            }`}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Top bar ---------- */

export function TopBar({ title, onBack }: { title?: string; onBack?: () => void }) {
  const { t, back } = useStore()
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 bg-cream/95 px-3 py-2 backdrop-blur">
      <IconButton icon="back" label={t.back} onClick={onBack ?? back} />
      <h1 className="flex-1 truncate text-lead font-bold">{title}</h1>
      <LangToggle />
    </header>
  )
}

/* ---------- Feedback: icon + lead phrase, never color alone ---------- */

const feedbackStyle: Record<FeedbackKind, { icon: IconName; box: string; iconColor: string }> = {
  success: { icon: 'checkCircle', box: 'bg-green-soft border-green', iconColor: 'text-green' },
  warning: { icon: 'warning', box: 'bg-yellow-soft border-yellow', iconColor: 'text-terracotta-dark' },
  error: { icon: 'error', box: 'bg-error-soft border-error', iconColor: 'text-error' },
  info: { icon: 'info', box: 'bg-paper border-line', iconColor: 'text-ink-soft' },
}

export function Feedback({
  kind,
  lead,
  children,
  action,
  className = '',
}: {
  kind: FeedbackKind
  lead: string
  children?: ReactNode
  action?: ReactNode
  className?: string
}) {
  const s = feedbackStyle[kind]
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-chip border-l-4 px-3 py-3 text-small text-ink ${s.box} ${className}`}
    >
      <Icon name={s.icon} className={`mt-0.5 size-5 shrink-0 ${s.iconColor}`} />
      <div className="flex-1">
        <strong className="font-extrabold">{lead}</strong> {children}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  )
}

export function ToastHost() {
  const { toasts, dismissToast, t } = useStore()
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex flex-col gap-2 p-3" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto animate-fade-in shadow-card">
          <div className="relative">
            <Feedback kind={toast.kind} lead={toast.lead} className="pr-12">
              {toast.text}
            </Feedback>
            <IconButton
              icon="x"
              label={t.close}
              onClick={() => dismissToast(toast.id)}
              className="absolute right-0 top-0"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- AI suggestion: labelled, says what it's based on, apply/dismiss/undo ---------- */

export function SuggestionChip({
  suggestion,
  onChange,
  compact = false,
}: {
  suggestion: Suggestion
  onChange?: (status: Suggestion['status']) => void
  /** Read-only view (recipe detail / cook mode): only shows applied amounts */
  compact?: boolean
}) {
  const { t, lang } = useStore()
  const value = lang === 'es' ? suggestion.es : suggestion.en

  if (compact) {
    if (suggestion.status !== 'applied') return null
    return (
      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-soft px-2 py-0.5 text-caption font-bold text-green">
        <Icon name="check" className="size-4" />
        {value}
      </span>
    )
  }

  if (suggestion.status === 'applied') {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-chip bg-green-soft py-1 pl-3 pr-1 text-small text-green">
        <Icon name="checkCircle" className="size-5 shrink-0" />
        <span className="flex-1">
          <strong className="font-extrabold">{t.applied}:</strong> {value}
        </span>
        <Button variant="quiet" icon="undo" onClick={() => onChange?.('pending')} className="text-green">
          {t.undo}
        </Button>
      </div>
    )
  }

  if (suggestion.status === 'dismissed') {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-chip bg-cream-deep py-1 pl-3 pr-1 text-small text-ink-soft">
        <Icon name="x" className="size-5 shrink-0" />
        <span className="flex-1">{t.dismissed}</span>
        <Button variant="quiet" icon="undo" onClick={() => onChange?.('pending')}>
          {t.undo}
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-3 rounded-chip border border-dashed border-terracotta bg-terracotta-soft/50 p-3">
      <div className="flex items-center gap-1.5 text-caption font-extrabold uppercase tracking-wide text-terracotta-dark">
        <Icon name="sparkle" className="size-4" />
        {t.suggestion}
      </div>
      <p className="mt-1 text-body font-bold text-ink">{value}</p>
      <p className="text-caption text-ink-soft">{t.basedOn(suggestion.basedOn)}</p>
      <div className="mt-2 flex gap-2">
        <Button variant="green" icon="check" onClick={() => onChange?.('applied')} className="flex-1">
          {t.apply}
        </Button>
        <Button variant="secondary" icon="x" onClick={() => onChange?.('dismissed')} className="flex-1">
          {t.dismiss}
        </Button>
      </div>
    </div>
  )
}

export function UnsureNotice({ holder, action }: { holder: string; action?: ReactNode }) {
  const { t } = useStore()
  return (
    <Feedback kind="warning" lead={t.unsureLead} className="mt-2" action={action}>
      {t.unsure(holder)}
    </Feedback>
  )
}

/* ---------- Her words: always shown verbatim ---------- */

export function HerWords({ children, size = 'body' }: { children: ReactNode; size?: 'body' | 'step' }) {
  return (
    <p className={`${size === 'step' ? 'text-step font-semibold' : 'text-body'} text-ink`}>
      <span className="text-terracotta" aria-hidden="true">“</span>
      {children}
      <span className="text-terracotta" aria-hidden="true">”</span>
    </p>
  )
}

/* ---------- Editable line (Review): mom can rewrite anything ---------- */

export function EditableLine({
  words,
  onSave,
  label,
}: {
  words: string
  onSave: (w: string) => void
  label: string
}) {
  const { t, notify } = useStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(words)
  const [error, setError] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing) ref.current?.focus()
  }, [editing])

  if (!editing) {
    return (
      <div className="flex items-start gap-1">
        <div className="flex-1 pt-2">
          <HerWords>{words}</HerWords>
        </div>
        <IconButton
          icon="edit"
          label={`${t.editLine}: ${label}`}
          onClick={() => {
            setDraft(words)
            setError(false)
            setEditing(true)
          }}
          className="text-terracotta-dark"
        />
      </div>
    )
  }

  return (
    <div>
      <label className="sr-only" htmlFor={`edit-${label}`}>{t.editLine}</label>
      <textarea
        id={`edit-${label}`}
        ref={ref}
        value={draft}
        rows={3}
        onChange={(e) => {
          setDraft(e.target.value)
          setError(false)
        }}
        className="w-full rounded-chip border-2 border-green bg-paper p-3 text-body text-ink"
      />
      {error && (
        <Feedback kind="error" lead={t.emptyLineLead} className="mt-2">
          {t.emptyLine}
        </Feedback>
      )}
      <div className="mt-2 flex gap-2">
        <Button
          variant="green"
          icon="check"
          className="flex-1"
          onClick={() => {
            if (!draft.trim()) return setError(true)
            onSave(draft.trim())
            setEditing(false)
            notify('success', t.lineSavedLead, t.lineSaved)
          }}
        >
          {t.save}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => setEditing(false)}>
          {t.cancel}
        </Button>
      </div>
    </div>
  )
}

/* ---------- Bottom sheet (inside the phone frame) ---------- */

export function Sheet({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle?: ReactNode
  onClose: () => void
  children: ReactNode
}) {
  const { t } = useStore()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label={t.close} onClick={onClose} className="absolute inset-0 bg-ink/40 animate-fade-in" />
      <div className="relative flex max-h-sheet animate-sheet-in flex-col rounded-t-sheet bg-cream shadow-sheet">
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-line" aria-hidden="true" />
        <div className="flex items-start gap-2 px-5 pt-3">
          <div className="flex-1">
            <h2 className="font-display text-title font-semibold">{title}</h2>
            {subtitle}
          </div>
          <IconButton icon="x" label={t.close} onClick={onClose} />
        </div>
        <div className="scrollbar-none overflow-y-auto px-5 pb-6 pt-3">{children}</div>
      </div>
    </div>
  )
}

/* ---------- Photo placeholder ---------- */

const tones: Record<Tone, string> = {
  terracotta: 'bg-terracotta-soft text-terracotta',
  green: 'bg-green-soft text-green',
  yellow: 'bg-yellow-soft text-terracotta-dark',
}

export function PhotoPlaceholder({ tone, className = '' }: { tone: Tone; className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${tones[tone]} ${className}`}
      aria-hidden="true"
    >
      <div className="bg-dots absolute inset-0 opacity-20" />
      <Icon name="pot" className="relative size-12" />
    </div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-caption font-extrabold uppercase tracking-wider text-terracotta-dark">{children}</h2>
  )
}
