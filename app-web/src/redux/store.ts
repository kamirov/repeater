import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit'
import reducer from "./reducer"
import {createLogger} from 'redux-logger'
import {RootState} from "./redux.types";
import {StorageModule} from "../modules/common/StorageModule";
import {BackendModule} from "../modules/common/BackendModule";
import {SyncModule} from "../modules/common/SyncModule";

const defaultMiddleware = getDefaultMiddleware({
    thunk: true,
    serializableCheck: false,
})

const stateKey = 'state'

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
    StorageModule.set(stateKey, state)
    if (BackendModule.isBackendEnabled()) {
        SyncModule.scheduleSync(state)
    }
}

function loadState(): any {
    // Note, this can't be async, since this is the initial state; we do an async call later to refresh the state in case it's different between
    return StorageModule.get(stateKey) || undefined
}

export default store
