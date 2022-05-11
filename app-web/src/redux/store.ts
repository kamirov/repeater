import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit'
import reducer from "./reducer"
import {createLogger} from 'redux-logger'
import {RootState} from "./redux.types";
import {StorageModule} from "../modules/common/StorageModule";
import {BackendModule} from "../modules/common/BackendModule";

const defaultMiddleware = getDefaultMiddleware({
    thunk: true,
    serializableCheck: false,
})

const logger = createLogger()

const middleware = defaultMiddleware.concat(logger)


// @ts-ignore
const preloadedState = loadState();

const store = configureStore({
    reducer,
    preloadedState,
    middleware
})
store.subscribe(() => saveState(store.getState()));

// @ts-ignore
if (process.env.NODE_ENV === 'development' && module.hot) {
    // @ts-ignore
    module.hot.accept('./reducer', () => {
        const newRootReducer = require('./reducer').reducer
        store.replaceReducer(newRootReducer)
    })
}

function saveState(state: RootState) {
    if (BackendModule.getApiSecret()) {
        return BackendModule.put('state', {
            state
        })
    } else {
        StorageModule.set('state', state)
    }
}
function loadState(): any {
    if (BackendModule.getApiSecret()) {
        return BackendModule.get('state')
    } else {
        return StorageModule.get('state') || undefined
    }
}

export default store
