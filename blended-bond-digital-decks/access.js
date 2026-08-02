"use strict";

const deckAccess = [
  {
    password: "MINIGUIDE",
    path: "decks/mini-guide/index.html"
  },
  {
    password: "BLENDEDBOND",
    path: "decks/full-deck/index.html"
  },
  {
    password: "BEFORETHEBLEND",
    path: "decks/before-the-blend/index.html"
  }
];

const form = document.getElementById("password-form");
const input = document.getElementById("password-input");
const message = document.getElementById("password-message");
const toggle = document.getElementById("password-toggle");
const submitButton = document.getElementById("open-deck-button");
const entryScreen = document.getElementById("entry-screen");
const loadingScreen = document.getElementById("loading-screen");

let isOpeningDeck = false;

function normalizePassword(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function setMessage(text, type = "") {
  if (!message) return;
  message.textContent = text;
  message.classList.toggle("is-error", type === "error");
  message.classList.toggle("is-success", type === "success");
}

form?.addEventListener("submit", event => {
  event.preventDefault();
  if (isOpeningDeck) return;

  const submitted = normalizePassword(input.value);
  const match = deckAccess.find(deck => normalizePassword(deck.password) === submitted);

  if (!submitted) {
    setMessage("Please enter your deck password.", "error");
    input.focus();
    return;
  }

  if (!match) {
    setMessage("That password does not match an available digital deck.", "error");
    input.select();
    return;
  }

  setMessage("Opening your deck.", "success");
  isOpeningDeck = true;
  if (submitButton) {
    submitButton.textContent = "OPENING...";
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
  }
  entryScreen?.classList.remove("is-active");
  loadingScreen?.classList.add("is-active");
  window.setTimeout(() => {
    window.location.href = match.path;
  }, 3200);
});

input?.addEventListener("input", () => setMessage(""));

toggle?.addEventListener("click", () => {
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  toggle.textContent = showing ? "Show" : "Hide";
  toggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
});
