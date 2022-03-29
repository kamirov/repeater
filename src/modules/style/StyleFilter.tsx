import * as React from "react";
import {Button, FormControl, IconButton, InputLabel, MenuItem, Popover, Select, TextField} from "@material-ui/core";
import {Style} from "./style.types";
import AddIcon from "@material-ui/icons/Add";
import {useState} from "react";

type Props = {
    onChange?: (key: string) => void
    items: Style[]
    activeItemId: string
    onClickAdd: (styleName: string) => void

    id?: string
    className?: string
}

function StyleFilter(props: Props) {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [newStyleName, setNewStyleName] = useState("")

    const handleChange = (event: any) => {
        if (typeof props.onChange !== 'undefined') {
            const id = event.target.value
            props.onChange(id)
        }
    }

    const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const handleAdd = (event: any) => {
        props.onClickAdd(newStyleName)
        setNewStyleName("")

        handlePopoverClose()
    }

    const menuItems = props.items.map(i => <MenuItem value={i.id} key={i.id}>{i.name}</MenuItem>)

    const open = Boolean(anchorEl);
    const popoverId = open ? 'add-style-popover' : undefined;
    const addPopover = <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
        }}
    >
        <TextField
            label="Name"
            value={newStyleName}
            onChange={(event: any) => setNewStyleName(event.target.value)}
            InputLabelProps={{
                shrink: true,
            }}
        />
        <Button variant="contained" color="primary" onClick={handleAdd}>
            Add style
        </Button>
    </Popover>

    return <div id={props.id} className={`${props.className} style-list-container`}>
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
        <IconButton aria-label="add" className="add-icon" onClick={handlePopoverOpen}>
            <AddIcon />
        </IconButton>
        {addPopover}
    </div>
}

export default StyleFilter;
