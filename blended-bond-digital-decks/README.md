# Blended Bond Digital Decks

This project is a static, mobile-first digital deck experience for Blended Bond products. It includes a password entry page, individual deck homepages, swipeable prompt decks, symbol explanations, saved prompts, and next-step calls to action.

The current build is intentionally simple: plain HTML, CSS, and JavaScript. It can be hosted as static files, but the structure is close enough to an app that it can be handed off later for a full digital application.

## Current User Flow

1. User opens the root password page.
2. User enters a deck password.
3. A branded loading screen appears.
4. User lands on the selected deck homepage.
5. User can read how to use the deck, review symbol meanings, swipe through prompts, save prompts, revisit saved prompts, and view next steps.

## Design Summary

The site is designed to feel like a calm, branded digital companion to the physical Blended Bond deck. The experience should stay simple, warm, and easy to use on a phone.

Core design rules:

- Mobile-first layout with desktop support.
- Shared header, footer, slide-out navigation, and page structure across all decks.
- Deck-specific colors and logos through CSS theme classes.
- Swipe language for digital use, not physical "pull a card" language.
- "Prompts" is the preferred user-facing word for saved items and interactions.
- "Card" is still used internally for visual elements and image assets.
- Home Screen save instructions are short and phone-friendly.
- Background symbols should support the brand without overlapping text or controls.

## File Map

```text
blended-bond-digital-decks/
  index.html
  access.js
  styles.css
  script.js
  deck-configs.js
  manifest.json
  README.md
  assets/
  decks/
```

## Root Files

`index.html`

Root password entry page. It contains the welcome/password form, the short Home Screen reminder, and the loading screen markup.

`access.js`

Handles password matching and routes users to the correct deck folder. This is front-end only and should not be treated as secure access control.

`styles.css`

Global design system and all shared styling. This file controls layout, colors, typography, deck themes, navigation, loading screen, swipe deck UI, saved prompts, and responsive behavior.

`script.js`

Shared deck behavior. It handles routing between pages, menu behavior, prompt rendering, swipe gestures, save/unsave behavior, saved prompt lists, category filters, image preloading, and deck progress.

`deck-configs.js`

Source of truth for deck data. It defines card image order, category mapping, category descriptions, symbols, product names, storage keys, and deck-specific config.

`manifest.json`

Root web app manifest for install/app-like behavior. Each deck also has its own manifest.

`README.md`

Developer handoff and maintenance notes.

## Asset Folders

`assets/navigation/`

Shared logo files and navigation/social icons.

`assets/symbols/`

Decorative brand symbols and category icons used across pages, loading screens, accordions, and backgrounds.

`assets/app-icons/`

Icons used by manifests and Home Screen/PWA-style installs.

`assets/cards/`

Main shared prompt card images:

```text
assets/cards/miniguide/
assets/cards/fulldeck/
assets/cards/beforetheblend/
```

`assets/signature.png`

Ashley signature image used on welcome pages.

## Deck Folder Structure

Each deck folder uses the same page set:

```text
decks/{deck-name}/
  index.html       Welcome page
  how-to.html      How to use page
  symbols.html     Understanding symbols page
  deck.html        Swipeable prompt deck page
  saved.html       Saved prompts page
  next-steps.html  Product/social CTA page
  manifest.json    Deck-specific web app manifest
```

Current decks:

```text
decks/mini-guide/
decks/full-deck/
decks/before-the-blend/
```

Each deck page loads the shared CSS and JS from the root:

```html
<link rel="stylesheet" href="../../styles.css?v=brand-cleanup-42" />
<script src="../../deck-configs.js?v=brand-cleanup-42"></script>
<script src="../../script.js?v=brand-cleanup-42" defer></script>
```

When shared CSS or JS changes, update the version query string on deck pages so mobile browsers do not serve old cached files.

## Deck Page Responsibilities

`index.html`

Deck welcome copy, Home Screen save instructions, and primary buttons.

`how-to.html`

Usage guidance and the symbol accordion container. The accordion content comes from `deck-configs.js`.

`symbols.html`

Dedicated symbol explanation page. Uses shared script/config behavior for category definitions.

`deck.html`

Swipeable prompt interface. Contains the prompt card container, category filters, swipe note, skip/save/mix controls, and progress text.

`saved.html`

Saved prompts hub. Shows saved categories, view-all-saved button, empty state, and saved prompt list container.

`next-steps.html`

Post-deck CTA copy and outbound links.

`manifest.json`

Deck-specific app name, short name, start URL, display mode, theme color, and icons.

## Theme System

Deck styling is controlled by body classes:

```html
<body class="theme-mini-guide">
<body class="theme-full-deck">
<body class="theme-before-the-blend">
```

Theme variables live in `styles.css`. Add or adjust deck branding there instead of styling individual pages one by one.

Important theme concepts:

- `--green`, `--green-deep`, `--green-mid`, and related variables set the core palette.
- `--deck-background`, `--deck-surface`, and `--deck-surface-soft` control deck surfaces.
- Shared layout classes keep pages consistent across products.

## Content Language Rules

Use digital deck wording:

- Prefer "swipe through prompts."
- Prefer "saved prompts."
- Prefer "mix prompts" over "shuffle prompts" in user-facing labels.
- Avoid "pull a card," "draw a card," "deal," or "flip" unless discussing the physical product.
- Use "card" only when describing the visual card image, code classes, or physical product CTAs.

## Add A New Deck

1. Create a new folder:

```text
decks/new-deck-name/
```

2. Copy the six HTML page files and `manifest.json` from the closest existing deck.

3. Update each copied page:

- Page `<title>` and meta description.
- Body theme class.
- Welcome/how-to/next-steps copy.
- Logo and app icon paths if needed.
- Cache version query strings.

4. Add card PNGs:

```text
assets/cards/newdeckfolder/
```

5. Add a new config in `deck-configs.js`:

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
    "2.png": "Connection"
  },
  categoryOrder: ["connection"],
  categoryDefinitions: [
    {
      name: "Connection",
      symbol: "Connection",
      icon: "element5.png",
      description: "Short category description."
    }
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

7. Add a theme block in `styles.css`.

8. Test the full flow on phone width and desktop width.

## Future Digital Application Handoff

This static project can become a full digital application without starting over. A future developer should treat the current files as a working prototype and content map.

Recommended app direction:

- Convert deck pages into reusable screens/components.
- Convert `deck-configs.js` into JSON, database records, or CMS-managed content.
- Replace page reload navigation with app routing.
- Replace `localStorage` saved prompts with authenticated user storage.
- Replace front-end passwords with secure server-side access.
- Add account login, purchase validation, or license-based access.
- Add analytics for deck opens, saved prompts, and completion behavior.
- Add service worker caching for offline or low-signal use.
- Improve install flow with a proper PWA install prompt where supported.

Suggested app architecture:

```text
App
  Auth / Access
  Deck Library
  Deck Home
  How To
  Symbol Guide
  Swipe Prompt Experience
  Saved Prompts
  Next Steps
  Account / Device Install Help
```

Data models to plan for:

- `Deck`: name, slug, theme, icon, manifest info.
- `Prompt`: deck id, image, category, order, metadata.
- `Category`: name, slug, symbol, icon, description.
- `SavedPrompt`: user id, deck id, prompt id, saved date.
- `AccessGrant`: user id, deck id, purchase/license source.

Security note for future app:

The current password system is visible in browser code. For paid or private content, move access checks to a server, membership platform, Shopify customer flow, Cloudflare Access, Supabase auth, Firebase auth, or another secure system.

## QA Checklist

Test every deck after copy, image, CSS, or JS changes:

- Password opens the correct deck.
- Loading screen does not overlap on mobile.
- Header logo and icons match the deck brand.
- Slide-out navigation opens, closes, and routes correctly.
- Welcome copy and Home Screen instructions are readable.
- How-to copy uses digital prompt language.
- Symbol accordion content matches the deck config.
- Category filters show the right prompts.
- Swipe gestures work on mobile.
- Skip, save, and mix controls work.
- Saved prompts stay isolated by deck.
- Empty saved states are readable.
- Next-step links open correctly.
- Text does not overlap symbols, buttons, or card artwork.
- Mobile Safari and Android Chrome layouts both remain usable.
