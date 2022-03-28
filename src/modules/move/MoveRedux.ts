import {Dispatch} from 'redux'
import {Action} from "../../redux/redux.types";
import {Move, MoveType} from "./move.types";
import moves from './moves.json'

export type MoveState = {
    moves: Move[]
    activeMoveType: MoveType
}

export default {
    setActiveMoveType,

    reducer
}

// @ts-ignore
const initialMoves: Move[] = moves

const initialState: MoveState = {
    moves: initialMoves,
    activeMoveType: MoveType.All
}

const actions = {
    setActiveMoveType: 'common/setActiveMoveType',
}

function setActiveMoveType(moveType: MoveType) {
    return (dispatch: Dispatch) => {

        dispatch({
            type: actions.setActiveMoveType,
            payload: moveType
        })
    }
}


function reducer(state = initialState, action: Action): MoveState {
    switch (action.type) {
        case actions.setActiveMoveType:
            return {
                ...state,
                activeMoveType: action.payload
            }
        default:
            return state
    }
}
