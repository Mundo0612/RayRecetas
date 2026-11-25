import { useState } from 'react'
import type { Recipe } from '../data/recipes'
import { Icon } from '../components/Icon'
import { Button, Feedback, HerWords, Sheet } from '../components/ui'
import { useStore } from '../lib/store'

/** Message sheet tied to the current step. Replies are saved as notes on that step. */
export function AskSheet({ recipe, stepIndex, onClose }: { recipe: Recipe; stepIndex: number; onClose: () => void }) {
  const { t, askQuestion } = useStore()
  const step = recipe.steps[stepIndex]
  const [text, setText] = useState(step.askHint)
  const [error, setError] = useState(false)
  // Only show the conversation started in this sheet; older notes live on the step itself.
  const [startCount] = useState(step.notes.length)
  const mine = step.notes.slice(startCount)
  const lastMine = mine[mine.length - 1]

  const send = () => {
    if (!text.trim()) return setError(true)
    askQuestion(recipe.id, step.id, text.trim())
    setText('')
  }

  const quick = [t.quickHowMuch, t.quickHowLong, t.quickDone]

  return (
    <Sheet
      title={t.askTitle(recipe.from)}
      onClose={onClose}
      subtitle={
        <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-terracotta-soft px-3 py-1 text-small font-bold text-terracotta-dark">
          <Icon name="flame" className="size-4" />
          {t.askContext(stepIndex + 1, step.askHint)}
        </p>
      }
    >
      <div className="rounded-chip bg-paper p-3 text-small text-ink-soft">
        <HerWords>{step.words}</HerWords>
      </div>

      {mine.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3" aria-live="polite">
          {mine.map((n) => (
            <li key={n.id} className="flex flex-col gap-2">
              <p className="ml-auto max-w-4/5 rounded-card rounded-br-chip bg-green px-4 py-2 text-body text-paper">
                {n.question}
              </p>
              {n.reply ? (
                <div className="mr-auto max-w-4/5 rounded-card rounded-bl-chip bg-yellow-soft px-4 py-2">
                  <p className="text-caption font-extrabold text-terracotta-dark">{recipe.from}</p>
                  <HerWords>{n.reply}</HerWords>
                </div>
              ) : (
                <p className="mr-auto rounded-card bg-cream-deep px-4 py-2 text-small italic text-ink-soft">
                  {t.typing(recipe.from)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {lastMine && !lastMine.reply && (
        <Feedback kind="success" lead={t.sentLead} className="mt-4">
          {t.sent(recipe.from)}
        </Feedback>
      )}
      {lastMine?.reply && (
        <Feedback kind="success" lead={t.replySavedLead} className="mt-4">
          {t.replySaved(stepIndex + 1)}
        </Feedback>
      )}

      <div className="mt-4">
        <label htmlFor="ask-text" className="text-small font-bold text-ink-soft">
          {t.yourQuestion}
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {quick.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setText(q)
                setError(false)
              }}
              className="min-h-tap rounded-full border-2 border-line bg-paper px-3 text-small font-bold text-ink hover:border-terracotta"
            >
              {q}
            </button>
          ))}
        </div>
        <textarea
          id="ask-text"
          rows={3}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setError(false)
          }}
          className="mt-3 w-full rounded-chip border-2 border-line bg-paper p-3 text-body focus:border-green"
        />
        {error && (
          <Feedback kind="error" lead={t.emptyQuestionLead} className="mt-2">
            {t.emptyQuestion}
          </Feedback>
        )}
        <Button size="lg" icon="send" className="mt-3 w-full" onClick={send}>
          {t.send}
        </Button>
      </div>
    </Sheet>
  )
}
