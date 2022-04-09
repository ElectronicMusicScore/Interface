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
    /**
     * The file input for uploading new files to the filesystem.
     * @type {HTMLInputElement}
     */
    const filesInput = _('files-upload');
    /**
     * The display name of the introduced file before uploading.
     * @type {HTMLElement}
     */
    const filesName = _('files-name');
    /**
     * The progress bar that shows the upload task percent.
     * @type {HTMLProgressElement}
     */
    const filesUpload = _('files-prog');

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

        filesList.innerHTML = '';
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
            qsa('[data-source="load"]', card).forEach((i) => {
                elc(i, (ev) => {
                    ec(ev);
                    loadSheet("/file?path=" + filename);
                    cm(_('flm'));
                });
                if (!filename.endsWithAny('xml', 'mxl', 'musicxml'))
                    // Hide button if not a MusicXML file
                    ca(i, 'is-hidden');
            });

            filesList.appendChild(card);
        }
    }

    el(filesInput, 'change', (ev) => {
        ec(ev); // Consume event
        const $tg = ev.target;
        if ($tg.files.length <= 0) {
            ca(filesUpload, 'is-hidden');
            ca(filesName, 'is-hidden');
            return;
        }
        const file = $tg.files[0];
        cr(filesUpload, 'is-hidden');
        st(filesName, file.name);
        cr(filesName, 'is-hidden');

        const formData = new FormData();
        formData.append("file", file);

        console.log('Uploading ' + file.name + '...');

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (ev) => {
            if (ev.lengthComputable) {
                const progress = (ev.loaded / ev.total) * 100;
                console.log('Upload progress:', progress, '%');
                filesUpload.value = progress;
            }
        });
        xhr.addEventListener('loadend', async () => {
            // Tells whether the upload was successful
            const suc = xhr.readyState === 4 && xhr.status === 200;

            if (suc) {
                ca(filesUpload, 'is-hidden');
                ca(filesName, 'is-hidden');
                $tg.file = null;
                await loadFiles();
            } else
                console.error('Could not upload file. Status:', xhr.status);
        });
        xhr.addEventListener('error', console.error);
        xhr.open('PUT', '/upload', true);
        xhr.overrideMimeType(file.type);
        xhr.send(formData);
    });

    await loadFiles();
});
