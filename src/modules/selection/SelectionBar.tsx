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
        const period = event.target.value
        props.onSimplePeriodChange(period)
    }

    const handleComboPeriodChange = (event: any) => {
        const period = event.target.value
        props.onComboPeriodChange(period)
    }

    const handleActiveMoveCountChange = (event: any) => {
        const count = event.target.value
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
            label="Simple Period"
            type="number"
            value={props.simplePeriod}
            onChange={handleSimplePeriodChange}
            InputLabelProps={{
                shrink: true,
            }}
        />
        <TextField
            label="Combo Period"
            type="number"
            value={props.comboPeriod}
            onChange={handleComboPeriodChange}
            InputLabelProps={{
                shrink: true,
            }}
        />
        <TextField
            label="Moves"
            type="number"
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
