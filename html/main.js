let _osmd;
let iDrop, iItem, iList;
let scale = 1.0;

/**
 * Loads a sheet into the viewer.
 * @author Arnau Mora
 * @since 20220408
 * @param {string} filename The name of the file to load.
 */
const loadSheet = (filename) => {
    if (_osmd == null || !['musicxml', 'mxl'].includes(filename.split('.').last()))
        return;

    localStorage.setItem('sheet', filename);

    console.info('Loading', filename);
    _osmd
        .load("/file?path=" + filename)
        .then(async () => {
            const isms = _osmd.sheet.Instruments;

            // noinspection SpellCheckingInspection
            /**
             * @type {string[]}
             */
            let insPrefs = isms.map(i => i.NameLabel.text);
            const insUrl = new URL('/config_sheet', window.location.origin);
            insUrl.search = new URLSearchParams({
                file: filename,
                key: 'instruments',
            })
            const insPrefsS = await fetch(insUrl.toString(), {method: 'GET'})
            if (insPrefsS.ok)
                insPrefs = (await insPrefsS.text())
                    .toString()
                    .split(/\n/gm);

            if (isms.length <= 1)
                ca(iList, 'is-hidden');
            else
                cr(iList, 'is-hidden');

            iDrop.innerHTML = '';
            for (const k in isms) {
                /**
                 * @type {Instrument}
                 */
                const ins = isms[k];
                const item = iItem.cloneNode(true);
                const visible = insPrefs.includes(ins.NameLabel.text);

                cr(item, 'is-hidden');
                ra(item, 'id');
                qsa('[data-source="name"]', item).forEach((i) => st(i, ins.Name || ins.NameLabel.text));
                qsa('input[type="checkbox"]', item).forEach((i) => i.checked = visible);

                ins.Visible = visible;

                el(item, 'change', async (ev) => {
                    ins.Visible = ev.target.checked;
                    _osmd.render();

                    // Update the configuration at server
                    const instruments = _osmd.sheet
                        .Instruments
                        .map(item => item.Visible ? item.NameLabel.text : null)
                        .filter(i => i != null)
                        .join(',');
                    const result = await fetch(
                        '/config_sheet',
                        {
                            method: 'PATCH',
                            body: new URLSearchParams({
                                file: filename,
                                key: 'instruments',
                                value: instruments,
                            }),
                        },
                    )
                    if (!result.ok)
                        // TODO: Show error on GUI
                        console.error('Could not update config on instrument preferences. Code:', result.status);
                });

                iDrop.appendChild(item);
            }

            _osmd.render();
        });
};

dell(() => {
    // Initialize instruments dropdown
    iDrop = _('i-drop');
    iItem = _('i-item', iDrop);
    iList = _('insments');

    // Load OSMD
    console.log("Initializing osmd...");
    _osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmdContainer");
    _osmd.setOptions({
        backend: "SVG", // or canvas
        drawTitle: true,
        // drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
    });

    const refreshZoom = () => {
        _osmd.Zoom = scale;
        _osmd.render();
    }

    elc(_('zoom-in'), () => {
        scale *= 1.2;
        refreshZoom();
    });
    elc(_('zoom-out'), () => {
        scale /= 1.2;
        refreshZoom();
    });


    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(qsa('.navbar-burger'), 0);

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
        // Add a click event on each of them
        $navbarBurgers.forEach(el => {
            elc(el, () => {
                // Get the target from the "data-target" attribute
                const target = el.dataset.target;
                const $target = _(target);

                // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                ct(el, 'is-active');
                ct($target, 'is-active');
            });
        });
    }

});