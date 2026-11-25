import { FAMILY_NAME } from '../data/recipes'
import { Icon } from '../components/Icon'
import { Button, LangToggle, PhotoPlaceholder, SectionLabel } from '../components/ui'
import { useStore } from '../lib/store'

export function Home() {
  const { t, recipes, go } = useStore()
  const saved = recipes.filter((r) => !r.draft)

  return (
    <div className="scrollbar-none flex-1 overflow-y-auto">
      <header className="rounded-b-sheet bg-green px-5 pb-6 pt-4 text-paper">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-small font-bold opacity-90">
            <Icon name="book" className="size-5" />
            {t.familyCookbook(FAMILY_NAME)}
          </span>
          <LangToggle onDark />
        </div>
        <h1 className="mt-4 font-display text-display font-semibold text-yellow">{t.appName}</h1>
        <p className="mt-1 text-body opacity-90">{t.recordRecipeHint}</p>

        <div className="mt-5 flex flex-col gap-3">
          <Button size="lg" icon="mic" onClick={() => go({ name: 'record' })} className="w-full">
            {t.recordRecipe}
          </Button>
          <button
            type="button"
            onClick={() => go({ name: 'family' })}
            className="inline-flex min-h-tap items-center justify-center gap-2 rounded-card border-2 border-paper/50 px-4 text-body font-bold text-paper hover:bg-green-dark"
          >
            <Icon name="users" />
            {t.family}
          </button>
        </div>
      </header>

      <section className="px-5 pb-8 pt-6" aria-labelledby="recipes-heading">
        <div id="recipes-heading">
          <SectionLabel>{t.recipes}</SectionLabel>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-4">
          {saved.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => go({ name: 'recipe', id: r.id })}
                className="flex h-full w-full flex-col overflow-hidden rounded-card bg-paper text-left shadow-card transition-transform hover:-translate-y-0.5"
              >
                <PhotoPlaceholder tone={r.tone} className="h-photo w-full" />
                <span className="flex flex-1 flex-col gap-1 p-3">
                  <span className="font-display text-title font-semibold leading-tight text-ink">{r.dish}</span>
                  <span className="text-small font-bold text-terracotta-dark">{t.fromHolder(r.from)}</span>
                  <span className="mt-auto text-caption text-ink-soft">{t.stepsCount(r.steps.length)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
