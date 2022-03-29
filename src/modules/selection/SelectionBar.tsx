import * as React from "react";
import {Button, TextField} from "@material-ui/core";

type Props = {
    onSimplePeriodChange: (period: number) => void
    onComboPeriodChange: (period: number) => void
    onToggleSelection: () => void

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

    return <div id={props.id} className={`${props.className} selection-bar`}>
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
        <Button variant="contained" color="primary" onClick={props.onToggleSelection}>
            {props.buttonText}
        </Button>
    </div>
}

export default SelectionBar;
