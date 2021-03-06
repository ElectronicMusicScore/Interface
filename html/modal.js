/**
 * Adds all the required functions for controlling the modals.
 * Annotate any clickable element with the "mt" classname and add the "data-target" attribute with the id of the modal
 * to open.
 * @author Arnau Mora
 * @since 20220407
 * @file modal.js
 */

/**
 * The event name which gets called whenever a modal gets opened through `om`.
 * @author Arnau Mora
 * @since 20220413
 * @type {string}
 */
const modalOpenEventName = 'modal_open';

/**
 * The event name which gets called whenever a modal gets closed through `cm`.
 * @author Arnau Mora
 * @since 20220413
 * @type {string}
 */
const modalCloseEventName = 'modal_close';

// Functions to open and close a modal
/**
 * Open Modal. Opens the modal at element `$el`.
 * @author Arnau Mora
 * @since 20220407
 * @param {HTMLElement} $el
 */
const om = ($el) => {
    if ($el.dispatchEvent(new Event(modalOpenEventName, {cancelable: true})))
        ca($el, 'is-active');
    else console.log('Modal opening has been prevented.');
};

/**
 * Close Modal. Hides the modal at element `$el`.
 * @author Arnau Mora
 * @since 20220407
 * @param {HTMLElement} $el
 * @param {boolean} force If true, 'data-modal-force' will be ignored.
 */
const cm = ($el, force = false) => {
    if (!force && $el.hasAttribute('data-modal-force'))
        return;
    if ($el.dispatchEvent(new Event(modalCloseEventName, {cancelable: true})))
        cr($el, 'is-active');
    else console.log('Modal closing has been prevented.');
};

dell(() => {
    /**
     * Close all modals. Hides all the modals that are being displayed.
     * @author Arnau Mora
     * @since 20220407
     */
    const cam = () => (qsa('.modal') || []).forEach(($m) => cm($m));

    // Add a click event on buttons to open a specific modal
    (qsa('.mt') || []).forEach(($t) => elc($t, () => om(_($t.dataset.target))));

    // Add a click event on various child elements to close the parent modal
    (qsa('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || [])
        .forEach(($close) => elc($close, () => cm($close.closest('.modal'))));

    // Add a keyboard event to close all modals
    del('keydown', (ev) => {
        if ((ev || we).keyCode === 27) // Escape key
            cam();
    });
});