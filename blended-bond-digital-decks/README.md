# Blended Bond Digital Decks

Mobile-first digital conversation decks for Blended Bond. The project is still a static website, but it is now organized so each deck shares the same structure, styling system, and JavaScript behavior.

## Current Flow

1. Password entry
2. Loading screen
3. Welcome page
4. How to use
5. Understanding symbols
6. Explore the deck
7. Saved prompts
8. Next steps
9. Global slide-out navigation

## Project Structure

```text
blended-bond-digital-decks/
  index.html                 Root password page
  access.js                  Password routing behavior
  styles.css                 Global brand system and all deck styling
  script.js                  Shared deck behavior
  deck-configs.js            Deck data: card files, categories, symbols, order
  assets/
    cards/                   Shared card PNGs
    navigation/              Logos and CTA icons
    symbols/                 Brand elements and category icons
  decks/
    mini-guide/
    full-deck/
    before-the-blend/
```

## Shared Deck Structure

Every deck folder uses the same six page files:

```text
index.html       Welcome page
how-to.html      How to use page
symbols.html     Understanding symbols page
deck.html        Swipe/tap card deck page
saved.html       Saved prompts page
next-steps.html  Product and social CTA page
```

Each page loads the same three shared files:

```html
<link rel="stylesheet" href="../../styles.css?v=brand-cleanup-41" />
<script src="../../deck-configs.js?v=brand-cleanup-41"></script>
<script src="../../script.js?v=brand-cleanup-41" defer></script>
```

This means most future deck work should happen in:

- `deck-configs.js` for deck data
- `styles.css` for brand colors and visual rules
- The six deck HTML files only for page-specific copy

## Brand System

Deck-specific colors are controlled by the body theme class:

```html
<body class="theme-mini-guide">
<body class="theme-full-deck">
<body class="theme-before-the-blend">
```

The global CSS uses custom properties like `--deck-accent`, `--deck-secondary`, `--deck-page-surface`, and `--deck-text-strong` so each deck can feel branded while keeping the same layout and interaction structure.

When adding a new deck, add a new theme block in `styles.css` instead of styling each page separately.

## Add A New Deck

1. Create a folder:

```text
decks/new-deck-name/
```

2. Copy the six HTML files from the closest existing deck.

3. Update each copied file:

- Page `<title>`
- Body class, for example `theme-new-deck-name`
- Welcome, how-to, symbols, saved, and next-steps copy
- Logo file only if that deck uses a different approved logo

4. Add card PNGs to:

```text
assets/cards/newdeckfolder/
```

5. Add a config block in `deck-configs.js`:

```js
"new-deck-name": {
  productName: "New Deck Name",
  storageKey: "blendedBondSavedPromptsNewDeckName",
  assetsBase: "../../assets",
  sharedAssetsBase: "../../assets",
  shuffleCards: true,
  cardImageFiles: cardFiles("newdeckfolder", [1, 2, 3, 4]),
  cardCategories: {
    "1.png": "Start",
    "2.png": "Connection",
    "3.png": "Trust",
    "4.png": "Growth"
  },
  categoryOrder: ["connection", "trust", "growth"],
  categoryDefinitions: [
    { name: "Connection", symbol: "Connection", icon: "element5.png", description: "Short description here." },
    { name: "Trust", symbol: "Trust", icon: "Element 329.png", description: "Short description here." },
    { name: "Growth", symbol: "Growth", icon: "Element 332.png", description: "Short description here." }
  ]
}
```

6. Add password routing in `access.js`:

```js
{
  password: "NEWDECKPASSWORD",
  path: "decks/new-deck-name/index.html"
}
```

7. Add theme colors in `styles.css`:

```css
body.theme-new-deck-name {
  --deck-accent: #000000;
  --deck-accent-contrast: var(--cream);
  --deck-secondary: #f7f3e9;
  --deck-text-strong: var(--charcoal);
  --deck-page-surface: #f7f5f2;
  --deck-page-quiet: #f7f5f2;
}
```

8. Update the cache version on the copied HTML files after CSS or JS changes:

```text
brand-cleanup-41 -> brand-cleanup-42
```

## Deck Config Rules

- `productName` appears on the opening card fallback and internal labels.
- `storageKey` must be unique so saved cards do not mix across decks.
- `cardImageFiles` controls deck order.
- `cardCategories` controls filtering, saved categories, and category navigation.
- `categoryOrder` controls the order of category buttons and cards.
- `categoryDefinitions` controls the Understanding symbols accordion.
- `icon` must match a file in `assets/symbols/`.

## User Experience Rules

Keep these consistent across all decks:

- Same six-page flow.
- Same global header and slide-out navigation.
- Same saved-card behavior.
- Same card controls: skip, save, shuffle.
- Same next-steps CTA structure.
- Deck-specific color only through theme variables and approved brand assets.

This gives users a familiar flow even when each deck has its own personality.

## Future Digital App Path

The current static setup is intentionally close to an app structure:

- `deck-configs.js` can become JSON or app data.
- Each HTML page can become a reusable screen/component.
- `script.js` behavior can become app state and routing.
- `localStorage` saved prompts can become device storage, account storage, or cloud sync.
- Password routing should become real authentication before launch.

For a future application, the clean migration path is:

1. Keep `deck-configs.js` as the source of truth.
2. Move each page type into a reusable component.
3. Replace page reloads with app routes.
4. Replace `localStorage` with the app storage strategy.
5. Replace front-end passwords with server-side access control.

## Important Security Note

The current password system is front-end only. It is useful for a prototype, but it is not secure for paid-content protection because passwords and deck paths are visible in browser code.

Before launch, use server-side authentication such as Shopify customer access, Cloudflare Access, a serverless function, or another protected delivery system.

## QA Checklist

Test every deck on mobile width and desktop width:

- Password opens the correct deck.
- Header icons and logo match the deck brand.
- Navigation opens, closes, and highlights the current page.
- Category filters match the cards shown.
- Save button toggles saved state.
- Saved prompts are isolated to the correct deck.
- Empty saved states are readable and on brand.
- Next-steps CTAs open the correct links.
- Text does not overlap artwork or buttons.
- Background elements are visible but do not compete with content.
