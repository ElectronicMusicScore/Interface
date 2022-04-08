let _osmd;
let iDrop, iItem;

/**
 * Loads a sheet into the viewer.
 * @author Arnau Mora
 * @since 20220408
 * @param {string} url The path where the sheet is stored at.
 */
const loadSheet = (url) => {
    console.info('Loading', url);
    _osmd
        .load(url)
        .then(() => {
            _osmd.render();

            iDrop.innerHTML = '';
            const isms = _osmd.sheet.Instruments;
            for (const k in isms) {
                /**
                 * @type {Instrument}
                 */
                const ins = isms[k];
                const item = iItem.cloneNode(true);
                cr(item, 'is-hidden');
                ra(item, 'id');
                qsa('[data-source="name"]', item).forEach((i) => st(i, ins.Name || ins.NameLabel.text));
                qsa('input[type="checkbox"]', item).forEach((i) => sa(i, 'checked', 'true'));

                el(item, 'change', (ev) => {
                    ins.Visible = ev.target.checked;
                    _osmd.render()
                });

                iDrop.appendChild(item);
            }
        });
};

dell(() => {
    // Initialize instruments dropdown
    iDrop = _('i-drop');
    iItem = _('i-item', iDrop);

    // Load OSMD
    console.log("Initializing osmd...");
    _osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmdContainer");
    _osmd.setOptions({
        backend: "canvas",
        drawTitle: true,
        // drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
    });
    loadSheet("/file?path=MozaVeilSample.xml");


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