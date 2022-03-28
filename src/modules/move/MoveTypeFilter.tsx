import * as React from "react";
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import {MoveType} from "./move.types";

type Props = {
    onChange?: (moveType: MoveType) => void
    activeMoveType: MoveType

    id?: string
    className?: string
}

function MoveTypeFilter(props: Props) {

    // TODO: Type event
    const handleChange = (event: any) => {
        if (typeof props.onChange !== 'undefined') {
            const itemKey = event.target.value
            props.onChange(itemKey)
        }
    }

    // @ts-ignore TODO: Address type issue with indexing enum
    const menuItems = Object.keys(MoveType).map(m => <MenuItem value={MoveType[m]} key={m}>{m}</MenuItem>)

    return <div id={props.id} className={`${props.className} move-type-filter`}>
        <FormControl fullWidth>
            <InputLabel>Types</InputLabel>
            <Select
                value={props.activeMoveType}
                label="Type"
                onChange={handleChange}
            >
                {menuItems}
            </Select>
        </FormControl>
    </div>
}

export default MoveTypeFilter;
