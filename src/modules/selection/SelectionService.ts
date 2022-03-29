import {ArrayHelper} from "../common/array.helper";

export const SelectionService = {
    select
}

export type SelectionStrategy = 'random'

export type StrategicArrays = {
    arr: any[],
    strategy: SelectionStrategy
}

function select(strategicArrays: StrategicArrays[]) {
    const strategicArray = ArrayHelper.randomElement(strategicArrays)

    if (strategicArray.strategy === 'random') {
        return ArrayHelper.randomElement(strategicArray.arr)
    }
}
