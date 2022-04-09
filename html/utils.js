/**
 * Format bytes as human-readable text.
 * @param size Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * @return Formatted string.
 */
const humanFileSize = (size, si = false, dp = 1) => {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(size) < thresh)
        return size + ' B';

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        size /= thresh;
        ++u;
    } while (Math.round(Math.abs(size) * r) / r >= thresh && u < units.length - 1);

    return size.toFixed(dp) + ' ' + units[u];
}

Object.assign(String.prototype, {
    /**
     * Checks whether the string ends with any of the suffixes.
     * @author Arnau Mora
     * @since 20220409
     * @this {string}
     * @param {string} suffixes The suffixes to check
     */
    endsWithAny(...suffixes) {
        for (const s in suffixes)
            if (this.endsWith(suffixes[s]))
                return true;
        return false;
    }
});
