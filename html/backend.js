dell(() => {
    /**
     * The find networks button.
     * @type {HTMLElement}
     */
    const ssidBtn = _('ssid-src');
    /**
     * The progress bar that shows the find networks progress.
     * @type {HTMLProgressElement}
     */
    const ssidPb = _('ssid-prog');
    /**
     * The `fieldset` that controls the disabled status of all the ssid fields.
     * @type {HTMLElement}
     */
    const ssidFs = _('ssid-fs');
    /**
     * The `select` parent element used for selecting the SSID to connect to.
     * @type {HTMLElement}
     */
    const ssidSel = _('ssid-sel');
    /**
     * The error message for the SSID field.
     * @type {HTMLElement}
     */
    const ssidSelErr = _('ssid-err');
    /**
     * The `select` element used for selecting the SSID to connect to.
     * @type {HTMLElement}
     */
    const ssidVal = _('ssid-val');
    /**
     * The `fieldset` that controls the disabled status of all the ssid form fields, including the submit button.
     * @type {HTMLElement}
     */
    const ssidFFs = _('ssid-ffs');
    /**
     * The `form` where the Wi-Fi connection is requested.
     * @type {HTMLFormElement}
     */
    const ssidForm = _('ssid-form');
    /**
     * The Wi-Fi connection form submit button.
     * @type {HTMLElement}
     */
    const ssidConn = _('ssid-conn');
    /**
     * The password field for the Wi-Fi connect modal.
     * @type {HTMLElement}
     */
    const ssidPass = _('ssid-pass');
    /**
     *
     * @type {HTMLElement}
     */
    const ssidErr = _('ssid-error');

    /**
     * The Wi-Fi state badge.
     * @type {HTMLElement}
     */
    const wifiState = _('wifi-state');

    /**
     * Stores the last response's Wi-Fi ssids.
     * @type {{ssid:string}[]|null}
     */
    let ssids = null;

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
        ca(ssidSelErr, 'is-hidden');

        console.log("Fetching nets...")
        try {
            // The response of the /nets request
            const nr = await fetch('/nets');
            // The response in JSON
            const nj = await nr.json();
            if (!nj.networks)
                ssids = null;
            else
                ssids = nj.networks;
        } catch (e) {
            console.error("Could not get nets:", e)
            ssids = null;
        }

        if (!ssids) {
            // Outline the selection box with red
            ca(ssidSel, 'is-danger');
            // Show the error message
            cr(ssidSelErr, 'is-hidden');
        } else {
            // Remove all children except first
            while (ssidVal.childNodes.length > 1)
                ssidVal.removeChild(ssidVal.lastChild);
            // Add the found nets
            for (let c = 0; c < ssids.length; c++)
                ssidVal.innerHTML += `<option value="${c}">${ssids[c].ssid}</option>`;
        }

        // Enable fields
        ra(ssidFs, 'disabled');
        // Hide progress bar
        ca(ssidPb, 'is-hidden');
        // Clear the loading status
        cr(ssidSel, 'is-loading');
    });
    el(ssidForm, 'submit', (ev) => {
        ec(ev);
        sa(ssidFFs, 'disabled');
        ca(ssidConn, 'is-loading');
        ca(ssidErr, 'is-hidden');
        cr(wifiState, 'is-success');
        cr(wifiState, 'is-danger');
        ca(wifiState, 'is-info');
        st(wifiState, 'Connecting');

        if (!ssids)
            return alert('Please, search for networks first.');

        const ssidRaw = va(ssidVal);
        const ssid = ssids.hasOwnProperty(ssidRaw) ? ssids[ssidRaw].ssid : null;
        const pass = va(ssidPass);

        if (!ssid) {
            ra(ssidFFs, 'disabled');
            cr(ssidConn, 'is-loading');
            cr(wifiState, 'is-success');
            ca(wifiState, 'is-danger');
            cr(wifiState, 'is-info');
            st(wifiState, 'Disconnected');
            return alert('Could not find the set network.');
        }

        if (pass.length <= 0)
            if (!confirm(
                'You have not introduced any password, this means you are connecting to an unprotected network. ' +
                'Are you sure that you want to proceed?'
            )) {
                ra(ssidFFs, 'disabled');
                cr(ssidConn, 'is-loading');
                cr(wifiState, 'is-success');
                ca(wifiState, 'is-danger');
                cr(wifiState, 'is-info');
                st(wifiState, 'Disconnected');
                return;
            }

        console.log('Connecting to', `/connect/${ssid}`);
        fetch(`/connect/${ssid}`, {method: 'POST', body: `pass=${pass}`})
            .then(async (response) => {
                ra(ssidFFs, 'disabled');
                cr(ssidConn, 'is-loading');

                cr(wifiState, 'is-success');
                cr(wifiState, 'is-danger');
                cr(wifiState, 'is-info');

                if (response.ok) {
                    ca(wifiState, 'is-success');
                    st(wifiState, 'Connected');
                    alert("Connected successfully!");
                    cr(_('wcm'), 'is-active');
                } else {
                    const blob = await response.blob();
                    const err = await blob.text();
                    console.error(err);

                    cr(ssidErr, 'is-hidden');
                    ca(wifiState, 'is-danger');
                    st(wifiState, 'Disconnected');

                    switch (err) {
                        case 'fail:out-of-range':
                            st(ssidErr, 'Network out of range. Please, search again.');
                            break;
                        case 'fail:auth-error':
                            st(
                                ssidErr,
                                'Could not authenticate to network. Please, introduce a password, or check if ' +
                                'it\'s correct.'
                            );
                            break;
                        case 'fail:unknown-error':
                            st(ssidErr, 'Could not connect. An unexpected error has occurred. Try again later.');
                            break;
                        default:
                            alert("Could not connect. See console for more info.");
                            break;
                    }
                }
            })
            .catch((reason) => {
                console.error(reason);
                alert("Could not connect. See console for more info.");
            })
    });
});