/**
 * Loads all the files from the list, and updates the GUI accordingly.
 * @author Arnau Mora
 * @since 20220414
 * @param {{name:string,size:number}[]} files
 * @returns {Promise<void>}
 */
const loadFiles = async (files) => {
    console.log('Loading files...');

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

    filesList.innerHTML = '';
    for (const f in files) {
        const file = files[f];
        const filename = file.name;
        const size = file.size;

        const name = filename.split('/').last();
        const ext = name.split('.').last();
        const nameNoExt = name.substring(0, name.indexOf(ext) - 1);

        const card = filesCard.cloneNode(true);
        card.id = name.replace('.', '_');
        cr(card, 'is-hidden');
        qsa('[data-source="filename"]', card).forEach((i) => {
            st(i, nameNoExt);
            // This gets called whenever the name of a file is changed.
            el(i, 'focusout', async () => {
                const t = `${gt(i)}.${ext}`;
                if (t === filename)
                    return;

                const url = new URL('/rename', window.location.origin);
                const rename = await fetch(url.toString(), {
                    method: 'PATCH',
                    body: new URLSearchParams({FROM: filename, TO: t}),
                });
                if (rename.ok)
                    await loadFiles();
                else
                    console.error('Could not rename file. Code:', rename.status);
            });
        });
        qsa('[data-source="size"]', card).forEach((i) => st(i, humanFileSize(size)));
        qsa('[data-source="load"]', card).forEach((i) => {
            elc(i, (ev) => {
                ec(ev);
                loadSheet(filename);
                cm(_('flm'));
            });
            if (!filename.endsWithAny('xml', 'mxl', 'musicxml'))
                // Hide button if not a MusicXML file
                ca(i, 'is-hidden');
        });
        qsa('[data-source="delete"]', card).forEach((i) => {
            elc(i, async (ev) => {
                ec(ev);
                if (i.classList.contains('has-text-danger')) {
                    const url = new URL('/' + encodeURIComponent(filename), window.location.origin);
                    const deletion = await fetch(url.toString(), {method: 'DELETE'});
                    if (!deletion.ok)
                        // TODO: Show error in GUI
                        console.error('Could not delete. Status:', deletion.status);
                    else {
                        console.log('File deleted!');
                        await loadFiles();
                    }
                } else {
                    ca(i, 'has-text-danger');
                    st(i, 'Confirm');
                }
            });
            el(i, 'focusout', () => {
                cr(i, 'has-text-danger');
                st(i, 'Delete');
            });
        });

        filesList.appendChild(card);
    }
    console.log("Finished loading", files.length, "files");

    if (localStorage.hasOwnProperty('sheet'))
        loadSheet(localStorage.getItem('sheet'));
    else if (files.length > 0)
        loadSheet(files[0].name);
}

dell(async () => {
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
                // TODO: Files should be fetched again
            } else
                console.error('Could not upload file. Status:', xhr.status);
        });
        xhr.addEventListener('error', console.error);
        xhr.open('PUT', '/upload', true);
        xhr.overrideMimeType(file.type);
        xhr.send(formData);
    });
});
