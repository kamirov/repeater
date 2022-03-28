import React, {useEffect, useState} from "react";
import styled from "@emotion/styled";
import StyleFilter from "./style/StyleFilter";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux/redux.types";
import StyleRedux from "./style/StyleRedux";
import MoveTypeFilter from "./move/MoveTypeFilter";
import MoveRedux from "./move/MoveRedux";
import {Move, MoveType} from "./move/move.types";
import MoveItem from "./move/MoveItem";
import OrderableList from "./ordering/OrderableList";

const storagePrefix = 'repeater-items'

const defaultPeriod = 7000

export default function AppView() {

    const styleState = useSelector((state: RootState) => state.style)
    const moveState = useSelector((state: RootState) => state.move)
    const dispatch = useDispatch()

    const [text, setText] = useState("")
    const [period, setPeriod] = useState(defaultPeriod as number)
    const [isTimerEnabled, setIsTimerEnabled] = useState(false)
    const [intervalId, setIntervalId] = useState(0 as any)

    useEffect(() => {
        setIsTimerEnabled(false)

        const storedPeriod = +(window.localStorage.getItem(getPeriodStorageKey(styleState.activeStyleKey, moveState.activeMoveType)) || defaultPeriod)
        setPeriod(storedPeriod)
    }, [styleState.activeStyleKey, moveState.activeMoveType])

    useEffect(() => {
        if (isTimerEnabled) {
            sayRandomWord()
            setIntervalId(setInterval(() => sayRandomWord(), period))
        } else {
            clearInterval(intervalId)
            setIntervalId(0)
        }
    }, [isTimerEnabled])

    // TODO Use strict equality as soon as we stop storing data in JSON files (and can thus use enums correctly)
    const moves: Move[] = moveState.moves
            .filter(m => m.styleKey === styleState.activeStyleKey)
            .filter(m => moveState.activeMoveType === MoveType.All || m.type == moveState.activeMoveType)

    const learningMoves = moves.filter(m => !m.isLearned)
    const learnedMoves = moves.filter(m => m.isLearned)

    const toMoveItem = (m: Move) => <MoveItem move={m} key={m.key} />
    const learningMoveItems = learningMoves.map(toMoveItem)
    const learnedMoveItems = learnedMoves.map(toMoveItem)

    return <Root>
        <Main>
            <Page>
                <StyleFilter
                    onChange={handleStyleChange}
                    items={styleState.styles}
                    activeItemKey={styleState.activeStyleKey}
                />
                <MoveTypeFilter
                    onChange={handleListChange}
                    activeMoveType={moveState.activeMoveType} />


                <OrderableList label="Learning">
                    {learningMoveItems}
                </OrderableList>

                <OrderableList label="Learned">
                    {learnedMoveItems}
                </OrderableList>


                {/*<ItemView onChange={onTextChangeHandler} onBlur={handleBlur} value={text} disabled={moveState.activeMoveType === allKey} />*/}
                {/*<input type="number" min="100" value={period} onChange={e => handlePeriodChange(e.target.value as any)} />*/}
                {/*<button onClick={toggleSayingRandomWords} disabled={!text}>*/}
                {/*    {isTimerEnabled && "Stop"}*/}
                {/*    {!isTimerEnabled && "Start"}*/}
                {/*</button>*/}
            </Page>
        </Main>
    </Root>

    function handleBlur() {
        updateText(sanitizeText(text))
    }

    function handleListChange(moveType: MoveType) {
        setIsTimerEnabled(false)
        dispatch(MoveRedux.setActiveMoveType(moveType))
    }

    function handleStyleChange(newStyleNameKey: string) {
        dispatch(StyleRedux.setActiveStyleKey(newStyleNameKey))

        setIsTimerEnabled(false)
    }

    function handlePeriodChange(period: number) {
        setIsTimerEnabled(false)
        setPeriod(period)
        window.localStorage.setItem(getPeriodStorageKey(styleState.activeStyleKey, moveState.activeMoveType), period + "")
    }

    function say(item: string) {
        console.log('saying item', item)

        if ('speechSynthesis' in window) {
            const synthesis = window.speechSynthesis;

            // Create an utterance object
            const utterance = new SpeechSynthesisUtterance(item);

            // Speak the utterance
            synthesis.speak(utterance);
        } else {
            alert('Text-to-speech not supported.');
        }
    }

    function sayRandomWord() {
        const item = getRandomWord()
        say(item)
    }

    function toggleSayingRandomWords() {
        if (isTimerEnabled) {
            setIsTimerEnabled(false)
        } else {
            setIsTimerEnabled(true)
        }
    }

    function getRandomWord() {
        const items = textToItems()
        return items[Math.floor(Math.random()*items.length)]
    }

    function updateText(nextText: string) {
        setIsTimerEnabled(false)
        setText(nextText)
        window.localStorage.setItem(getTextStorageKey(styleState.activeStyleKey, moveState.activeMoveType), nextText)
    }

    function textToItems() {
        return text.split('\n')
    }

}

function sanitizeText(text: string) {
    return text.toLowerCase().split("\n").filter(item => item).sort().join("\n");
}

function getTextStorageKey(styleNameKey: string, activeMoveType: MoveType) {
    return `${storagePrefix}-${styleNameKey}-${activeMoveType}`
}

function getPeriodStorageKey(styleNameKey: string, activeMoveType: MoveType) {
    return `${getTextStorageKey(styleNameKey, activeMoveType)}-period`
}


const Root = styled.div`
display: flex;
flex-direction: column;
min-height: 100vh;
`

const Main = styled.main`
display: flex;
flex-direction: column;
flex: 1;
margin: 0 1rem;
`

const Page = styled.div`
display: block;
margin: auto;
max-width: 600px;
width: 100%;
position: relative;
`

const ItemView = styled.textarea`
height: 400px;
width: 100%;
display: block;
`
