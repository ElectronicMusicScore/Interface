/**
 * Shortcut for `document.addEventListener` for 'DOMContentLoaded'.
 * @author Arnau Mora
 * @since 20220407
 * @param {string} type The listener type.
 * @param {Function} listener What to get called when the event occurs.
 */
const del = (type, listener) => document.addEventListener(type, listener);

/**
 * Shortcut for `document.addEventListener` for 'DOMContentLoaded'.
 * @author Arnau Mora
 * @since 20220407
 * @param {Function} listener What to get called when the event occurs.
 */
const dell = (listener) => document.addEventListener('DOMContentLoaded', listener);

/**
 * Shortcut for `document.addEventListener`.
 * @author Arnau Mora
 * @since 20220407
 * @param {HTMLElement} $el the element to add the listener to.
 * @param {string} type The listener type.
 * @param {Function} listener What to get called when the event occurs.
 */
const el = ($el, type, listener) => $el.addEventListener(type, listener);

/**
 * Shortcut for `document.addEventListener` for 'click'.
 * @author Arnau Mora
 * @since 20220407
 * @param {HTMLElement} $el the element to add the listener to.
 * @param {Function} listener What to get called when the event occurs.
 */
const elc = ($el, listener) => $el.addEventListener('click', listener);

/**
 * Shortcut for `DOMElement.classList.add`.
 * @author Arnau Mora
 * @since 20220407
 * @param {HTMLElement} $el the element to add the classname to.
 * @param {string} cn The classname to add.
 */
const ca = ($el, cn) => $el.classList.add(cn);

/**
 * Shortcut for `DOMElement.classList.remove`.
 * @author Arnau Mora
 * @since 20220407
 * @param {HTMLElement} $el the element to remove the classname to.
 * @param {string} cn The classname to remove.
 */
const cr = ($el, cn) => $el.classList.remove(cn);

/**
 * Shortcut for `DOMElement.classList.toggle`.
 * @author Arnau Mora
 * @since 20220407
 * @param {HTMLElement} $el the element to remove the classname to.
 * @param {string} cn The classname to toggle.
 */
const ct = ($el, cn) => $el.classList.toggle(cn);

/**
 * Shortcut for `window.event`.
 * @return {Event}
 */
const we = () => window.event

/**
 * Shortcut for `document.getElementById`.
 * @param {string} id The id of the element to search for.
 * @return {HTMLElement}
 */
const $ = (id) => document.getElementById(id);

/**
 * Shortcut for `document.querySelectorAll`.
 * @param {string} q The query to select
 * @return {HTMLElement}
 */
const qsa = (q) => document.querySelectorAll(q);