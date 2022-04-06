dell(() => {

    // Load OSMD
    const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmdContainer");
    osmd.setOptions({
        backend: "canvas",
        drawTitle: true,
        // drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
    });
    osmd
        .load("/MozaVeilSample.xml")
        .then(
            function () {
                osmd.render();
            }
        );


    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(qsa('.navbar-burger'), 0);

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
        // Add a click event on each of them
        $navbarBurgers.forEach(el => {
            elc(el, () => {
                // Get the target from the "data-target" attribute
                const target = el.dataset.target;
                const $target = $(target);

                // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                ct(el, 'is-active');
                ct($target, 'is-active');
            });
        });
    }

});