export type Move = {
    id: string,
    name: string,
    styleId: string
    description: string | null
    link: string | null
    type: MoveType
    isLearned: boolean
}

export enum MoveType {
    'Simple' = 'simple',
    'Combo' = 'combo'
}
