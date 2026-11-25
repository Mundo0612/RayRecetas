import { Icon } from '../components/Icon'
import {
  Button,
  HerWords,
  IconButton,
  LangToggle,
  PhotoPlaceholder,
  SectionLabel,
  SuggestionChip,
  UnsureNotice,
} from '../components/ui'
import { useStore } from '../lib/store'

export function RecipeDetail({ id }: { id: string }) {
  const { t, getRecipe, go, back } = useStore()
  const recipe = getRecipe(id)
  if (!recipe) return null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="scrollbar-none flex-1 overflow-y-auto">
        <div className="relative">
          <PhotoPlaceholder tone={recipe.tone} className="h-hero w-full" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <IconButton icon="back" label={t.back} onClick={back} className="bg-paper shadow-card" />
            <LangToggle />
          </div>
        </div>

        <div className="-mt-6 relative rounded-t-sheet bg-cream px-5 pb-8 pt-6">
          <h1 className="font-display text-display font-semibold text-ink">{recipe.dish}</h1>
          <p className="mt-1 text-body font-bold text-terracotta-dark">{t.fromHolder(recipe.from)}</p>

          <div className="mt-4 rounded-card bg-yellow-soft p-4">
            <HerWords>{recipe.intro}</HerWords>
            <p className="mt-1 text-caption font-bold text-ink-soft">— {recipe.from}</p>
          </div>

          <div className="mt-5">
            <p className="flex items-center gap-2 text-small font-bold text-ink-soft">
              <Icon name="users" className="size-5" />
              {t.sharedWith}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {recipe.sharedWith.map((n) => (
                <li key={n} className="rounded-full bg-green-soft px-3 py-1 text-small font-bold text-green">
                  {n}
                </li>
              ))}
            </ul>
          </div>

          <section className="mt-7" aria-label={t.ingredients}>
            <SectionLabel>{t.ingredients}</SectionLabel>
            <ul className="mt-3 divide-y divide-line rounded-card bg-paper px-4 shadow-card">
              {recipe.ingredients.map((ing) => (
                <li key={ing.id} className="flex gap-3 py-3">
                  <span className="mt-2.5 size-2 shrink-0 rounded-full bg-terracotta" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-body text-ink">{ing.words}</p>
                    {ing.suggestion && <SuggestionChip suggestion={ing.suggestion} compact />}
                    {ing.unsure && <UnsureNotice holder={recipe.from} />}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-6 flex items-center gap-2 text-small text-ink-soft">
            <Icon name="flame" className="size-5 text-terracotta" />
            {t.stepsPreview(recipe.steps.length)}
          </p>

          <Button
            variant="secondary"
            icon="edit"
            className="mt-4 w-full"
            onClick={() => go({ name: 'review', id })}
          >
            {t.reviewForHolder(recipe.from)}
          </Button>
        </div>
      </div>

      <footer className="border-t border-line bg-cream px-5 pb-6 pt-3">
        <Button size="lg" icon="flame" className="w-full" onClick={() => go({ name: 'cook', id, step: 0 })}>
          {t.cookNow}
        </Button>
      </footer>
    </div>
  )
}
