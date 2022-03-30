import React, {useEffect, useState} from "react";
import styled from "@emotion/styled";
import StyleFilter from "./style/StyleFilter";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux/redux.types";
import StyleRedux from "./style/StyleRedux";
import MoveRedux from "./move/MoveRedux";
import {Move, MoveType} from "./move/move.types";
import MoveItem from "./move/MoveItem";
import {Orderable} from "./ordering/ordering.types";
import SelectionBar from "./selection/SelectionBar";
import {SelectionService, StrategicArray} from "./selection/SelectionService";
import {MoveService} from "./move/MoveService";
import {AnnouncementService} from "./announcement/AnnouncementService";
import {StyleService} from "./style/StyleService";
import {StorageModule} from "./common/StorageModule";
import MoveList from "./move/MoveList";


// A bit messy. Eventually can move this to an announcement redux state (see the to-do around the timer below)
const storedSimplePeriod = StorageModule.get('simple-period')
const storedComboPeriod = StorageModule.get('combo-period')
const initialSimplePeriod = storedSimplePeriod === null ? 4000 : parseInt(storedSimplePeriod)
const initialComboPeriod = storedComboPeriod === null ? 12000 : parseInt(storedComboPeriod)

// Similar here, but with a selection redux state
const storedLearningWeight = StorageModule.get('learning-weight')
const storedLearnedWeight = StorageModule.get('learned-weight')
const initialLearningWeight = storedLearningWeight === null ? 70 : parseInt(storedLearningWeight)
const initialLearnedWeight = storedLearnedWeight === null ? 30 : parseInt(storedLearnedWeight)

export default function AppView() {

    const styleState = useSelector((state: RootState) => state.style)
    const moveState = useSelector((state: RootState) => state.move)
    const dispatch = useDispatch()

    const [activeMoves, setActiveMoves] = useState([] as Move[])
    const [activeMoveCount, setActiveMoveCount] = useState(1)

    const [learningWeight, setLearningWeight] = useState(initialLearningWeight)
    const [learnedWeight, setLearnedWeight] = useState(initialLearnedWeight)


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
        setActiveMoves([])

        if (isTimerEnabled) {
            tick()
        } else {
            clearTimeout(intervalId)
            setIntervalId(0)
        }
    }, [isTimerEnabled])

    useEffect(() => {
        if (activeMoves.length) {
            AnnouncementService.announce(activeMoves)

            let period = 0
            for (const activeMove of activeMoves) {
                const movePeriod = activeMove.type === MoveType.Simple ? simplePeriod : comboPeriod
                period += movePeriod
            }

            setIntervalId(setTimeout(() => tick(), period))
        }
    }, [activeMoves])

    const learningMoves = moveState.learningMoves.filter(m => m.styleId === styleState.activeStyleId)
    const learnedMoves = moveState.learnedMoves.filter(m => m.styleId === styleState.activeStyleId)

    const toOrderableMoveItem = (m: Move): Orderable => {
        return {
            id: m.id,
            el: <MoveItem
                move={m}
                key={m.id}
                isActive={Boolean(activeMoves.find(am => am.id === m.id))}
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

    const toggleIsDisabled = (learningMoves.length + learnedMoves.length < activeMoveCount)

    const showLearningList = Boolean(learningMoveItems.length)
    const showLearnedList = Boolean(learnedMoveItems.length)

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
                    activeMoveCount={activeMoveCount}
                    onComboPeriodChange={handleComboPeriodChange}
                    onSimplePeriodChange={handleSimplePeriodChange}
                    onToggleSelection={toggleAnnouncements}
                    onActiveMoveCountChange={handleActiveMoveCountChange}
                    toggleIsDisabled={toggleIsDisabled}
                    onClickAdd={(moveType) => addNewMove(styleState.activeStyleId, moveType)}
                />

                {showLearningList && <MoveList
                    label="Learning"
                    items={learningMoveItems}
                    className="learning-move-list"
                    weight={showLearnedList ? learningWeight : undefined}
                    onWeightChange={showLearnedList ? handleLearningWeightChange : undefined}
                    onReorder={reorderLearningItems}
                />
                }

                {showLearnedList && <MoveList
                    label="Learned"
                    className="learned-move-list"
                    items={learnedMoveItems}
                />
                }
            </Page>
        </Main>
    </Root>

    function handleLearningWeightChange(newLearningWeight: number) {
        resetTimer()

        const resolvedLearningWeight = Math.min(
            Math.max(0, newLearningWeight), 100
        )
        const resolvedLearnedWeight = 100 - resolvedLearningWeight

        setLearningWeight(resolvedLearningWeight)
        setLearnedWeight(resolvedLearnedWeight)

        // Avoid an infinite loop edge case
        if (activeMoveCount === learnedMoves.length + learningMoves.length) {
            if (resolvedLearningWeight === 100 || resolvedLearningWeight === 0) {
                handleActiveMoveCountChange(1)
            }
        }

        StorageModule.set('learning-weight', resolvedLearningWeight)
        StorageModule.set('learned-weight', resolvedLearnedWeight)
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

    function handleActiveMoveCountChange(count: number) {
        resetTimer()

        // Avoid an infinite loop edge case
        if (count === learnedMoves.length + learningMoves.length) {
            if (learningWeight === 100) {
                handleLearningWeightChange(99)
            }
            if (learningWeight === 0) {
                handleLearningWeightChange(1)
            }
        }

        if (count < 1) {
            setActiveMoveCount(1)
        } else {
            setActiveMoveCount(count)
        }
    }

    function selectMove() {
        if (toggleIsDisabled) {
            throw new Error(`Cannot start selecting moves until there are at least ${activeMoveCount} moves`)
        }

        const strategicArrays: StrategicArray[] = []
        const weights: number[] = []

        if (learningMoves.length) {
            strategicArrays.push({
                arr: learningMoves,
                strategy: 'priority'
            })
            weights.push(learningWeight)
        }

        if (learnedMoves.length) {
            strategicArrays.push({
                arr: learnedMoves,
                strategy: 'random'
            })
            weights.push(learnedWeight)
        }

        if (!strategicArrays.length) {
            throw new Error("No strategic arrays available")
        }

        const moves: Move[] = []
        for (let i = 0; i < activeMoveCount ; i++) {
            let move = SelectionService.select(strategicArrays, weights) as Move
            while (moves.find(m => m.id === move.id)) {
                move = SelectionService.select(strategicArrays, weights) as Move
            }

            moves.push(move)
        }

        setActiveMoves(moves)
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

        const resolvedPeriod = Math.max(1, period)

        setSimplePeriod(resolvedPeriod)
        StorageModule.set('simple-period', resolvedPeriod)
    }

    function handleComboPeriodChange(period: number) {
        resetTimer()

        const resolvedPeriod = Math.max(1, period)

        setComboPeriod(resolvedPeriod)
        StorageModule.set('combo-period', resolvedPeriod)
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
