dell(() => {
    /**
     * Fetches the server at `url` to check if it's online.
     * @param {string} url The server URL to fetch.
     * @param {number} timeout The time to wait until declaring the server offline.
     * @return {Promise<Response>}
     */
    const checkServer = (url, timeout) => new Promise((resolve, reject) => {
        const controller = new AbortController();
        const signal = controller.signal;
        const options = {mode: 'no-cors', signal, timeout: timeout};
        const tout = setTimeout(() => controller.abort(), timeout)
        fetch(url, options)
            .then(response => {
                clearTimeout(tout);
                resolve(response);
            })
            .catch(error => {
                clearTimeout(tout);
                reject(error)
            });
    });

    const sdn = _('sdn')

    window.setInterval(async () => {
        try {
            const s = await checkServer('/ping', 100);
            if (s == null || !s.ok)
                cr(sdn, 'is-hidden');
            else
                ca(sdn, 'is-hidden');
        } catch (e) {
            cr(sdn, 'is-hidden');
        }
    }, 1000);
});
