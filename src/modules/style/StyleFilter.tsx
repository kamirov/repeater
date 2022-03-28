import * as React from "react";
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import {Style} from "./style.types";

type Props = {
    onChange?: (key: string) => void
    items: Style[]
    activeItemId: string

    id?: string
    className?: string
}

function StyleFilter(props: Props) {

    // TODO: Type event
    const handleChange = (event: any) => {
        if (typeof props.onChange !== 'undefined') {
            const id = event.target.value
            props.onChange(id)
        }
    }

    const menuItems = props.items.map(i => <MenuItem value={i.id} key={i.id}>{i.name}</MenuItem>)

    return <div id={props.id} className={`${props.className} style-list`}>
        <FormControl fullWidth>
            <InputLabel>Styles</InputLabel>
            <Select
                value={props.activeItemId}
                label="Styles"
                onChange={handleChange}
            >
                {menuItems}
            </Select>
        </FormControl>
    </div>
}

export default StyleFilter;
