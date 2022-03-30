import * as React from "react"
import {Button, IconButton, TextField} from "@material-ui/core"
import AddIcon from '@material-ui/icons/Add'
import {MoveType} from "../move/move.types";

type Props = {
    onSimplePeriodChange: (period: number) => void
    onComboPeriodChange: (period: number) => void
    onToggleSelection: () => void
    onClickAdd: (moveType: MoveType) => void
    onActiveMoveCountChange: (count: number) => void

    activeMoveCount: number
    toggleIsDisabled: boolean
    simplePeriod: number
    comboPeriod: number
    buttonText: string

    id?: string
    className?: string
}

function SelectionBar(props: Props) {

    const handleSimplePeriodChange = (event: any) => {
        const period = parseInt(event.target.value) || 0
        props.onSimplePeriodChange(period)
    }

    const handleComboPeriodChange = (event: any) => {
        const period = parseInt(event.target.value) || 0
        props.onComboPeriodChange(period)
    }

    const handleActiveMoveCountChange = (event: any) => {
        const count = parseInt(event.target.value) || 0
        props.onActiveMoveCountChange(count)
    }

    const handleClickAdd = (event: any) => {
        props.onClickAdd(MoveType.Simple)
    }

    return <div id={props.id} className={`${props.className} selection-bar`}>
        <IconButton aria-label="add" onClick={handleClickAdd}>
            <AddIcon />
        </IconButton>
        <TextField
            label="Simple period (ms)"
            type="number"
            value={props.simplePeriod}
            onChange={handleSimplePeriodChange}
            InputLabelProps={{
                shrink: true,
            }}
        />
        <TextField
            label="Combo period (ms)"
            type="number"
            value={props.comboPeriod}
            onChange={handleComboPeriodChange}
            InputLabelProps={{
                shrink: true,
            }}
        />
        <TextField
            label="Chained moves"
            type="number"
            title="This many moves will be read out on each iteration"
            value={props.activeMoveCount}
            onChange={handleActiveMoveCountChange}
            InputLabelProps={{
                shrink: true,
            }}
        />
        <Button variant="contained" color="primary" onClick={props.onToggleSelection} disabled={props.toggleIsDisabled}>
            {props.buttonText}
        </Button>
    </div>
}

export default SelectionBar;
