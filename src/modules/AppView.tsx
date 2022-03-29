import React, {useEffect, useState} from "react";
import styled from "@emotion/styled";
import StyleFilter from "./style/StyleFilter";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux/redux.types";
import StyleRedux from "./style/StyleRedux";
import MoveRedux from "./move/MoveRedux";
import {Move, MoveType} from "./move/move.types";
import MoveItem from "./move/MoveItem";
import OrderableList from "./ordering/OrderableList";
import {Orderable} from "./ordering/ordering.types";
import moveRedux from "./move/MoveRedux";
import SelectionBar from "./selection/SelectionBar";
import {SelectionService} from "./selection/SelectionService";

const storagePrefix = 'repeater-items'

const defaultPeriod = 1000

export default function AppView() {

    const styleState = useSelector((state: RootState) => state.style)
    const moveState = useSelector((state: RootState) => state.move)
    const dispatch = useDispatch()

    const [text, setText] = useState("")

    const [comboPeriod, setComboPeriod] = useState(defaultPeriod as number)
    const [simplePeriod, setSimplePeriod] = useState(defaultPeriod as number)

    const [isTimerEnabled, setIsTimerEnabled] = useState(false)
    const [intervalId, setIntervalId] = useState(0 as any)

    useEffect(() => {
        setIsTimerEnabled(false)

        // const storedPeriod = +(window.localStorage.getItem(getPeriodStorageKey(styleState.activeStyleId, moveState.activeMoveType)) || defaultPeriod)
        // setComboPeriod(storedPeriod)
    }, [styleState.activeStyleId, moveState.activeMoveType])

    useEffect(() => {
        if (isTimerEnabled) {
            saySelection()
            setIntervalId(setInterval(() => saySelection(), simplePeriod))
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
            el: <MoveItem
                move={m}
                key={m.id}
                onToggleLearn={() => toggleLearn(m)}
                onDelete={() => deleteMove(m)}
            />
        }
    }

    const learningMoveItems = learningMoves.map(toOrderableMoveItem)
    const learnedMoveItems = learnedMoves.map(toOrderableMoveItem)

    const buttonText = isTimerEnabled ? "Stop" : "Start"

    return <Root>
        <Main>
            <Page>
                <StyleFilter
                    onChange={handleStyleChange}
                    items={styleState.styles}
                    activeItemId={styleState.activeStyleId}
                />

                <SelectionBar
                    buttonText={buttonText}
                    simplePeriod={simplePeriod}
                    comboPeriod={comboPeriod}
                    onComboPeriodChange={handleComboPeriodChange}
                    onSimplePeriodChange={handleSimplePeriodChange}
                    onToggleSelection={toggleSayingRandomWords}
                />

                {Boolean(learningMoveItems.length) &&
                    <OrderableList
                        className="learning-list"
                        label="Learning"
                        items={learningMoveItems}
                        onReorder={reorderLearningItems}
                    />
                }

                {Boolean(learnedMoveItems.length) &&
                    <OrderableList
                        className="learned-list"
                        label="Learned"
                        items={learnedMoveItems}
                        onReorder={() => null}
                    />
                }

                {/*<ItemView onChange={onTextChangeHandler} onBlur={handleBlur} value={text} disabled={moveState.activeMoveType === allKey} />*/}
                {/*<input type="number" min="100" value={period} onChange={e => handleComboPeriodChange(e.target.value as any)} />*/}
                {/*<button onClick={toggleSayingRandomWords} disabled={!text}>*/}
                {/*    {isTimerEnabled && "Stop"}*/}
                {/*    {!isTimerEnabled && "Start"}*/}
                {/*</button>*/}
            </Page>
        </Main>
    </Root>

    function deleteMove(move: Move) {
        if (move.isLearned) {
            dispatch(moveRedux.deleteLearnedMove(move))
        } else {
            dispatch(moveRedux.deleteLearningMove(move))
        }
    }

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

    function handleSimplePeriodChange(period: number) {
        setIsTimerEnabled(false)
        setSimplePeriod(period)
    }

    function handleComboPeriodChange(period: number) {
        setIsTimerEnabled(false)
        setComboPeriod(period)
        // window.localStorage.setItem(getPeriodStorageKey(styleState.activeStyleId, moveState.activeMoveType), period + "")
    }

    function say(item: string) {
        console.log('saying item', item)

        if ('speechSynthesis' in window) {
            // const synthesis = window.speechSynthesis;
            //
            // // Create an utterance object
            // const utterance = new SpeechSynthesisUtterance(item);
            //
            // // Speak the utterance
            // synthesis.speak(utterance);
        } else {
            alert('Text-to-speech not supported.');
        }
    }

    function saySelection() {
        const move = SelectionService.select([
            {
                arr: learningMoves,
                strategy: 'random'
            },
            {
                arr: learnedMoves,
                strategy: 'random'
            },
        ])
        console.log(move)
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
