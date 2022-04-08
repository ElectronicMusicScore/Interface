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
 * @param {(this:HTMLElement, ev: HTMLElementEventMap[string]) => any} listener What to get called when the event occurs.
 */
const el = ($el, type, listener) => $el.addEventListener(type, listener);

/**
 * Shortcut for `document.addEventListener` for 'click'.
 * @author Arnau Mora
 * @since 20220407
 * @param {HTMLElement} $el the element to add the listener to.
 * @param {(this:HTMLElement, ev: HTMLElementEventMap[string]) => any} listener What to get called when the event occurs.
 */
const elc = ($el, listener) => $el.addEventListener('click', listener);

/**
 * Consumes the event `e` by running `e.preventDefault()`.
 * @author Arnau Mora
 * @since 20220407
 * @param {Event} e The event to consume.
 */
const ec = (e) => e.preventDefault();

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
 * @param {HTMLElement|Node} $el the element to remove the classname to.
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
 * Shortcut for `DOMElement.setAttribute`.
 * @author Arnau Mora
 * @since 20220407
 * @param {HTMLElement} $el the element to add the attribute to.
 * @param {string} an The attribute name.
 * @param {string} av The attribute value
 */
const sa = ($el, an, av = '') => $el.setAttribute(an, av);

/**
 * Shortcut for `DOMElement.removeAttribute`.
 * @author Arnau Mora
 * @since 20220407
 * @param {HTMLElement} $el the element to remove the attribute from.
 * @param {string} an The attribute name.
 */
const ra = ($el, an) => $el.removeAttribute(an);

/**
 * Shortcut for `HTMLElement.value`.
 * @author Arnau Mora
 * @since 20220407
 * @param {HTMLFormElement|HTMLProgressElement} $el The element to get the value from
 */
const va = ($el) => $el.value;

/**
 * Shortcut for setting `HTMLElement.innerText`.
 * @author Arnau Mora
 * @since 20220407
 * @param {HTMLElement} $el The element to update.
 * @param {string} t The new innerText.
 */
const st = ($el, t) => $el.innerText = t;

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
const _ = (id) => document.getElementById(id);

/**
 * Shortcut for `document.querySelectorAll`.
 * @param {string} q The query to select
 * @param {HTMLElement|Node} $el The element to search into.
 * @return {NodeListOf<Element>}
 */
const qsa = (q, $el = document) => $el.querySelectorAll(q);
