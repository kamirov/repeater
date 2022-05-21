export const UrlModule = {
    qualify
}

// Prepends protocol if needed; swiped from https://stackoverflow.com/a/24657561/745434
function qualify(possibleUrl: string) {
    if (!/^(?:f|ht)tps?:\/\//.test(possibleUrl)) {
        possibleUrl = "https://" + possibleUrl;
    }
    return possibleUrl;
}
