"use strict";

function getDeckIdFromPath() {
  const match = window.location.pathname.match(/\/decks\/([^/]+)\//);
  return match ? match[1] : "";
}

const deckId = window.DECK_ID || getDeckIdFromPath();
const deckConfig = window.DECK_CONFIG || window.BLENDED_BOND_DECKS?.[deckId] || {};
const productName = deckConfig.productName || "Blended Bond";
const assetsBase = deckConfig.assetsBase || "assets";
const sharedAssetsBase = deckConfig.sharedAssetsBase || "assets";
const shuffleCardsByDefault = deckConfig.shuffleCards !== false;

const cardImageFiles = deckConfig.cardImageFiles || [
  "1.png",
  "4.png",
  "5.png",
  "6.png",
  "7.png",
  "8.png",
  "9.png",
  "10.png",
  "11.png",
  "12.png",
  "13.png"
];

const cardCategoryByFile = deckConfig.cardCategories || {
  "1.png": "Start",
  "4.png": "Connection",
  "5.png": "Connection",
  "6.png": "Connection",
  "7.png": "Growth",
  "8.png": "Growth",
  "9.png": "Growth",
  "10.png": "Trust",
  "11.png": "Trust",
  "12.png": "Trust",
  "13.png": "Together"
};

function getCardCategory(fileName, index) {
  const baseName = fileName.split("/").pop();
  return cardCategoryByFile[fileName] || cardCategoryByFile[baseName] || (index === 0 ? "Start" : "Prompt");
}

const prompts = cardImageFiles.map((fileName, index) => ({
  id: index + 1,
  category: getCardCategory(fileName, index),
  symbol: "",
  question: index === 0 ? productName : "Card " + fileName.replace(".png", ""),
  image: assetsBase + "/cards/" + fileName
}));

const defaultCategoryDefinitions = [
  { name: "Connection", symbol: "Hands", icon: sharedAssetsBase + "/symbols/element5.png", description: "Invites your family to slow down, connect emotionally, and better understand one another." },
  { name: "Growth", symbol: "Sprout", icon: sharedAssetsBase + "/symbols/Element 332.png", description: "Creates space to notice progress, discuss change, and imagine what your family can build next." },
  { name: "Trust", symbol: "Handshake", icon: sharedAssetsBase + "/symbols/Element 329.png", description: "Supports honest conversations about safety, reliability, boundaries, and repair." },
  { name: "Together", symbol: "Link", icon: sharedAssetsBase + "/symbols/Element 315.png", description: "Focuses on shared experiences, teamwork, belonging, and the family culture you are creating." }
];

function resolveSymbolIcon(icon) {
  if (!icon) return "";
  if (/^(https?:|\.{0,2}\/|\/)/.test(icon)) return icon;
  return sharedAssetsBase + "/symbols/" + icon;
}

function categorySlug(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const configuredCategoryOrder = deckConfig.categoryOrder || [];

function resolveCategoryIcon(item) {
  return resolveSymbolIcon(item.icon);
}

const categoryDefinitions = (deckConfig.categoryDefinitions || defaultCategoryDefinitions).map(item => ({
  ...item,
  slug: item.slug || categorySlug(item.name),
  icon: resolveCategoryIcon(item)
})).sort((a, b) => {
  if (!configuredCategoryOrder.length) return 0;
  const aIndex = configuredCategoryOrder.indexOf(a.slug);
  const bIndex = configuredCategoryOrder.indexOf(b.slug);
  return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
});

const STORAGE_KEY = deckConfig.storageKey || "blendedBondSavedPrompts";
const cardImageCache = new Map();

let currentIndex = 0;
let activeSavedFilter = "All";
let activeDeckFilter = new URLSearchParams(window.location.search).get("category") || "All";
let showSavedOnlyDeck = new URLSearchParams(window.location.search).get("saved") === "1";
let deckOrder = buildDeckOrder();
let dragStartX = 0;
let dragCurrentX = 0;
let isDraggingCard = false;

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const pageMap = {
  welcome: "index.html",
  "how-to": "how-to.html",
  prompts: "symbols.html",
  deck: "deck.html",
  saved: "saved.html",
  "next-steps": "next-steps.html"
};

const patternSymbols = [
  { src: "Element 303.png", x: 8, y: 17, size: 106, rotate: -14, opacity: .16 },
  { src: "Element 285.png", x: 87, y: 18, size: 94, rotate: 12, opacity: .14 },
  { src: "Element 315.png", x: 1, y: 36, size: 128, rotate: 8, opacity: .12 },
  { src: "Element 329.png", x: 94, y: 36, size: 106, rotate: -9, opacity: .17 },
  { src: "element5.png", x: 14, y: 54, size: 92, rotate: -18, opacity: .15 },
  { src: "Element 316.png", x: 94, y: 55, size: 104, rotate: 10, opacity: .16 },
  { src: "element4.png", x: 5, y: 72, size: 100, rotate: 15, opacity: .16 },
  { src: "Element 348.png", x: 86, y: 73, size: 122, rotate: -12, opacity: .13 },
  { src: "element6.png", x: 24, y: 88, size: 84, rotate: -7, opacity: .14 },
  { src: "element7.png", x: 75, y: 90, size: 86, rotate: 11, opacity: .14 }
];

const savedPatternOverrides = [
  { x: -2, y: 12, rotate: -10, opacity: .11 },
  { x: 95, y: 20, rotate: 10, opacity: .12 },
  { x: 12, y: 38, rotate: 13, opacity: .1 },
  { x: 96, y: 48, rotate: -8, opacity: .11 },
  { x: -4, y: 64, rotate: 2, opacity: .11 },
  { x: 94, y: 77, rotate: 13, opacity: .11 },
  { x: 4, y: 89, rotate: -12, opacity: .11 },
  { x: 78, y: 95, rotate: 9, opacity: .1 }
];

function getSavedIds() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function setSavedIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
  updateSavedUI();
}

function isSaved(id) {
  return getSavedIds().includes(id);
}

function toggleSaved(id) {
  const savedIds = getSavedIds();
  setSavedIds(isSaved(id) ? savedIds.filter(savedId => savedId !== id) : [...savedIds, id]);
}

function shuffleItems(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function sortPromptsByCategoryOrder(items) {
  if (!configuredCategoryOrder.length) return items;

  return [...items].sort((a, b) => {
    if (a.category === "Start") return -1;
    if (b.category === "Start") return 1;

    const aIndex = configuredCategoryOrder.indexOf(categorySlug(a.category));
    const bIndex = configuredCategoryOrder.indexOf(categorySlug(b.category));
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}

function buildDeckOrder(filter = activeDeckFilter, options = {}) {
  const keepOpeningCard = options.keepOpeningCard ?? true;
  const shouldShuffle = options.forceShuffle || shuffleCardsByDefault;
  const sourcePrompts = sortPromptsByCategoryOrder(showSavedOnlyDeck
    ? prompts.filter(prompt => getSavedIds().includes(prompt.id))
    : prompts);

  if (filter !== "All") {
    const categoryCards = sourcePrompts.filter(prompt => prompt.category === filter);
    return categoryCards.length ? (shouldShuffle ? shuffleItems(categoryCards) : categoryCards) : [];
  }

  if (!keepOpeningCard) return shouldShuffle ? shuffleItems(sourcePrompts) : sourcePrompts;

  const [openingCard, ...remainingCards] = sourcePrompts;
  return openingCard ? [openingCard, ...(shouldShuffle ? shuffleItems(remainingCards) : remainingCards)] : [];
}

function navigateTo(routeName) {
  const page = pageMap[routeName];
  if (page) window.location.href = page;
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function getCurrentRouteName() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  return Object.entries(pageMap).find(([, page]) => page === currentPage)?.[0] || "welcome";
}

function syncNavigationState() {
  const currentRoute = getCurrentRouteName();
  $$(".site-nav .nav-links button[data-route]").forEach(button => {
    const isCurrent = button.dataset.route === currentRoute;
    button.classList.toggle("is-current", isCurrent);
    if (isCurrent) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function openMenu() {
  const nav = $("#site-nav");
  const menuButton = $("#menu-button");
  const overlay = $("#nav-overlay");
  if (!nav || !menuButton || !overlay) return;

  nav.classList.add("is-open");
  nav.setAttribute("aria-hidden", "false");
  menuButton.setAttribute("aria-expanded", "true");
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  $("#close-menu")?.focus();
}

function closeMenu() {
  const nav = $("#site-nav");
  const menuButton = $("#menu-button");
  const overlay = $("#nav-overlay");
  if (!nav || !menuButton || !overlay) return;

  nav.classList.remove("is-open");
  nav.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");
  overlay.hidden = true;
  document.body.style.overflow = "";
}

function buildAccordion(container) {
  if (!container) return;

  container.innerHTML = categoryDefinitions.map((item, index) => `
    <article class="accordion-item category-${item.slug}">
      <button class="accordion-trigger" type="button" aria-expanded="false" aria-controls="panel-${container.id}-${index}">
        <span class="accordion-symbol" aria-hidden="true">
          <img src="${item.icon}" alt="" onerror="this.hidden=true" />
          <span>${item.symbol}</span>
        </span>
        <span class="accordion-label">${item.name}</span>
        <span aria-hidden="true">+</span>
      </button>
      <div class="accordion-panel" id="panel-${container.id}-${index}" hidden>
        <p>${item.description}</p>
      </div>
    </article>
  `).join("");

  $$(".accordion-trigger", container).forEach(button => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      button.lastElementChild.textContent = expanded ? "+" : "-";
      document.getElementById(button.getAttribute("aria-controls")).hidden = expanded;
    });
  });
}

function buildElementPattern() {
  const page = $("#deck");
  if (!page || $(".element-pattern", page)) return;

  const pattern = document.createElement("div");
  pattern.className = "element-pattern";
  pattern.setAttribute("aria-hidden", "true");

  patternSymbols.forEach((symbol, index) => {
    const settings = { ...symbol };
    const image = document.createElement("img");
    image.className = "pattern-symbol";
    image.src = sharedAssetsBase + "/symbols/" + symbol.src;
    image.alt = "";
    image.style.setProperty("--symbol-x", settings.x + "%");
    image.style.setProperty("--symbol-y", settings.y + "%");
    image.style.setProperty("--symbol-size", settings.size + "px");
    image.style.setProperty("--symbol-rotate", settings.rotate + "deg");
    image.style.setProperty("--symbol-opacity", settings.opacity);
    pattern.appendChild(image);
  });

  page.prepend(pattern);
}

function buildHowToSymbols() {
  const page = $("#how-to");
  const pageInner = $("#how-to .page-inner");
  if (!page || !pageInner) return;

  if (!$(".how-to-decor", pageInner)) {
    const decor = document.createElement("img");
    decor.className = "how-to-decor";
    decor.src = sharedAssetsBase + "/symbols/Element 303.png";
    decor.alt = "";
    decor.setAttribute("aria-hidden", "true");
    pageInner.prepend(decor);
  }

  $$(".simple-list li", page).forEach(item => {
    if ($(".bullet-image", item)) return;

    const bullet = document.createElement("img");
    bullet.className = "bullet-image";
    bullet.src = sharedAssetsBase + "/symbols/Element 281.png";
    bullet.alt = "";
    bullet.setAttribute("aria-hidden", "true");
    item.prepend(bullet);
  });
}

function syncDeckTitle() {
  const title = $("#deck-title");
  if (!title) return;

  title.textContent = showSavedOnlyDeck ? "SAVED PROMPTS" : "EXPLORE THE DECK";
}

function currentPrompt() {
  return deckOrder[currentIndex];
}

function preloadCardImages() {
  prompts.forEach(prompt => {
    if (cardImageCache.has(prompt.image)) return;

    const image = new Image();
    image.decoding = "async";
    image.src = prompt.image;
    cardImageCache.set(prompt.image, image);
  });
}

function syncSavedBadge(prompt = currentPrompt()) {
  const savedBadge = $(".card-save-badge");
  if (savedBadge) savedBadge.hidden = !prompt || !isSaved(prompt.id);
}

function renderCurrentCard() {
  const prompt = currentPrompt();
  const card = $("#prompt-card");
  const cardImage = $("#card-image");
  const cardFallback = $("#card-fallback");
  if (!card || !cardFallback) return;
  let savedBadge = $(".card-save-badge");
  if (card && !savedBadge) {
    savedBadge = document.createElement("span");
    savedBadge.className = "card-save-badge";
    savedBadge.textContent = "Saved";
    card.append(savedBadge);
  }
  if (!prompt) {
    card?.classList.remove("is-loading");
    card.classList.remove("has-card-image");
    card.style.removeProperty("background-image");
    if (cardImage) cardImage.hidden = true;
    cardFallback.hidden = false;
    syncSavedBadge(prompt);
    $("#card-category").textContent = "Saved";
    $("#card-question").textContent = "No saved cards in this category yet.";
    $("#card-symbol").textContent = "";
    updateDeckControls();
    return;
  }

  $("#card-category").textContent = prompt.category;
  $("#card-question").textContent = prompt.question;
  $("#card-symbol").textContent = prompt.symbol;
  syncSavedBadge(prompt);
  card?.classList.remove("is-loading");
  cardFallback.hidden = true;
  const resolvedImage = new URL(prompt.image, window.location.href).href;
  card.classList.add("has-card-image");
  card.style.backgroundImage = `url("${resolvedImage}")`;
  card.setAttribute("aria-label", `${prompt.category} prompt card: ${prompt.question}`);
  if (cardImage) cardImage.hidden = true;
  updateDeckControls();
}

function updateDeckControls() {
  const saveButton = $("#save-card");
  const progress = $("#deck-progress");
  const prompt = currentPrompt();

  if (saveButton) {
    if (!prompt) {
      saveButton.setAttribute("aria-pressed", "false");
      saveButton.textContent = "\u2606";
      saveButton.disabled = true;
    } else {
      saveButton.disabled = false;
      saveButton.setAttribute("aria-pressed", String(isSaved(prompt.id)));
      saveButton.textContent = isSaved(prompt.id) ? "\u2605" : "\u2606";
    }
  }
  syncSavedBadge(prompt);
  if (progress) progress.textContent = deckOrder.length ? `${currentIndex + 1} of ${deckOrder.length}` : "0 of 0";
}

function moveToNextCard(direction = "left") {
  const card = $("#prompt-card");
  if (!card || !deckOrder.length) return;

  card.style.removeProperty("--drag-x");
  card.style.removeProperty("--drag-rotate");
  card.classList.add(direction === "right" ? "is-exiting-right" : "is-exiting-left");

  window.setTimeout(() => {
    currentIndex = (currentIndex + 1) % deckOrder.length;
    renderCurrentCard();
    card.classList.remove("is-exiting-left", "is-exiting-right");
  }, 240);
}

function shuffleDeck() {
  const previousPrompt = currentPrompt();
  deckOrder = buildDeckOrder(activeDeckFilter, { keepOpeningCard: false, forceShuffle: true });
  if (deckOrder.length > 1 && previousPrompt && deckOrder[0]?.id === previousPrompt.id) {
    deckOrder.push(deckOrder.shift());
  }
  currentIndex = 0;
  renderCurrentCard();
}

function startCardDrag(event) {
  isDraggingCard = true;
  dragStartX = event.clientX;
  dragCurrentX = event.clientX;
  $("#prompt-card")?.classList.add("is-dragging");
}

function updateCardDrag(event) {
  if (!isDraggingCard) return;

  dragCurrentX = event.clientX;
  const distance = dragCurrentX - dragStartX;
  const rotation = Math.max(-12, Math.min(12, distance / 18));
  const card = $("#prompt-card");
  if (!card) return;

  card.style.setProperty("--drag-x", `${distance}px`);
  card.style.setProperty("--drag-rotate", `${rotation}deg`);
}

function endCardDrag() {
  if (!isDraggingCard) return;

  isDraggingCard = false;
  const distance = dragCurrentX - dragStartX;
  const card = $("#prompt-card");
  if (!card) return;

  card.classList.remove("is-dragging");
  if (Math.abs(distance) > 90) {
    moveToNextCard(distance > 0 ? "right" : "left");
    return;
  }

  card.style.removeProperty("--drag-x");
  card.style.removeProperty("--drag-rotate");
}

function buildSavedFilters() {
  const container = $("#saved-filters");
  if (!container) return;

  container.innerHTML = buildFilterButtons(activeSavedFilter);

  $$("[data-filter]", container).forEach(button => {
    button.addEventListener("click", () => {
      activeSavedFilter = button.dataset.filter;
      renderSavedPrompts();
    });
  });
}

function buildSavedCategoryHub() {
  const container = $("#saved-category-list");
  if (!container) return;

  const savedIds = getSavedIds();
  const savedPrompts = prompts.filter(prompt => savedIds.includes(prompt.id));
  const categoryRows = categoryDefinitions.map(category => {
    const count = savedPrompts.filter(prompt => prompt.category === category.name).length;
    return `
      <button class="saved-category-button category-${category.slug}" type="button" data-saved-category="${category.name}" aria-label="Open ${category.name} saved cards">
        <span class="saved-category-symbol" aria-hidden="true">
          <img src="${category.icon}" alt="" />
        </span>
        <span>${category.name} (${count})</span>
      </button>
    `;
  }).join("");

  container.innerHTML = categoryRows;
  $$("[data-saved-category]", container).forEach(button => {
    button.addEventListener("click", () => {
      window.location.href = `deck.html?saved=1&category=${encodeURIComponent(button.dataset.savedCategory)}`;
    });
  });
}

function buildDeckFilters() {
  const container = $("#deck-filters");
  if (!container) return;

  container.innerHTML = buildFilterButtons(activeDeckFilter);

  $$("[data-filter]", container).forEach(button => {
    button.addEventListener("click", () => {
      activeDeckFilter = button.dataset.filter;
      deckOrder = buildDeckOrder(activeDeckFilter);
      currentIndex = 0;
      buildDeckFilters();
      renderCurrentCard();
    });
  });
}

function buildSavedDeckPrompt() {
  const pageInner = $(".deck-page-inner");
  if (!pageInner || !showSavedOnlyDeck || $(".saved-deck-prompt")) return;

  const prompt = document.createElement("div");
  prompt.className = "saved-deck-prompt";
  prompt.innerHTML = `
    <button class="button button-soft explore-full-deck-button" type="button" data-url="deck.html">Explore full deck</button>
    <button class="text-button" type="button" data-route="saved">Back to saved prompts</button>
  `;
  pageInner.append(prompt);
}

function buildFilterButtons(activeFilter) {
  const filters = [
    { name: "All", symbol: "All", icon: sharedAssetsBase + "/symbols/all.png" },
    ...categoryDefinitions
  ];

  return filters.map(filter => `
    <button class="filter-button category-${filter.slug || categorySlug(filter.name)} ${filter.name === activeFilter ? "is-active" : ""}" type="button" data-filter="${filter.name}" aria-label="Show ${filter.name} prompts">
      <span class="filter-symbol" aria-hidden="true">
        <img src="${filter.icon}" alt="" onerror="this.hidden=true" />
        <span>${filter.symbol}</span>
      </span>
      <span class="filter-label">${filter.name}</span>
    </button>
  `).join("");
}

function renderSavedPrompts() {
  const list = $("#saved-list");
  const empty = $("#saved-empty");
  if (!list || !empty) return;
  if ($("#saved-category-list")) {
    list.hidden = true;
    empty.hidden = true;
    return;
  }

  const savedIds = getSavedIds();
  const savedPrompts = prompts.filter(prompt => savedIds.includes(prompt.id));
  const visiblePrompts = activeSavedFilter === "All"
    ? savedPrompts
    : savedPrompts.filter(prompt => prompt.category === activeSavedFilter);

  buildSavedFilters();
  empty.hidden = visiblePrompts.length > 0;
  list.innerHTML = visiblePrompts.map(prompt => `
    <article class="saved-card">
      <div class="saved-card-top">
        <h3>${prompt.question}</h3>
        <button class="unsave-button" type="button" data-unsave-id="${prompt.id}">Remove</button>
      </div>
      <img class="saved-card-image" src="${prompt.image}" alt="${prompt.question}" />
    </article>
  `).join("");

  $$("[data-unsave-id]", list).forEach(button => {
    button.addEventListener("click", () => toggleSaved(Number(button.dataset.unsaveId)));
  });
}

function updateSavedUI() {
  const savedIds = getSavedIds();
  const savedCount = $("#nav-saved-count");
  if (savedCount) savedCount.textContent = `(${savedIds.length})`;
  updateDeckControls();
  buildSavedCategoryHub();
  renderSavedPrompts();
}

function bindEvents() {
  $("#menu-button")?.addEventListener("click", openMenu);
  $("#close-menu")?.addEventListener("click", closeMenu);
  $("#nav-overlay")?.addEventListener("click", closeMenu);

  $$("[data-route]").forEach(control => {
    control.addEventListener("pointerdown", () => control.classList.add("is-pressed"));
    control.addEventListener("pointerup", () => control.classList.remove("is-pressed"));
    control.addEventListener("pointercancel", () => control.classList.remove("is-pressed"));
    control.addEventListener("pointerleave", () => control.classList.remove("is-pressed"));
    control.addEventListener("click", event => {
      event.preventDefault();
      navigateTo(control.dataset.route);
    });
  });

  $$("[data-url]").forEach(control => {
    control.addEventListener("pointerdown", () => control.classList.add("is-pressed"));
    control.addEventListener("pointerup", () => control.classList.remove("is-pressed"));
    control.addEventListener("pointercancel", () => control.classList.remove("is-pressed"));
    control.addEventListener("pointerleave", () => control.classList.remove("is-pressed"));
    control.addEventListener("click", event => {
      event.preventDefault();
      window.location.href = control.dataset.url;
    });
  });

  $$("[data-copy-code]").forEach(button => {
    button.addEventListener("click", async () => {
      const code = button.dataset.copyCode;
      if (!code) return;
      await copyText(code);
      button.classList.add("is-copied");
      button.setAttribute("aria-label", `Copied code ${code}`);
      window.setTimeout(() => {
        button.classList.remove("is-copied");
        button.setAttribute("aria-label", `Copy code ${code}`);
      }, 1600);
    });
  });

  $("#skip-card")?.addEventListener("click", () => moveToNextCard("left"));
  $("#save-card")?.addEventListener("click", () => {
    const prompt = currentPrompt();
    if (!prompt) return;
    toggleSaved(prompt.id);
    if (showSavedOnlyDeck) {
      deckOrder = buildDeckOrder(activeDeckFilter);
      currentIndex = Math.min(currentIndex, Math.max(deckOrder.length - 1, 0));
      renderCurrentCard();
    }
  });
  $("#shuffle-card")?.addEventListener("click", shuffleDeck);

  const card = $("#prompt-card");
  if (card) {
    card.addEventListener("pointerdown", event => {
      card.setPointerCapture?.(event.pointerId);
      startCardDrag(event);
    });
    card.addEventListener("pointermove", updateCardDrag);
    card.addEventListener("pointerup", endCardDrag);
    card.addEventListener("pointercancel", endCardDrag);
    card.addEventListener("lostpointercapture", endCardDrag);
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
    if ($("#deck") && event.key === "ArrowRight") moveToNextCard("left");
    if ($("#deck") && event.key.toLowerCase() === "s" && currentPrompt()) toggleSaved(currentPrompt().id);
  });
}

function init() {
  document.documentElement.style.setProperty("--how-to-symbol", `url("${sharedAssetsBase}/symbols/Element 303.png")`);
  document.documentElement.style.setProperty("--bullet-symbol", `url("${sharedAssetsBase}/symbols/Element 281.png")`);
  preloadCardImages();
  buildElementPattern();
  buildHowToSymbols();
  syncDeckTitle();
  buildDeckFilters();
  buildSavedDeckPrompt();
  buildAccordion($("#prompt-accordion"));
  buildAccordion($("#prompt-accordion-copy"));
  syncNavigationState();
  bindEvents();
  renderCurrentCard();
  updateSavedUI();
}

document.addEventListener("DOMContentLoaded", init);
