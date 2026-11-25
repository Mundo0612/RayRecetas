# Recetas de Familia · guidelines.md

Figma: https://www.figma.com/design/Aiqcg9sqDb4rMyV9LqfziA (pages 01–03 are the source of truth)

## Product
A family cookbook where mom, tía, or abuela records her everyday dishes by talking while she cooks. Her grown kids cook from it at home. It should feel like mom's kitchen: warm, calm, unhurried. Not a recipe website.

## Rules (follow all of them)
1. Use only the Figma variables. Colors are semantic: `action/*`, `surface/*`, `text/*`, `border/*`, `feedback/*` (CSS: `var(--color-action-primary)` etc.). Never use a primitive (`terracotta/500`) or a raw hex in a screen.
2. Spacing comes from `space/1…12` (4px base: 4, 8, 12, 16, 20, 24, 32, 40, 48). Screen side padding is `space/5`; gaps between sections are `space/6`. Radii: `radius/chip` 12, `radius/card` 24, `radius/sheet` 28, `radius/full`.
3. Type: Fraunces only for `heading/display` and `heading/title` (dish names, screen titles). Everything else is Nunito Sans using the text styles (`body/*`, `label/*`). Cook-mode steps use `body/step` (26px).
4. Every tappable thing is at least 44 × 44 (`size/tap`). Buttons are 56 tall (`size/button`) and full width on mobile.
5. Use the `Button` component. One Primary per screen, for the action the screen most wants (Cocinar ahora, Guardar receta). Everything else is Secondary. Focus is a 3px `border/focus` ring with a 2px gap. Disabled always comes with a written reason.
6. Her words are sacred. Show the recipe holder's exact words inside curly quotes (`text/quote-mark`), on `surface/her-words` for intros. Never translate, correct, or rewrite them, even in English mode. Only interface labels switch with the ES/EN `Language toggle`, which appears on every screen (Spanish by default).
7. AI moments use the `Suggestion` component only: labelled SUGERENCIA, says what it's based on ("según lo que dijo: “un puñito”"), offers Aplicar and Descartar as Secondary buttons, and keeps Deshacer after either. Nothing changes until someone taps. Her original words stay above the suggestion.
8. If the app isn't sure, it says so with `Feedback message / Warning` ("No estoy seguro de la cantidad. Pregúntele a Mamá Lupe.") instead of guessing a number.
9. Feedback never relies on color alone: icon + short lead phrase ending in a period + one plain next step. Success = done, Warning = unsure, Error = something's missing and how to fix it.
10. Voice: calm, warm, usted with mom, short sentences. Never scold or alarm ("¡Error!", "Invalid input", red-only states). Mom always has the final word on her recipe.
11. Layout is a single column, 390 wide, on `surface/page`. Content groups sit on `surface/card` cards with `border/default` and `radius/card`. Section labels use `label/section` in `text/accent`.
