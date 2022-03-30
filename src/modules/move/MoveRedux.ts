import {Dispatch} from 'redux'
import {Action} from "../../redux/redux.types";
import {Move, MoveType} from "./move.types";
import {Style} from "../style/style.types";

export type MoveState = {
    learningMoves: Move[]
    learnedMoves: Move[]
    activeMoveType: MoveType
}

export default {
    setLearningMoves,
    setActiveMoveType,

    updateMove,

    learnMove,
    unlearnMove,

    addLearningMove,

    deleteLearningMove,
    deleteLearnedMove,

    removeMovesBelongingToStyle,

    reducer
}

const initialState: MoveState = {
    learningMoves: [],
    learnedMoves: [],
    activeMoveType: MoveType.Simple
}

const actions = {
    setLearningMoves: 'move/setLearningMoves',
    updateMove: 'move/updateMove',
    learnMove: 'move/learnMove',
    unlearnMove: 'move/unlearnMove',
    setActiveMoveType: 'move/setActiveMoveType',
    addLearningMove: 'move/addLearningMove',
    deleteLearningMove: 'move/deleteLearningMove',
    deleteLearnedMove: 'move/deleteLearnedMove',
    removeMovesBelongingToStyle: 'move/removeMovesBelongingToStyle'
}

function updateMove(move: Move) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: actions.updateMove,
            payload: move
        })
    }
}

function addLearningMove(move: Move) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: actions.addLearningMove,
            payload: move
        })
    }
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

function removeMovesBelongingToStyle(style: Style) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: actions.removeMovesBelongingToStyle,
            payload: style
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

        case actions.addLearningMove:
            return {
                ...state,
                learningMoves: [
                    action.payload,
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
        case actions.removeMovesBelongingToStyle:
            const style: Style = action.payload
            return {
                ...state,
                learnedMoves: state.learnedMoves.filter(m => m.styleId !== style.id),
                learningMoves: state.learningMoves.filter(m => m.styleId !== style.id),
            }
        case actions.updateMove:
            const move = action.payload as Move

            const movesArray = move.isLearned ? state.learnedMoves : state.learningMoves
            const index = movesArray.findIndex(m => m.id === move.id)

            if (index === -1) {
                throw new Error(`Move ${move.id} could not be found in moves array`)
            }

            const newMovesArray = [...movesArray]
            newMovesArray[index] = move

            return {
                ...state,
                learningMoves: move.isLearned ? state.learningMoves : newMovesArray,
                learnedMoves: move.isLearned ? newMovesArray : state.learnedMoves
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
