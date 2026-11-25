import { useState } from 'react'
import type { FamilyMember } from '../data/recipes'
import { Icon } from '../components/Icon'
import { Button, Feedback, SectionLabel, Sheet, TopBar } from '../components/ui'
import { useStore } from '../lib/store'

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function MemberRow({ m }: { m: FamilyMember }) {
  const { t } = useStore()
  const holder = m.role === 'holder'
  return (
    <li className="flex items-center gap-3 py-3">
      <span
        className={`flex size-tap shrink-0 items-center justify-center rounded-full text-small font-extrabold ${
          holder ? 'bg-terracotta text-paper' : 'bg-green-soft text-green'
        }`}
        aria-hidden="true"
      >
        {initials(m.name)}
      </span>
      <div className="flex-1">
        <p className="text-body font-bold text-ink">
          {m.name}
          {m.isYou && <span className="ml-2 text-caption font-bold text-ink-soft">({t.youTag})</span>}
        </p>
        <p className="text-small text-ink-soft">{m.relation}</p>
        {m.pending && (
          <p className="mt-1 inline-flex items-center gap-1 text-caption font-bold text-terracotta-dark">
            <Icon name="send" className="size-4" />
            {t.pending}
          </p>
        )}
      </div>
    </li>
  )
}

export function Family() {
  const { t, family, invite, notify, resetDemo } = useStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('')
  const [error, setError] = useState(false)

  const holders = family.filter((m) => m.role === 'holder')
  const cooks = family.filter((m) => m.role === 'cook')

  const submit = () => {
    if (!name.trim()) return setError(true)
    invite(name.trim(), relation.trim())
    notify('success', t.inviteSentLead, t.inviteSent(name.trim()))
    setName('')
    setRelation('')
    setOpen(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar title={t.familyTitle} />
      <div className="scrollbar-none flex-1 overflow-y-auto px-5 pb-6">
        <p className="text-body text-ink-soft">{t.familyIntro}</p>

        <section className="mt-5">
          <SectionLabel>{t.holders}</SectionLabel>
          <ul className="mt-2 divide-y divide-line rounded-card bg-paper px-4 shadow-card">
            {holders.map((m) => <MemberRow key={m.id} m={m} />)}
          </ul>
        </section>

        <section className="mt-6">
          <SectionLabel>{t.cooks}</SectionLabel>
          <ul className="mt-2 divide-y divide-line rounded-card bg-paper px-4 shadow-card">
            {cooks.map((m) => <MemberRow key={m.id} m={m} />)}
          </ul>
        </section>

        <button
          type="button"
          onClick={() => {
            resetDemo()
            notify('info', t.resetLead, t.reset)
          }}
          className="mx-auto mt-8 flex min-h-tap items-center gap-2 px-3 text-small font-bold text-ink-soft underline"
        >
          <Icon name="refresh" className="size-5" />
          {t.resetDemo}
        </button>
      </div>

      <footer className="border-t border-line bg-cream px-5 pb-6 pt-3">
        <Button size="lg" icon="plus" variant="green" className="w-full" onClick={() => setOpen(true)}>
          {t.invite}
        </Button>
      </footer>

      {open && (
        <Sheet title={t.inviteTitle} onClose={() => setOpen(false)}>
          <label htmlFor="inv-name" className="text-small font-bold text-ink-soft">
            {t.name}
          </label>
          <input
            id="inv-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(false)
            }}
            aria-invalid={error}
            className="mt-1 min-h-tap w-full rounded-chip border-2 border-line bg-paper px-3 text-body focus:border-green aria-invalid:border-error"
          />
          {error && (
            <Feedback kind="error" lead={t.inviteErrorLead} className="mt-2">
              {t.inviteError}
            </Feedback>
          )}
          <label htmlFor="inv-rel" className="mt-4 block text-small font-bold text-ink-soft">
            {t.relation}
          </label>
          <input
            id="inv-rel"
            value={relation}
            placeholder={t.relationPlaceholder}
            onChange={(e) => setRelation(e.target.value)}
            className="mt-1 min-h-tap w-full rounded-chip border-2 border-line bg-paper px-3 text-body placeholder:text-ink-soft focus:border-green"
          />
          <Button size="lg" icon="send" className="mt-5 w-full" onClick={submit}>
            {t.sendInvite}
          </Button>
        </Sheet>
      )}
    </div>
  )
}
