export const UrlModule = {
    qualify,
    getFromQueryParams
}

// Prepends protocol if needed; swiped from https://stackoverflow.com/a/24657561/745434
function qualify(possibleUrl: string) {
    if (!/^(?:f|ht)tps?:\/\//.test(possibleUrl)) {
        possibleUrl = "https://" + possibleUrl;
    }
    return possibleUrl;
}

function getFromQueryParams(key: string) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    return urlParams.get(key)
}
