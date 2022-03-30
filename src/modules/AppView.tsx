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
import SelectionBar from "./selection/SelectionBar";
import {SelectionService, StrategicArray} from "./selection/SelectionService";
import {MoveService} from "./move/MoveService";
import {AnnouncementService} from "./announcement/AnnouncementService";
import {StyleService} from "./style/StyleService";

const defaultPeriod = 1000

export default function AppView() {

    const styleState = useSelector((state: RootState) => state.style)
    const moveState = useSelector((state: RootState) => state.move)
    const dispatch = useDispatch()

    const [activeMoveId, setActiveMoveId] = useState(null as string | null)

    const [comboPeriod, setComboPeriod] = useState(defaultPeriod as number)
    const [simplePeriod, setSimplePeriod] = useState(defaultPeriod as number)

    const [isTimerEnabled, setIsTimerEnabled] = useState(false)
    const [intervalId, setIntervalId] = useState(0 as any)

    useEffect(() => {
        setIsTimerEnabled(false)
    }, [styleState.activeStyleId, moveState.activeMoveType])

    useEffect(() => {
        setActiveMoveId(null)

        if (isTimerEnabled) {
            selectMove()
            setIntervalId(setInterval(() => selectMove(), simplePeriod))
        } else {
            clearInterval(intervalId)
            setIntervalId(0)
        }
    }, [isTimerEnabled])

    const learningMoves = moveState.learningMoves.filter(m => m.styleId === styleState.activeStyleId)
    const learnedMoves = moveState.learnedMoves.filter(m => m.styleId === styleState.activeStyleId)

    const toOrderableMoveItem = (m: Move): Orderable => {
        return {
            id: m.id,
            el: <MoveItem
                move={m}
                key={m.id}
                isActive={activeMoveId === m.id}
                onChange={handleMoveChange}
                onToggleLearn={() => toggleLearn(m)}
                onToggleMoveType={() => toggleMoveType(m)}
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
                    onClickAdd={addNewStyle}
                    onRemove={removeStyle}
                />

                <SelectionBar
                    buttonText={buttonText}
                    simplePeriod={simplePeriod}
                    comboPeriod={comboPeriod}
                    onComboPeriodChange={handleComboPeriodChange}
                    onSimplePeriodChange={handleSimplePeriodChange}
                    onToggleSelection={toggleAnnouncements}
                    toggleIsDisabled={learningMoves.length === 0 && learnedMoves.length === 0}
                    onClickAdd={(moveType) => addNewMove(styleState.activeStyleId, moveType)}
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
            </Page>
        </Main>
    </Root>

    function resetTimer() {
        setIsTimerEnabled(false)
    }

    function removeStyle(styleId: string) {
        resetTimer()

        const remainingStyles = styleState.styles.filter(s => s.id !== styleId)

        if (!remainingStyles.length) {
            throw new Error(`Cannot remove a style when there is only one left`)
        }

        dispatch(StyleRedux.setActiveStyle(remainingStyles[0]))

        const style = styleState.styles.find(s => s.id === styleId)

        if (typeof style === 'undefined') {
            throw new Error(`Couldn't find style with id '${styleId}'`)
        }

        dispatch(StyleRedux.removeStyle(style))
        dispatch(MoveRedux.removeMovesBelongingToStyle(style))

    }

    function addNewStyle(name: string) {
        resetTimer()

        const style = StyleService.createEmptyStyle(name)
        dispatch(StyleRedux.addStyle(style))
    }

    function addNewMove(styleId: string, type: MoveType) {
        resetTimer()

        const move = MoveService.createEmptyMove(styleId, type)
        dispatch(MoveRedux.addLearningMove(move))
    }

    function handleMoveChange(move: Move) {
        resetTimer()

        dispatch(MoveRedux.updateMove(move))
    }

    function deleteMove(move: Move) {
        resetTimer()

        if (move.isLearned) {
            dispatch(MoveRedux.deleteLearnedMove(move))
        } else {
            dispatch(MoveRedux.deleteLearningMove(move))
        }
    }

    function toggleLearn(move: Move) {
        resetTimer()

        if (move.isLearned) {
            dispatch(MoveRedux.unlearnMove(move))
        } else {
            dispatch(MoveRedux.learnMove(move))
        }
    }

    function toggleMoveType(move: Move) {
        resetTimer()

        const newMove: Move = {
            ...move,
            type: move.type === MoveType.Simple ? MoveType.Combo : MoveType.Simple
        }
        dispatch(MoveRedux.updateMove(newMove))
    }

    function reorderLearningItems(orderedItems: Orderable[]) {
        resetTimer()

        const moves = orderedItems.map(o => moveState.learningMoves.find(m => m.id === o.id))

        if (moves.some(m => typeof m === 'undefined')) {
            throw new Error(`Moves could not be parsed from reordered list`)
        }

        dispatch(MoveRedux.setLearningMoves(moves as Move[]))
    }

    function handleStyleChange(styleId: string) {
        resetTimer()

        const style = styleState.styles.find(s => s.id === styleId)

        if (typeof style === 'undefined') {
            throw new Error("Could not find style while changing")
        }

        dispatch(StyleRedux.setActiveStyle(style))

        setIsTimerEnabled(false)
    }

    function handleSimplePeriodChange(period: number) {
        resetTimer()

        setIsTimerEnabled(false)
        setSimplePeriod(period)
    }

    function handleComboPeriodChange(period: number) {
        resetTimer()

        setIsTimerEnabled(false)
        setComboPeriod(period)
    }

    function selectMove() {

        const strategicArrays: StrategicArray[] = []

        if (learningMoves.length) {
            strategicArrays.push({
                arr: learningMoves,
                strategy: 'random'
            })
        }

        if (learnedMoves.length) {
            strategicArrays.push({
                arr: learnedMoves,
                strategy: 'random'
            })
        }

        if (!strategicArrays.length) {
            throw new Error("No strategic arrays available")
        }

        const move = SelectionService.select(strategicArrays) as Move

        setActiveMoveId(move.id)

        AnnouncementService.announce([move])
    }

    function toggleAnnouncements() {
        if (isTimerEnabled) {
            setIsTimerEnabled(false)
        } else {
            setIsTimerEnabled(true)
        }
    }
}

// TODO: Should move these to the stylesheet, or move the stylesheet into these styled blocks

const Root = styled.div`
display: flex;
flex-direction: column;
min-height: 100vh;
`

const Main = styled.main`
display: flex;
justify-content: center;
align-items: flex-start;
margin: 1rem 1rem;
`

const Page = styled.div`
display: block;
margin: auto;
max-width: 600px;
width: 100%;
flex-align: flex-start;
position: relative;
`
