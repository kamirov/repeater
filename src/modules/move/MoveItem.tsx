import * as React from "react";
import {Move} from "./move.types";
import {Checkbox, FormControlLabel, FormGroup} from "@material-ui/core";

type Props = {
    move: Move
    onToggleLearn: () => void

    id?: string
    className?: string
}

function MoveItem(props: Props) {

    const checkbox = <Checkbox
        checked={props.move.isLearned}
        onChange={props.onToggleLearn}
    />

    return <div id={props.id} className={`${props.className} move-item`}>
        <FormGroup>
            <FormControlLabel control={checkbox} label={props.move.name} />
        </FormGroup>

    </div>
}

export default MoveItem;
