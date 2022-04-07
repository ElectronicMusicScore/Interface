module.exports = {
    /**
     * Generates a random number between `0` and `maxLimit`.
     * @param {number} maxLimit The maximum number to get the number from inclusive.
     * @return {number}
     */
    generateRandom: (maxLimit = 100) => {
        let rand = Math.random() * maxLimit;

        rand = Math.floor(rand); // 99

        return rand;
    },
    /**
     * Generates a random number between `min` and `max`.
     * @param {number} min The minimum number to get the number from inclusive.
     * @param {number} max The maximum number to get the number from inclusive.
     * @return {number}
     */
    generateRandomRange: (min = 0, max = 100) => {
        // find diff
        let difference = max - min;

        // generate random number
        let rand = Math.random();

        // multiply with difference
        rand = Math.floor(rand * difference);

        // add with min value
        rand = rand + min;

        return rand;
    },
    /**
     * Format bytes as human-readable text.
     *
     * @param bytes Number of bytes.
     * @param si True to use metric (SI) units, aka powers of 1000. False to use
     *           binary (IEC), aka powers of 1024.
     * @param dp Number of decimal places to display.
     *
     * @return Formatted string.
     */
    humanFileSize: (bytes, si = false, dp = 1) => {
        const thresh = si ? 1000 : 1024;

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        const units = si
            ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        const r = 10 ** dp;

        do {
            bytes /= thresh;
            ++u;
        } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


        return bytes.toFixed(dp) + ' ' + units[u];
    },
}
