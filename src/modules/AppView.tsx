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
import {StorageModule} from "./common/StorageModule";

// A bit messy. Eventually can move this to an announcement redux state (see the to-do around the timer below)
const initialSimplePeriod = parseInt(StorageModule.get('simple-period') || '1500')
const initialComboPeriod = parseInt(StorageModule.get('combo-period') || '4000')

export default function AppView() {

    const styleState = useSelector((state: RootState) => state.style)
    const moveState = useSelector((state: RootState) => state.move)
    const dispatch = useDispatch()

    const [activeMove, setActiveMove] = useState(null as Move | null)

    // TODO: These values all pertain to the announcements. The states should be moved to a redux state for that module,
    //  and the components should be moved to ones from that module
    const [simplePeriod, setSimplePeriod] = useState(initialSimplePeriod)
    const [comboPeriod, setComboPeriod] = useState(initialComboPeriod)
    const [isTimerEnabled, setIsTimerEnabled] = useState(false)
    const [intervalId, setIntervalId] = useState(0 as any)

    useEffect(() => {
        setIsTimerEnabled(false)
    }, [styleState.activeStyleId, moveState.activeMoveType])

    useEffect(() => {
        setActiveMove(null)

        if (isTimerEnabled) {
            tick()
        } else {
            clearTimeout(intervalId)
            setIntervalId(0)
        }
    }, [isTimerEnabled])

    useEffect(() => {
        if (activeMove) {
            AnnouncementService.announce([activeMove])

            const period = activeMove.type === MoveType.Simple ? simplePeriod : comboPeriod

            setIntervalId(setTimeout(() => tick(), period))
        }
    }, [activeMove])

    const learningMoves = moveState.learningMoves.filter(m => m.styleId === styleState.activeStyleId)
    const learnedMoves = moveState.learnedMoves.filter(m => m.styleId === styleState.activeStyleId)

    const toOrderableMoveItem = (m: Move): Orderable => {
        return {
            id: m.id,
            el: <MoveItem
                move={m}
                key={m.id}
                isActive={Boolean(activeMove && activeMove.id === m.id)}
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

    const minMovesForAnnouncement = 2
    const toggleIsDisabled = (learningMoves.length + learnedMoves.length < minMovesForAnnouncement)

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
                    toggleIsDisabled={toggleIsDisabled}
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

    function selectMove() {
        if (toggleIsDisabled) {
            throw new Error("Cannot start selecting moves until there are at least 2 moves")
        }

        const strategicArrays: StrategicArray[] = []

        if (learningMoves.length) {
            strategicArrays.push({
                arr: learningMoves,
                strategy: 'priority'
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

        if (activeMove && move.id === activeMove.id) {
            selectMove()
        } else {
            setActiveMove(move)
        }
    }


    // Announcements

    function resetTimer() {
        setIsTimerEnabled(false)
    }

    function tick() {
        selectMove()
    }

    function handleSimplePeriodChange(period: number) {
        resetTimer()

        setIsTimerEnabled(false)
        setSimplePeriod(period)
        StorageModule.set('simple-period', period)
    }

    function handleComboPeriodChange(period: number) {
        resetTimer()

        setIsTimerEnabled(false)
        setComboPeriod(period)
        StorageModule.set('combo-period', period)
    }

    function toggleAnnouncements() {
        if (isTimerEnabled) {
            setIsTimerEnabled(false)
        } else {
            if (toggleIsDisabled) {
                throw new Error("Cannot start announcing until there are at least 2 moves")
            }
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
