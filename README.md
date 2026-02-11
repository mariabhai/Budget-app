# Budget App (Vite + TypeScript)

En enkel budgetapp där du kan lägga till inkomster och utgifter, välja kategori, radera poster och se aktuell balans.

## Live

GitHub Pages:  
`https://medieinstitutet.github.io/fed25d-js-inl-2-budget-app-mariabhai/`

## Funktioner

- Lägg till utgift: beskrivning, belopp och kategori
- Lägg till inkomst: beskrivning, belopp och kategori
- Radera enskilda poster
- Balans räknas ut automatiskt (`inkomster - utgifter`)
- Balans färgkodas (`positive`, `negative`, `zero`)
- Data sparas i `localStorage`
- Kategorier laddas från `public/categories.json`
- Responsiv layout och en-vy-toggle för Utgifter/Inkomster

## Teknik

- Vite
- TypeScript
- ESLint
- Prettier

## Kom igång lokalt

```bash
npm install
npm run dev
```

Dev-servern startar på en ledig port (oftast `5173`).

## Scripts

```bash
npm run dev      # starta lokalt
npm run build    # typecheck + build
npm run preview  # förhandsvisa production-build
npm run lint     # kör eslint
npm run format   # kör prettier --write
```

## Projektstruktur

```text
.
├─ index.html
├─ public/
│  └─ categories.json
├─ src/
│  ├─ main.ts
│  ├─ models.ts
│  └─ style.css
├─ vite.config.ts
└─ .github/workflows/pages.yml
```

## TypeScript-modeller

Finns i `src/models.ts`:

- `BudgetItem` för en enskild post
- `BudgetItemLists` för listor av `expense` och `income`

## Publicering

Projektet deployas via GitHub Actions (`.github/workflows/pages.yml`) till GitHub Pages vid push till `main`.
