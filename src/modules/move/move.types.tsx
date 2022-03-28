export type Move = {
    key: string,
    name: string,
    styleKey: string
    description: string | null
    link: string | null
    type: MoveType
    isLearned: boolean
}

export enum MoveType {
    'Simple' = 'simple',
    'Combo' = 'combo',
    'All' = 'all'
}
