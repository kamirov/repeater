export const ArrayHelper ={
    randomElement,
    randomWeightedElement
}

function randomElement(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)]
}

// Shameless taken from https://blobfolio.com/2019/randomizing-weighted-choices-in-javascript/
function randomWeightedElement(data: any[], weights: number[]) {
    if (data.length !== weights.length) {
        throw new Error(`Number of elements in data array (${data.length}) must be equal to number of elements in weights array (${weights.length})`)
    }

    // Storage for our flat array.
    let out = [];

    // Loop through the master entries.
    for (let i = 0; i < weights.length; ++i) {
        // Push the value over and over again according to its
        // weight.
        for (let j = 0; j < weights[i]; ++j) {
            out.push(data[i]);
        }
    }

    // And done!
    return out[Math.floor(Math.random() * out.length)];
}
