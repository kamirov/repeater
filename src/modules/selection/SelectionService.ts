import {ArrayHelper} from "../common/ArrayHelper";

export const SelectionService = {
    select
}

export type SelectionStrategy = 'random'

export type StrategicArray = {
    arr: any[],
    strategy: SelectionStrategy
}

function select(strategicArrays: StrategicArray[]) {
    const strategicArray = ArrayHelper.randomElement(strategicArrays)

    if (strategicArray.strategy === 'random') {
        return ArrayHelper.randomElement(strategicArray.arr)
    }
}
