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
import {Orderable} from "./ordering/ordering.types";
import moveRedux from "./move/MoveRedux";

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

        const storedPeriod = +(window.localStorage.getItem(getPeriodStorageKey(styleState.activeStyleId, moveState.activeMoveType)) || defaultPeriod)
        setPeriod(storedPeriod)
    }, [styleState.activeStyleId, moveState.activeMoveType])

    useEffect(() => {
        if (isTimerEnabled) {
            sayRandomWord()
            setIntervalId(setInterval(() => sayRandomWord(), period))
        } else {
            clearInterval(intervalId)
            setIntervalId(0)
        }
    }, [isTimerEnabled])

    const learningMoves = moveState.learningMoves.filter(m => m.styleKey === styleState.activeStyleId)
    const learnedMoves = moveState.learnedMoves.filter(m => m.styleKey === styleState.activeStyleId)

    const toOrderableMoveItem = (m: Move): Orderable => {
        return {
            id: m.id,
            el: <MoveItem move={m} key={m.id} onToggleLearn={() => toggleLearn(m)} />
        }
    }

    const learningMoveItems = learningMoves.map(toOrderableMoveItem)
    const learnedMoveItems = learnedMoves.map(toOrderableMoveItem)

    return <Root>
        <Main>
            <Page>
                <StyleFilter
                    onChange={handleStyleChange}
                    items={styleState.styles}
                    activeItemId={styleState.activeStyleId}
                />
                {/*<MoveTypeFilter*/}
                {/*    onChange={handleListChange}*/}
                {/*    activeMoveType={moveState.activeMoveType} />*/}

                {learnedMoveItems &&
                    <OrderableList
                        label="Learning"
                        items={learningMoveItems}
                        onReorder={reorderLearningItems}
                    />
                }

                {learnedMoveItems &&
                    <OrderableList
                        label="Learned"
                        items={learnedMoveItems}
                        onReorder={() => null}
                    />
                }

                {/*<ItemView onChange={onTextChangeHandler} onBlur={handleBlur} value={text} disabled={moveState.activeMoveType === allKey} />*/}
                {/*<input type="number" min="100" value={period} onChange={e => handlePeriodChange(e.target.value as any)} />*/}
                {/*<button onClick={toggleSayingRandomWords} disabled={!text}>*/}
                {/*    {isTimerEnabled && "Stop"}*/}
                {/*    {!isTimerEnabled && "Start"}*/}
                {/*</button>*/}
            </Page>
        </Main>
    </Root>

    function toggleLearn(move: Move) {
        if (move.isLearned) {
            dispatch(moveRedux.unlearnMove(move))
        } else {
            dispatch(moveRedux.learnMove(move))
        }
    }

    function reorderLearningItems(orderedItems: Orderable[]) {
        const moves = orderedItems.map(o => moveState.learningMoves.find(m => m.id === o.id))

        if (moves.some(m => typeof m === 'undefined')) {
            throw new Error(`Moves could not be parsed from reordered list`)
        }

        dispatch(moveRedux.setLearningMoves(moves as Move[]))
    }

    function handleBlur() {
        updateText(sanitizeText(text))
    }

    function handleListChange(moveType: MoveType) {
        setIsTimerEnabled(false)
        dispatch(MoveRedux.setActiveMoveType(moveType))
    }

    function handleStyleChange(styleId: string) {
        dispatch(StyleRedux.setActiveStyleId(styleId))

        setIsTimerEnabled(false)
    }

    function handlePeriodChange(period: number) {
        setIsTimerEnabled(false)
        setPeriod(period)
        window.localStorage.setItem(getPeriodStorageKey(styleState.activeStyleId, moveState.activeMoveType), period + "")
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
        window.localStorage.setItem(getTextStorageKey(styleState.activeStyleId, moveState.activeMoveType), nextText)
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
