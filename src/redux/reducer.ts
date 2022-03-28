import {combineReducers} from '@reduxjs/toolkit'
import Style from '../modules/style/StyleRedux'

export default combineReducers({
    style: Style.reducer,
})
