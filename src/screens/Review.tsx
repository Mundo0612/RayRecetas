import { useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import {
  Button,
  EditableLine,
  Feedback,
  SectionLabel,
  SuggestionChip,
  TopBar,
  UnsureNotice,
} from '../components/ui'
import { useStore } from '../lib/store'

export function Review({ id }: { id: string }) {
  const { t, getRecipe, setSuggestion, editWords, renameDish, saveRecipe, notify, replace, back, home, recordingFor } =
    useStore()
  const recipe = getRecipe(id)
  const [dish, setDish] = useState(recipe?.dish ?? '')
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  if (!recipe) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar onBack={home} />
      </div>
    )
  }

  const url = recordingFor(id)
  const pending = [...recipe.ingredients, ...recipe.steps].filter((i) => i.suggestion?.status === 'pending').length

  const save = () => {
    if (dish.trim() && dish.trim() !== recipe.dish) renameDish(id, dish.trim())
    if (recipe.draft) {
      saveRecipe(id)
      notify('success', t.recipeSavedLead, t.recipeSaved)
      replace({ name: 'recipe', id })
    } else {
      notify('success', t.changesSavedLead, t.changesSaved)
      back()
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar title={t.reviewTitle} onBack={recipe.draft ? home : back} />

      <div className="scrollbar-none flex-1 overflow-y-auto px-5 pb-6">
        <Feedback kind="info" lead={t.reviewIntroLead}>
          {t.reviewIntro}
        </Feedback>

        {url && (
          <>
            <audio ref={audio} src={url} onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} />
            <Button
              variant="secondary"
              icon={playing ? 'pause' : 'speaker'}
              className="mt-3 w-full"
              onClick={() => {
                const el = audio.current
                if (!el) return
                if (el.paused) {
                  el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
                } else {
                  el.pause()
                }
              }}
            >
              {playing ? t.stopVoice : t.listenRecording}
            </Button>
          </>
        )}

        <label className="mt-5 block text-small font-bold text-ink-soft" htmlFor="dish-name">
          {t.dishName}
        </label>
        <input
          id="dish-name"
          value={dish}
          onChange={(e) => setDish(e.target.value)}
          className="mt-1 min-h-tap w-full rounded-chip border-2 border-line bg-paper px-3 font-display text-display font-semibold text-ink focus:border-green"
        />
        <p className="mt-1 text-small font-bold text-terracotta-dark">{t.fromHolder(recipe.from)}</p>

        <section className="mt-6" aria-label={t.ingredients}>
          <SectionLabel>{t.ingredients}</SectionLabel>
          <ul className="mt-3 flex flex-col gap-3">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id} className="rounded-card bg-paper px-4 py-2 pb-3 shadow-card">
                <EditableLine
                  words={ing.words}
                  label={ing.words}
                  onSave={(w) => editWords(id, 'ingredient', ing.id, w)}
                />
                {ing.suggestion && (
                  <SuggestionChip
                    suggestion={ing.suggestion}
                    onChange={(s) => setSuggestion(id, 'ingredient', ing.id, s)}
                  />
                )}
                {ing.unsure && <UnsureNotice holder={recipe.from} />}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8" aria-label={t.steps}>
          <SectionLabel>{t.steps}</SectionLabel>
          <ol className="mt-3 flex flex-col gap-3">
            {recipe.steps.map((step, idx) => (
              <li key={step.id} className="rounded-card bg-paper px-4 py-2 pb-3 shadow-card">
                <p className="pt-2 text-caption font-extrabold uppercase tracking-wide text-green">
                  {t.step} {idx + 1}
                </p>
                <EditableLine
                  words={step.words}
                  label={`${t.step} ${idx + 1}`}
                  onSave={(w) => editWords(id, 'step', step.id, w)}
                />
                {step.suggestion && (
                  <SuggestionChip
                    suggestion={step.suggestion}
                    onChange={(s) => setSuggestion(id, 'step', step.id, s)}
                  />
                )}
                {step.unsure && <UnsureNotice holder={recipe.from} />}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <footer className="border-t border-line bg-cream px-5 pb-6 pt-3">
        {pending > 0 && (
          <p className="mb-2 flex items-start gap-2 text-caption text-ink-soft">
            <Icon name="info" className="size-5 shrink-0" />
            <span>
              <strong className="font-extrabold text-ink">{t.pendingCount(pending)}.</strong> {t.pendingNote}
            </span>
          </p>
        )}
        <Button size="lg" icon="check" className="w-full" onClick={save}>
          {recipe.draft ? t.saveRecipe : t.saveChanges}
        </Button>
      </footer>
    </div>
  )
}
