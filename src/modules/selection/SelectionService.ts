import {ArrayHelper} from "../common/ArrayHelper";

export const SelectionService = {
    select
}

export type SelectionStrategy = 'random' | 'priority'

export type StrategicArray = {
    arr: any[],
    strategy: SelectionStrategy
}

function select(strategicArrays: StrategicArray[]) {
    const strategicArray = ArrayHelper.randomElement(strategicArrays)

    switch (strategicArray.strategy) {
        case 'random':
            return ArrayHelper.randomElement(strategicArray.arr)
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
