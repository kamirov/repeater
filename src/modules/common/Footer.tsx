import * as React from "react";
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
    // function updateState() {
    //     if (isValidState) {
    //         try {
    //             const parsedState = JSON.parse(stringState);
    //             StorageModule.set('state', parsedState)
    //             window.location.reload();
    //         } catch (e) {
    //             alert("Error updating stored state: " + e.message)
    //             console.error(e)
    //         }
    //     } else {
    //         alert("String state is currently invalid")
    //     }
    // }
    //
    // function validateStringState() {
    //     let parsedState: RootState;
    //     try {
    //         parsedState = JSON.parse(stringState);
    //         if (stateIsValid(parsedState)) {
    //             setIsValidState(true)
    //         } else {
    //             setIsValidState(true)
    //         }
    //     } catch (e) {
    //         setIsValidState(false)
    //     }
    // }

    return <footer>
        {/*<TextField*/}
        {/*    className={"string-state " + (isValidState ? "valid" : "invalid")}*/}
        {/*    label={"State structure (for sharing)"}*/}
        {/*    title={"Copy paste this field to another another browser with Repeater to share the app state"}*/}
        {/*    value={stringState}*/}
        {/*    onChange={(event: any) => setStringState(event.target.value)}*/}
        {/*    InputLabelProps={{*/}
        {/*        shrink: true,*/}
        {/*    }}*/}
        {/*/>*/}
        {/*<Button*/}
        {/*    variant="contained"*/}
        {/*    color="primary"*/}
        {/*    onClick={updateState}*/}
        {/*    className={"footer-button"}*/}
        {/*>*/}
        {/*    Update*/}
        {/*</Button>*/}
    </footer>

    // function stateIsValid(possibleState: RootState) {
    //     return possibleState.style &&
    //         possibleState.style.activeStyleId &&
    //         possibleState.style.styles.every(StyleService.isValidStyle) &&
    //         possibleState.move &&
    //         possibleState.move.activeMoveType &&
    //         possibleState.move.learnedMoves.every(MoveService.isValidMove) &&
    //         possibleState.move.learningMoves.every(MoveService.isValidMove)
    // }
}

export default Footer;
