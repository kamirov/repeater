// Not currently in use

import { createSlice } from '@reduxjs/toolkit'
import {Style} from "./style.types";

// TODO: Allow to run the app with no initial styles, and fill in the styles from scratch
const initialStyles: Style[] = [
    {
        id: 'salsa',
        name: 'Salsa'
    }
]

export const StyleSlice = createSlice({
    name: 'style',
    initialState: {
        styles: initialStyles,
        activeStyleId: initialStyles[0].id
    },
    reducers: {
        add: (state, action) => {
            state.styles = [
                action.payload,
                ...state.styles,
            ]
        },
        remove: (state, action) => {
            const styleToRemove: Style = action.payload

            state.styles = state.styles.filter(s => s.id !== styleToRemove.id)
        },
        set: (state, action) => {
            state.styles = action.payload
        },
        setActive: (state, action) => {
            state.activeStyleId = action.payload.id
        }
    }
})

export const { add, remove, set, setActive } = StyleSlice.actions

export default StyleSlice.reducer
