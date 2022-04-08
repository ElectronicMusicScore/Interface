dell(async () => {
    /**
     * The div that contains the cards that list all the files in the server.
     * @type {HTMLElement}
     */
    const filesList = _('files-lst');
    /**
     * The sample card for an item in the files list.
     * @type {HTMLElement}
     */
    const filesCard = _('files-card');
    /**
     * The progress bar that shows the filesystem usage percent.
     * @type {HTMLProgressElement}
     */
    const filesUsage = _('files-spc');

    // Set initial state for modal
    cr(_('flm'), 'is-active');

    const loadFiles = async () => {
        console.log('Loading files...');

        const fList = await fetch('/files');
        if (!fList.ok)
            // TODO: Display error in UI
            return console.error(fList.error());
        const json = await fList.json();
        /**
         * The list of files in server. Contains the full path of the file, starting with "/"
         * @type {{path:string,size:number}[]}
         */
        const files = json.files;
        /**
         * Provides information about the state of the filesystem.
         * @type {{used:number,max:number}}
         */
        const info = json.info;
        const used = (info.used / info.max) * 100;

        st(_('files-used'), humanFileSize(info.used));
        st(_('files-avail'), humanFileSize(info.max));
        vs(filesUsage, used);
        cr(filesUsage, 'is-info', 'is-success', 'is-warning', 'is-danger');
        ca(filesUsage, used < 30 ? 'is-info' : used < 50 ? 'is-success' : used < 80 ? 'is-warning' : 'is-danger');

        for (const f in files) {
            const file = files[f];
            const filename = file.path;
            const size = file.size;

            const name = filename.split('/').last();
            const ext = name.split('.').last();
            const nameNoExt = name.substring(0, name.indexOf(ext) - 1);

            const card = filesCard.cloneNode(true);
            card.id = name.replace('.', '_');
            cr(card, 'is-hidden');
            qsa('[data-source="filename"]', card).forEach((i) => st(i, nameNoExt));
            qsa('[data-source="size"]', card).forEach((i) => st(i, humanFileSize(size)));
            qsa('[data-source="load"]', card).forEach((i) => elc(i, (ev) => {
                ec(ev);
                loadSheet("/file?path=" + filename);
                cm(_('flm'));
            }));

            filesList.appendChild(card);
        }
    }
    await loadFiles();
});
