import {Dispatch} from 'redux'
import { Style } from './style.types';
import {Action} from "../../redux/redux.types";

export type StyleState = {
    styles: Style[]
    activeStyleId: string
}

export default {
    setStyles,
    setActiveStyleId,

    addStyle,

    reducer
}

const initialStyles: Style[] = [
    {
        id: 'salsa',
        name: 'Salsa'
    },
    {
        id: 'sensual-bachata',
        name: "Sensual Bachata"
    }
]

const initialState: StyleState = {
    styles: initialStyles,
    activeStyleId: initialStyles[0].id
}

const actions = {
    setStyles: 'style/setStyles',
    addStyle: 'style/addStyle',
    setActiveStyleId: 'style/setActiveStyleId',
}

function addStyle(style: Style) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: actions.addStyle,
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

function setActiveStyleId(id: string) {
    return (dispatch: Dispatch) => {

        dispatch({
            type: actions.setActiveStyleId,
            payload: id
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
        case actions.setStyles:
            return {
                ...state,
                styles: action.payload
            }
        case actions.setActiveStyleId:
            return {
                ...state,
                activeStyleId: action.payload
            }
        default:
            return state
    }
}
