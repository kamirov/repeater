import * as React from "react";
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Popover,
    Select,
    TextField
} from "@material-ui/core";
import {Style} from "./style.types";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from '@material-ui/icons/Delete';

import {useState} from "react";

type Props = {
    onChange?: (key: string) => void
    items: Style[]
    activeItemId: string
    onClickAdd: (styleName: string) => void
    onRemove: (styleId: string) => void

    id?: string
    className?: string
}

function StyleFilter(props: Props) {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const [dialogOpen, setDialogOpen] = React.useState(false);

    const [newStyleName, setNewStyleName] = useState("")

    const activeStyle = props.items.find(i => i.id === props.activeItemId)
    if (typeof activeStyle === 'undefined') {
        throw new Error(`Couldn't find active style`)
    }

    const handleChange = (event: any) => {
        if (typeof props.onChange !== 'undefined') {
            const id = event.target.value
            props.onChange(id)
        }
    }

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

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

    const handleRemoval = () => {
        props.onRemove(activeStyle.id)
        handleDialogClose()
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

    const deleteDialog = <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
    >
        <DialogTitle id="delete-dialog-title">Remove {activeStyle.name}?</DialogTitle>
        <DialogContent>
            <DialogContentText id="delete-dialog-description">
                Removing this style will remove all its moves forever.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
                Cancel
            </Button>
            <Button onClick={handleRemoval} color="primary" autoFocus>
                Remove
            </Button>
        </DialogActions>
    </Dialog>

    const deleteIsDisabled = props.items.length === 1
    const deleteTitle = 'Remove style'

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
        <div className="buttons-container">
            <IconButton aria-label="delete" className="delete-icon" onClick={handleDialogOpen} disabled={deleteIsDisabled} title={deleteTitle}>
                <DeleteIcon />
            </IconButton>
            <IconButton aria-label="add" className="add-icon" onClick={handlePopoverOpen} title={"Add new style"}>
                <AddIcon />
            </IconButton>
        </div>
        {addPopover}
        {deleteDialog}
    </div>
}

export default StyleFilter;
