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
};

/**
 * Adds leading zeros to {num} until the result string has a length of {places}.
 * @param {number} num The number to add leading zeros to.
 * @param {number} places The length that you want the result to have.
 * @returns {string}
 */
const zeroPad = (num, places) => {
    const zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
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
    },
    /**
     * Splits a given string at the specified index.
     * @author Arnau Mora
     * @since 20220414
     * @this {string}
     * @param {number} index The position where to split at.
     * @returns {string[]}
     * @see {string.split}
     */
    splitAt(index) {
        return [this.substring(0, index), this.substring(index + 1)];
    }
});
