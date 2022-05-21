import * as React from "react";
import {Button} from "@material-ui/core";
import {BackendModule} from "./BackendModule";
import {StorageModule} from "./StorageModule";
type Props = {
    id?: string
    className?: string
}

function Footer(props: Props) {
    // const state = useSelector((state: RootState) => state)
    // const [stringState, setStringState] = useState("")
    // const [isValidState, setIsValidState] = useState(true)
    //
    // useEffect(() => {
    //     const nextStringState = JSON.stringify(StorageModule.get('state'))
    //     setStringState(nextStringState)
    // }, [state])
    //
    // useEffect(() => {
    //     validateStringState()
    // }, [stringState])
    //

    const backendEnabled = BackendModule.isBackendEnabled()
    async function refreshState() {
        if (backendEnabled) {
            try {
                const remoteState = await BackendModule.get('state')
                StorageModule.set('state', remoteState)
                window.location.reload();
            } catch (e: any) {
                alert("Error updating stored state: " + e.message)
                console.error(e)
            }
        } else {
            alert("No backend available")
        }
    }

    return <footer>
        {
            backendEnabled &&
            <Button
                variant="contained"
                color="primary"
                onClick={refreshState}
                fullWidth={true}
                className={"footer-button"}
            >
                Sync State
            </Button>
        }
        <div className="footer-message">
            Made with ♡ by <a href="https://github.com/kamirov">@kamirov</a>. Want to contribute? Check out <a href="https://github.com/kamirov/repeater">the repo</a>
        </div>
    </footer>
}

export default Footer;
