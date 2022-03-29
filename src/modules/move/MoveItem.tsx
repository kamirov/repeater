import * as React from "react";
import {Move} from "./move.types";
import {Checkbox, FormGroup, IconButton, TextField} from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import PublicIcon from '@material-ui/icons/Public';

type Props = {
    move: Move
    onToggleLearn: () => void
    onDelete: () => void
    onChange: (move: Move) => void
    isActive: boolean

    id?: string
    className?: string
}

function MoveItem(props: Props) {

    const handleNameChange = (event: any) => {
        const name = event.target.value
        props.onChange({
            ...props.move,
            name
        })
    }

    const checkbox = <Checkbox
        checked={props.move.isLearned}
        onChange={props.onToggleLearn}
    />

    const classNameAddendum = props.isActive ? 'active' : ''

    return <div id={props.id} className={`${props.className} move-item ${classNameAddendum}`}>
        <FormGroup className={"check-container"}>
            {checkbox}
            <input
                type="text"
                autoComplete="off"
                value={props.move.name}
                onChange={handleNameChange}
                placeholder="Name"
            />
        </FormGroup>
        <div className="icons-container">
            {props.move.link &&
                <a href={props.move.link} target="_blank">
                    <IconButton>
                        <PublicIcon/>
                    </IconButton>
                </a>
            }
            <IconButton onClick={props.onDelete}>
                <DeleteIcon />
            </IconButton>
        </div>
    </div>
}

export default MoveItem;
