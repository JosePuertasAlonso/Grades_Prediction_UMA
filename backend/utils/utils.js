function calcularMediana(arr) {
    arr.sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

function calcularModa(arr) {
    const freqMap = {};
    arr.forEach(val => freqMap[val] = (freqMap[val] || 0) + 1);
    let maxFreq = 0;
    let moda = [];
    for (const key in freqMap) {
        if (freqMap[key] > maxFreq) {
            moda = [Number(key)];
            maxFreq = freqMap[key];
        } else if (freqMap[key] === maxFreq) {
            moda.push(Number(key));
        }
    }
    return moda.length === arr.length ? [] : moda;
}

module.exports = {
    calcularMediana,
    calcularModa
};
