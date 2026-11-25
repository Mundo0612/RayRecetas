import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  family as seedFamily,
  recipes as seedRecipes,
  recordedDraft,
  type FamilyMember,
  type Ingredient,
  type Recipe,
  type Step,
  type SuggestionStatus,
} from '../data/recipes'
import { strings, type Lang, type Strings } from './i18n'

/* ---------- Routes ---------- */

export type Route =
  | { name: 'home' }
  | { name: 'record' }
  | { name: 'review'; id: string }
  | { name: 'recipe'; id: string }
  | { name: 'cook'; id: string; step: number }
  | { name: 'family' }

/* ---------- Toasts ---------- */

export type FeedbackKind = 'success' | 'warning' | 'error' | 'info'
export interface Toast {
  id: number
  kind: FeedbackKind
  lead: string
  text: string
}

/* ---------- Persistence ---------- */

const STORAGE_KEY = 'recetas-de-familia:v1'

interface Persisted {
  lang: Lang
  recipes: Recipe[]
  family: FamilyMember[]
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

function seed(): Persisted {
  return { lang: 'es', recipes: clone(seedRecipes), family: clone(seedFamily) }
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed()
    const data = JSON.parse(raw) as Persisted
    // A question still "waiting" when the page closed gets its reply now.
    data.recipes.forEach((r) =>
      r.steps.forEach((s) =>
        s.notes.forEach((n) => {
          if (!n.reply) {
            n.reply = s.mockReply
            n.answeredAt = Date.now()
          }
        }),
      ),
    )
    return data
  } catch {
    return seed()
  }
}

/* ---------- Context ---------- */

type ItemKind = 'ingredient' | 'step'

interface Store {
  lang: Lang
  t: Strings
  setLang: (l: Lang) => void

  route: Route
  go: (r: Route) => void
  replace: (r: Route) => void
  back: () => void
  home: () => void

  recipes: Recipe[]
  getRecipe: (id: string) => Recipe | undefined
  setSuggestion: (recipeId: string, kind: ItemKind, itemId: string, status: SuggestionStatus) => void
  editWords: (recipeId: string, kind: ItemKind, itemId: string, words: string) => void
  renameDish: (recipeId: string, dish: string) => void
  createDraft: (recordingUrl?: string) => string
  saveRecipe: (recipeId: string) => void
  recordingFor: (recipeId: string) => string | undefined

  askQuestion: (recipeId: string, stepId: string, question: string) => void

  family: FamilyMember[]
  invite: (name: string, relation: string) => void

  toasts: Toast[]
  notify: (kind: FeedbackKind, lead: string, text: string) => void
  dismissToast: (id: number) => void

  resetDemo: () => void
}

const Ctx = createContext<Store | null>(null)

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside StoreProvider')
  return s
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Persisted>(load)
  const [stack, setStack] = useState<Route[]>([{ name: 'home' }])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [recordings, setRecordings] = useState<Record<string, string>>({})
  const toastId = useRef(0)
  const dataRef = useRef(data)
  dataRef.current = data

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      /* storage full or blocked — prototype keeps working in memory */
    }
  }, [data])

  useEffect(() => {
    document.documentElement.lang = data.lang
  }, [data.lang])

  const t = strings[data.lang]

  /* toasts */
  const dismissToast = useCallback((id: number) => {
    setToasts((ts) => ts.filter((x) => x.id !== id))
  }, [])
  const notify = useCallback(
    (kind: FeedbackKind, lead: string, text: string) => {
      const id = ++toastId.current
      setToasts((ts) => [...ts.slice(-2), { id, kind, lead, text }])
      window.setTimeout(() => dismissToast(id), 3500)
    },
    [dismissToast],
  )

  /* routing */
  const go = useCallback((r: Route) => setStack((s) => [...s, r]), [])
  const replace = useCallback((r: Route) => setStack((s) => [...s.slice(0, -1), r]), [])
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), [])
  const home = useCallback(() => setStack([{ name: 'home' }]), [])

  /* recipe helpers */
  const updateRecipe = useCallback((id: string, fn: (r: Recipe) => Recipe) => {
    setData((d) => ({ ...d, recipes: d.recipes.map((r) => (r.id === id ? fn(r) : r)) }))
  }, [])

  const updateItem = useCallback(
    (recipeId: string, kind: ItemKind, itemId: string, fn: (i: Ingredient | Step) => Ingredient | Step) => {
      updateRecipe(recipeId, (r) =>
        kind === 'ingredient'
          ? { ...r, ingredients: r.ingredients.map((i) => (i.id === itemId ? (fn(i) as Ingredient) : i)) }
          : { ...r, steps: r.steps.map((s) => (s.id === itemId ? (fn(s) as Step) : s)) },
      )
    },
    [updateRecipe],
  )

  const setSuggestion: Store['setSuggestion'] = useCallback(
    (recipeId, kind, itemId, status) =>
      updateItem(recipeId, kind, itemId, (i) =>
        i.suggestion ? { ...i, suggestion: { ...i.suggestion, status } } : i,
      ),
    [updateItem],
  )

  // Mom has the final word: once she rewrites a line, the old suggestion
  // (based on words she no longer uses) and the "unsure" flag go away.
  const editWords: Store['editWords'] = useCallback(
    (recipeId, kind, itemId, words) =>
      updateItem(recipeId, kind, itemId, (i) =>
        i.words === words ? i : { ...i, words, suggestion: undefined, unsure: false },
      ),
    [updateItem],
  )

  const renameDish: Store['renameDish'] = useCallback(
    (recipeId, dish) => updateRecipe(recipeId, (r) => ({ ...r, dish })),
    [updateRecipe],
  )

  const createDraft = useCallback((recordingUrl?: string) => {
    const id = `grabada-${Date.now()}`
    const draft: Recipe = { ...clone(recordedDraft), id }
    draft.ingredients.forEach((i) => (i.id = `${id}-${i.id}`))
    draft.steps.forEach((s) => (s.id = `${id}-${s.id}`))
    setData((d) => ({ ...d, recipes: [...d.recipes.filter((r) => !r.draft), draft] }))
    if (recordingUrl) setRecordings((m) => ({ ...m, [id]: recordingUrl }))
    return id
  }, [])

  const saveRecipe = useCallback(
    (id: string) => updateRecipe(id, (r) => ({ ...r, draft: false })),
    [updateRecipe],
  )

  const askQuestion: Store['askQuestion'] = useCallback(
    (recipeId, stepId, question) => {
      const noteId = `n-${Date.now()}`
      updateItem(recipeId, 'step', stepId, (s) => ({
        ...(s as Step),
        notes: [...(s as Step).notes, { id: noteId, question, askedAt: Date.now() }],
      }))
      // Prototype: the holder "replies" a few seconds later.
      window.setTimeout(() => {
        const recipe = dataRef.current.recipes.find((r) => r.id === recipeId)
        const stepNumber = (recipe?.steps.findIndex((s) => s.id === stepId) ?? -1) + 1
        updateItem(recipeId, 'step', stepId, (s) => ({
          ...(s as Step),
          notes: (s as Step).notes.map((n) =>
            n.id === noteId ? { ...n, reply: (s as Step).mockReply, answeredAt: Date.now() } : n,
          ),
        }))
        if (recipe) {
          const tt = strings[dataRef.current.lang]
          notify('success', tt.replyToastLead(recipe.from), tt.replyToast(stepNumber))
        }
      }, 3500)
    },
    [updateItem, notify],
  )

  const invite = useCallback((name: string, relation: string) => {
    setData((d) => ({
      ...d,
      family: [
        ...d.family,
        { id: `m-${Date.now()}`, name, relation, role: 'cook', pending: true },
      ],
    }))
  }, [])

  const resetDemo = useCallback(() => {
    setData((d) => ({ ...seed(), lang: d.lang }))
    setRecordings({})
    setStack([{ name: 'home' }])
  }, [])

  const value = useMemo<Store>(
    () => ({
      lang: data.lang,
      t,
      setLang: (lang) => setData((d) => ({ ...d, lang })),
      route: stack[stack.length - 1],
      go,
      replace,
      back,
      home,
      recipes: data.recipes,
      getRecipe: (id) => data.recipes.find((r) => r.id === id),
      setSuggestion,
      editWords,
      renameDish,
      createDraft,
      saveRecipe,
      recordingFor: (id) => recordings[id],
      askQuestion,
      family: data.family,
      invite,
      toasts,
      notify,
      dismissToast,
      resetDemo,
    }),
    [data, t, stack, go, replace, back, home, setSuggestion, editWords, renameDish, createDraft, saveRecipe, recordings, askQuestion, invite, toasts, notify, dismissToast, resetDemo],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
