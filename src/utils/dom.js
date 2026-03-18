/**
 * dom.js — lightweight DOM utility helpers
 */

/** Query one element, throw if missing */
export const qs = (sel, root = document) => root.querySelector(sel);
/** Query all elements */
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Create an element with optional class and attributes */
export function el(tag, className, attrs = {}) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

/** Set innerHTML safely (no user-generated strings) */
export function setHTML(element, html) {
  element.innerHTML = html;
  return element;
}

/** Toggle a CSS class based on a boolean */
export function toggle(el, cls, force) {
  el.classList.toggle(cls, force);
}

/** Open a modal by removing hidden, close by adding it */
export function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add("open");
  document.body.style.overflow = "hidden";
}

export function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove("open");
  if (!document.querySelector(".modal-overlay.open")) {
    document.body.style.overflow = "";
  }
}

export function closeAllModals() {
  qsa(".modal-overlay.open").forEach((m) => {
    m.classList.remove("open");
  });
  document.body.style.overflow = "";
}

// Global Escape key handler
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllModals();
});

// Click backdrop to close
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) closeAllModals();
});
