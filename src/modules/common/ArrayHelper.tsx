export const ArrayHelper ={
    randomElement
}

function randomElement(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)]
}
