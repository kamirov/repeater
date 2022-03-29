import * as React from "react";
import {Move} from "./move.types";
import {Checkbox, FormControlLabel, FormGroup, IconButton} from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import PublicIcon from '@material-ui/icons/Public';

type Props = {
    move: Move
    onToggleLearn: () => void
    onDelete: () => void

    id?: string
    className?: string
}

function MoveItem(props: Props) {

    const checkbox = <Checkbox
        checked={props.move.isLearned}
        onChange={props.onToggleLearn}
    />

    return <div id={props.id} className={`${props.className} move-item`}>
        <FormGroup className="check-container">
            <FormControlLabel control={checkbox} label={props.move.name} />
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
