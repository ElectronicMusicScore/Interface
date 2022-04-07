dell(() => {
    /**
     * The find networks button.
     * @type {HTMLElement}
     */
    const ssidBtn = $('ssid-src');
    /**
     * The progress bar that shows the find networks progress.
     * @type {HTMLProgressElement}
     */
    const ssidPb = $('ssid-prog');
    /**
     * The `fieldset` that controls the disabled status of all the ssid fields.
     * @type {HTMLElement}
     */
    const ssidFs = $('ssid-fs');
    /**
     * The `select` parent element used for selecting the SSID to connect to.
     * @type {HTMLElement}
     */
    const ssidSel = $('ssid-sel');
    /**
     * The error message for the SSID field.
     * @type {HTMLElement}
     */
    const ssidErr = $('ssid-err');
    /**
     * The `select` element used for selecting the SSID to connect to.
     * @type {HTMLElement}
     */
    const ssidVal = $('ssid-val');

    elc(ssidBtn, async () => {
        // Disable all fields of the ssid row
        sa(ssidFs, 'disabled');
        // Shows progress bar
        cr(ssidPb, 'is-hidden');
        // Set the loading status
        ca(ssidSel, 'is-loading');
        // Clear the red outline of the select box
        cr(ssidSel, 'is-danger');
        // Hides the error message
        ca(ssidErr, 'is-hidden');

        console.log("Fetching nets...")
        let nl;
        try {
            // The response of the /nets request
            const nr = await fetch('/nets');
            // The response in JSON
            const nj = await nr.json();
            if (!nj.networks)
                nl = null;
            else
                nl = nj.networks;
        } catch (e) {
            console.error("Could not get nets:", e)
            nl = null;
        }

        if (!nl) {
            // Outline the selection box with red
            ca(ssidSel, 'is-danger');
            // Show the error message
            cr(ssidErr, 'is-hidden');
        } else {
            // Remove all children except first
            while (ssidVal.childNodes.length > 1)
                ssidVal.removeChild(ssidVal.lastChild);
            // Add the found nets
            for (let c = 0; c < nl.length; c++)
                ssidVal.innerHTML += `<option value="${c}">${nl[c].ssid}</option>`;
        }

        // Enable fields
        ra(ssidFs, 'disabled');
        // Hide progress bar
        ca(ssidPb, 'is-hidden');
        // Clear the loading status
        cr(ssidSel, 'is-loading');
    });
});