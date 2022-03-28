import {Dispatch} from 'redux'
import { Style } from './style.types';
import {Action} from "../../redux/redux.types";

export type StyleState = {
    styles: Style[]
    activeStyleKey: string
}

export default {
    setStyles,
    setActiveStyleKey,

    reducer
}

const initialStyles: Style[] = [
    {
        key: 'salsa',
        name: 'Salsa'
    },
    {
        key: 'sensual-bachata',
        name: "Sensual Bachata"
    }
]

const initialState: StyleState = {
    styles: initialStyles,
    activeStyleKey: initialStyles[0].key
}

const actions = {
    setStyles: 'common/setStyles',
    setActiveStyleKey: 'common/setActiveStyleKey',
}

function setStyles(styles: Style[]) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: actions.setStyles,
            payload: styles
        })
    }
}

function setActiveStyleKey(key: string) {
    return (dispatch: Dispatch) => {

        dispatch({
            type: actions.setActiveStyleKey,
            payload: key
        })
    }
}


function reducer(state = initialState, action: Action): StyleState {
    switch (action.type) {
        case actions.setStyles:
            return {
                ...state,
                styles: action.payload
            }
        case actions.setActiveStyleKey:
            return {
                ...state,
                activeStyleKey: action.payload
            }
        default:
            return state
    }
}
