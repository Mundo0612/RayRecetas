import { ToastHost } from './components/ui'
import { useStore } from './lib/store'
import { Cook } from './screens/Cook'
import { Family } from './screens/Family'
import { Home } from './screens/Home'
import { RecipeDetail } from './screens/RecipeDetail'
import { Record } from './screens/Record'
import { Review } from './screens/Review'

function Screen() {
  const { route } = useStore()
  switch (route.name) {
    case 'home':
      return <Home />
    case 'record':
      return <Record />
    case 'review':
      return <Review id={route.id} />
    case 'recipe':
      return <RecipeDetail id={route.id} />
    case 'cook':
      return <Cook id={route.id} step={route.step} />
    case 'family':
      return <Family />
  }
}

/** 390 × 844 phone frame on desktop; full-screen on a real phone. */
export default function App() {
  const { route } = useStore()
  const key = JSON.stringify(route.name === 'cook' ? { ...route, step: 0 } : route)
  return (
    <div className="flex min-h-full items-center justify-center sm:p-8">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-cream sm:h-frame-h sm:w-frame-w sm:rounded-phone sm:shadow-phone">
        <main key={key} className="flex min-h-0 flex-1 flex-col animate-fade-in">
          <Screen />
        </main>
        <ToastHost />
      </div>
    </div>
  )
}
