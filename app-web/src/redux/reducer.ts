import {combineReducers} from '@reduxjs/toolkit'
import Style from '../modules/style/StyleRedux'
import Move from '../modules/move/MoveRedux'

export default combineReducers({
    style: Style.reducer,
    move: Move.reducer,
})
