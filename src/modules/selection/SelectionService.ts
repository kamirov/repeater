import {ArrayHelper} from "../common/ArrayHelper";

export const SelectionService = {
    select
}

export type SelectionStrategy = 'random' | 'priority'

export type StrategicArray = {
    arr: any[],
    strategy: SelectionStrategy
}

function select(strategicArrays: StrategicArray[], weights: number[] = []) {

    // Select the array from which to select an element. We do so randomly, optionally with weights to shift probability towards one of the arrays
    let strategicArray

    if (strategicArrays.length === 1) {
        strategicArray = strategicArrays[0]
    } else {
        if (weights.length) {
            const total = weights.reduce((p, c) => p + c, 0)

            if (total !== 100) {
                throw new Error(`Weights, if present, must add up to 100. Got ${weights.join(', ')}`)
            }
        }

        if (!weights.length) {
            strategicArray = ArrayHelper.randomElement(strategicArrays)
        } else {
            strategicArray = ArrayHelper.randomWeightedElement(strategicArrays, weights)
        }
    }

    switch (strategicArray.strategy) {
        // Selects items at random
        case 'random':
            return ArrayHelper.randomElement(strategicArray.arr)

        // Splits list into a priority sublist and a nonpriority sublist, picks one of them at random, then picks a random element within
        case 'priority':
            const priorityItems = 3     // If changing this, make sure to change it in CSS as well for .orderable-item
            const priorityArr = strategicArray.arr.slice(0, priorityItems)
            const nonPriorityArr = strategicArray.arr.slice(priorityItems)

            const subArrayToPickFrom = nonPriorityArr.length ?
                ArrayHelper.randomElement([priorityArr, nonPriorityArr]) :
                priorityArr

            return ArrayHelper.randomElement(subArrayToPickFrom)
    }
}
