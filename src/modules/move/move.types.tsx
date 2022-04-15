export type Move = {
    id: string,
    name: string,
    styleId: string
    description: string | null
    link: string | null
    type: MoveType
    isLearned: boolean
    isDisabled?: boolean        // TODO: This is optional for historical reasons. Once all stored elements have this field, we should make it mandatory
    period?: number
}

export enum MoveType {
    'Simple' = 'simple',
    'Combo' = 'combo'
}
