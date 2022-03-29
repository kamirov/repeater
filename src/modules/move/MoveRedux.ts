import {Dispatch} from 'redux'
import {Action} from "../../redux/redux.types";
import {Move, MoveType} from "./move.types";
import moves from './moves.json'

export type MoveState = {
    learningMoves: Move[]
    learnedMoves: Move[]
    activeMoveType: MoveType
}

export default {
    setLearningMoves,
    setActiveMoveType,

    learnMove,
    unlearnMove,

    deleteLearningMove,
    deleteLearnedMove,

    reducer
}

// @ts-ignore
const initialLearningMoves: Move[] = moves.filter(m => !m.isLearned)

// @ts-ignore
const initialLearnedMoves: Move[] = moves.filter(m => m.isLearned)

const initialState: MoveState = {
    learningMoves: initialLearningMoves,
    learnedMoves: initialLearnedMoves,
    activeMoveType: MoveType.Simple
}

const actions = {
    setLearningMoves: 'move/setLearningMoves',
    learnMove: 'move/learnMove',
    unlearnMove: 'move/unlearnMove',
    setActiveMoveType: 'move/setActiveMoveType',
    deleteLearningMove: 'move/deleteLearningMove',
    deleteLearnedMove: 'move/deleteLearnedMove'
}

function deleteLearningMove(move: Move) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: actions.deleteLearningMove,
            payload: move.id
        })
    }
}

function deleteLearnedMove(move: Move) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: actions.deleteLearnedMove,
            payload: move.id
        })
    }
}

function learnMove(move: Move) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: actions.learnMove,
            payload: move.id
        })
    }
}

function unlearnMove(move: Move) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: actions.unlearnMove,
            payload: move.id
        })
    }
}

function setLearningMoves(moves: Move[]) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: actions.setLearningMoves,
            payload: moves
        })
    }
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

        case actions.learnMove:
            const learnedMove = state.learningMoves.find(m => m.id === action.payload)
            if (typeof learnedMove === 'undefined') {
                throw new Error(`Could not find move while learning it`)
            }

            return {
                ...state,
                learningMoves: state.learningMoves.filter(m => m.id !== action.payload),
                learnedMoves: [
                    {
                        ...learnedMove,
                        isLearned: true
                    },
                    ...state.learnedMoves,
                ]
            }

        case actions.unlearnMove:
            const unlearnedMove = state.learnedMoves.find(m => m.id === action.payload)
            if (typeof unlearnedMove === 'undefined') {
                throw new Error(`Could not find move while learning it`)
            }

            return {
                ...state,
                learnedMoves: state.learnedMoves.filter(m => m.id !== action.payload),
                learningMoves: [
                    {
                        ...unlearnedMove,
                        isLearned: false
                    },
                    ...state.learningMoves,
                ]
            }
        case actions.deleteLearningMove:
            return {
                ...state,
                learningMoves: [
                    ...state.learningMoves.filter(m => m.id !== action.payload)
                ]
            }
        case actions.deleteLearnedMove:
            return {
                ...state,
                learnedMoves: [
                    ...state.learnedMoves.filter(m => m.id !== action.payload)
                ]
            }
        case actions.setLearningMoves:
            return {
                ...state,
                learningMoves: action.payload
            }
        case actions.setActiveMoveType:
            return {
                ...state,
                activeMoveType: action.payload
            }
        default:
            return state
    }
}
