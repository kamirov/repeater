// Syncing state with remote
import {RootState} from "../../redux/redux.types";
import {BackendModule} from "./BackendModule";

export const SyncModule = {
    scheduleSync
};

let timeoutId: NodeJS.Timeout | null = null
const period = 1000

function scheduleSync(state: RootState) {
    if (timeoutId) {
        clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
        sync(state)
    }, period)
}

function sync(state: RootState) {
    BackendModule.put('state', state)
}
