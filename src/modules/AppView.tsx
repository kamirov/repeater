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
import {SelectionService} from "./selection/SelectionService";
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
                />

                <SelectionBar
                    buttonText={buttonText}
                    simplePeriod={simplePeriod}
                    comboPeriod={comboPeriod}
                    onComboPeriodChange={handleComboPeriodChange}
                    onSimplePeriodChange={handleSimplePeriodChange}
                    onToggleSelection={toggleAnnouncements}
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


    function addNewStyle(name: string) {
        const style = StyleService.createEmptyStyle(name)
        console.log('style', style)
        dispatch(StyleRedux.addStyle(style))
    }

    function addNewMove(styleId: string, type: MoveType) {
        const move = MoveService.createEmptyMove(styleId, type)
        dispatch(MoveRedux.addLearningMove(move))
    }

    function handleMoveChange(move: Move) {
        dispatch(MoveRedux.updateMove(move))
    }

    function deleteMove(move: Move) {
        if (move.isLearned) {
            dispatch(MoveRedux.deleteLearnedMove(move))
        } else {
            dispatch(MoveRedux.deleteLearningMove(move))
        }
    }

    function toggleLearn(move: Move) {
        if (move.isLearned) {
            dispatch(MoveRedux.unlearnMove(move))
        } else {
            dispatch(MoveRedux.learnMove(move))
        }
    }

    function toggleMoveType(move: Move) {
        const newMove: Move = {
            ...move,
            type: move.type === MoveType.Simple ? MoveType.Combo : MoveType.Simple
        }
        dispatch(MoveRedux.updateMove(newMove))
    }

    function reorderLearningItems(orderedItems: Orderable[]) {
        const moves = orderedItems.map(o => moveState.learningMoves.find(m => m.id === o.id))

        if (moves.some(m => typeof m === 'undefined')) {
            throw new Error(`Moves could not be parsed from reordered list`)
        }

        dispatch(MoveRedux.setLearningMoves(moves as Move[]))
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
    }

    function selectMove() {
        const move = SelectionService.select([
            {
                arr: learningMoves,
                strategy: 'random'
            },
            {
                arr: learnedMoves,
                strategy: 'random'
            },
        ]) as Move

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
