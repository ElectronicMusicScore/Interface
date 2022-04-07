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
}
