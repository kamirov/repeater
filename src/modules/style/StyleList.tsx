import * as React from "react";
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import {Style} from "./style.types";

type Props = {
    onChange?: (key: string) => void
    items: Style[]
    activeItemKey: string

    id?: string
    className?: string
}

function StyleList(props: Props) {

    // TODO: Type event
    const handleChange = (event: any) => {
        if (typeof props.onChange !== 'undefined') {
            const itemKey = event.target.value
            props.onChange(itemKey)
        }
    }

    const menuItems = props.items.map(i => <MenuItem value={i.key} key={i.key}>{i.name}</MenuItem>)

    return <div id={props.id} className={`${props.className} style-list`}>
        <FormControl fullWidth>
            <InputLabel>Styles</InputLabel>
            <Select
                value={props.activeItemKey}
                label="Styles"
                onChange={handleChange}
            >
                {menuItems}
            </Select>
        </FormControl>
    </div>
}

export default StyleList;
