# Recetas de Familia

A clickable mobile prototype for a family cookbook. Mom, tía, or abuela records her everyday dishes by talking while she cooks, and her grown kids cook from it at home, in her own words, in Spanish or English.

Built for user testing in a design class. No backend, no login.

## Run the prototype

```bash
npm install
npm run dev
```

Open http://localhost:5173 in Chrome. The app shows inside a 390 × 844 phone frame on desktop, and full screen on a phone.

- Sample recipes: `src/data/recipes.ts`
- Interface labels (ES/EN): `src/lib/i18n.ts`
- Design tokens: `src/index.css` (`@theme`)
- Between test sessions: Familia → "Reiniciar la demostración" clears saved changes.

## Design system

- **Figma:** [Recetas de Familia · Design System](https://www.figma.com/design/Aiqcg9sqDb4rMyV9LqfziA)
  - 01 · Foundations: color styles and variables, text styles, spacing scale on a 4px base
  - 02 · Components: Button (Primary/Secondary × Default/Hover/Pressed/Focus/Disabled), Feedback message, Suggestion, Language toggle, Checkbox
  - 03 · Prototype · Receta: the designed Recipe screen
  - 04 · Guidelines: the spec below, in a labeled frame
  - 05 · AI Build + Stress test: screenshots and the written comparison
- **Guidelines:** [`guidelines.md`](guidelines.md) is v2, the current version. Round 1 is kept in [`design-system/guidelines.v1.md`](design-system/guidelines.v1.md).

### AI build test

Each page was built by Claude in a fresh session that only had the Figma file and `guidelines.md`. It never saw the app code. Open any `index.html` directly in a browser.

| Build | What it is | Screenshot |
|---|---|---|
| [`a-receta`](design-system/ai-builds/a-receta/index.html) | The designed Recipe page, built from Figma | [png](design-system/screenshots/a-receta.png) |
| [`b-lista`](design-system/ai-builds/b-lista/index.html) | Stress test: a shopping list page that was never designed (guidelines v1) | [png](design-system/screenshots/b-lista-round1.png) |
| [`b2-lista`](design-system/ai-builds/b2-lista/index.html) | Same stress test after fixing the system (guidelines v2 + Checkbox) | [png](design-system/screenshots/b2-lista-round2.png) |

**What changed between rounds:** round 1 stacked six AI suggestions in a row and invented its own checkbox and progress bar. It also surfaced a contradiction about quoting her words. Round 2 added a Checkbox component, five missing variables, and written limits: at most two open suggestions, when to quote, and what "al gusto" means. That fixed all of it. The full comparison is on page 05 in Figma.
