dell(async () => {
    /**
     * The div that contains the cards that list all the files in the server.
     * @type {HTMLElement}
     */
    const filesList = _('files-lst');
    /**
     * The sample card for a item in the files list.
     * @type {HTMLElement}
     */
    const filesCard = _('files-card');

    // Set initial state for modal
    cr(_('flm'), 'is-active');

    const loadFiles = async () => {
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
        console.log('Files:', files);

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

            console.log('Appending', card);
            filesList.appendChild(card);
        }
    }
    console.log('Loading files...')
    await loadFiles();
});
