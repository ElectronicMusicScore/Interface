/**
 * @param {string} text The text to display in the Snackbar.
 * @param {number} timeout
 */
function snackbar(text, timeout = 3000) {
    const x = document.createElement('div');

    ca(x, 'snackbar', 'show');
    st(x, text);

    document.body.appendChild(x);

    setTimeout(
        () => {
            cr(x, 'show');
            setTimeout(() => x.remove(), 500);
        },
        timeout,
    );
}
