import {Dispatch} from 'redux'
import { Style } from './style.types';
import {Action} from "../../redux/redux.types";

export type StyleState = {
    styles: Style[]
    activeStyleId: string
}

export default {
    setStyles,
    setActiveStyle,

    addStyle,
    removeStyle,

    reducer
}

// TODO: Allow to run the app with no initial styles, and fill in the styles from scratch
const initialStyles: Style[] = [
    {
        id: 'salsa',
        name: 'Salsa'
    }
]

const initialState: StyleState = {
    styles: initialStyles,
    activeStyleId: initialStyles[0].id
}

const actions = {
    setStyles: 'style/setStyles',
    addStyle: 'style/addStyle',
    removeStyle: 'style/removeStyle',
    setActiveStyle: 'style/setActiveStyle',
}

function addStyle(style: Style) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: actions.addStyle,
            payload: style
        })
    }
}

function removeStyle(style: Style) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: actions.removeStyle,
            payload: style
        })
    }
}

function setStyles(styles: Style[]) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: actions.setStyles,
            payload: styles
        })
    }
}

function setActiveStyle(style: Style) {
    return (dispatch: Dispatch) => {

        dispatch({
            type: actions.setActiveStyle,
            payload: style
        })
    }
}

function reducer(state = initialState, action: Action): StyleState {
    switch (action.type) {
        case actions.addStyle:
            return {
                ...state,
                styles: [
                    action.payload,
                    ...state.styles,
                ]
            }
        case actions.removeStyle:
            const styleToRemove: Style = action.payload

            return {
                ...state,
                styles: state.styles.filter(s => s.id !== styleToRemove.id)
            }
        case actions.setStyles:
            return {
                ...state,
                styles: action.payload
            }
        case actions.setActiveStyle:
            const style: Style = action.payload
            return {
                ...state,
                activeStyleId: style.id
            }
        default:
            return state
    }
}
