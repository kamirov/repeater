import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit'
import reducer from "./reducer"
import {createLogger} from 'redux-logger'

const defaultMiddleware = getDefaultMiddleware({
    thunk: true,
    serializableCheck: false,
})

const logger = createLogger()

const middleware = defaultMiddleware.concat(logger)

const store = configureStore({
    reducer,
    middleware
})

// @ts-ignore
if (process.env.NODE_ENV === 'development' && module.hot) {
    // @ts-ignore
    module.hot.accept('./reducer', () => {
        const newRootReducer = require('./reducer').reducer
        store.replaceReducer(newRootReducer)
    })
}

export default store
