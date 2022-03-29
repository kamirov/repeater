import * as React from "react";
import {Move} from "./move.types";
import {Checkbox, FormControlLabel, FormGroup, IconButton, Switch} from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import PublicIcon from '@material-ui/icons/Public';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import {UrlModule} from "../common/UrlModule";

type Props = {
    move: Move
    onToggleLearn: () => void
    onToggleMoveType: () => void
    onDelete: () => void
    onChange: (move: Move) => void
    isActive: boolean

    id?: string
    className?: string
}

function MoveItem(props: Props) {

    const handleMoveTypeToggle = (event: any) => {
        props.onToggleMoveType()
    }

    const handleLinkChange = (event: any) => {
        const link = event.target.value
        props.onChange({
            ...props.move,
            link
        })
    }

    const handleNameChange = (event: any) => {
        const name = event.target.value
        props.onChange({
            ...props.move,
            name
        })
    }

    const checkbox = <Checkbox className="checkbox"
        checked={props.move.isLearned}
        onChange={props.onToggleLearn}
    />

    const classNameAddendum = props.isActive ? 'active' : ''

    return <div id={props.id} className={`${props.className} move-item ${classNameAddendum}`}>
        <div className="main-row">
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
                    <a href={UrlModule.qualify(props.move.link)} target="_blank">
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
        <div className="input-row">
            <FormGroup className={"input-container"}>
                <div className="icon">
                    <PublicIcon/>
                </div>
                <input
                    className="link"
                    type="text"
                    autoComplete="off"
                    value={props.move.link || ""}
                    onChange={handleLinkChange}
                    placeholder="Name"
                />
            </FormGroup>
        </div>
        <div className="input-row">
            <FormGroup className={"input-container"}>
                <div className="icon">
                    <DirectionsRunIcon/>
                </div>
                <FormControlLabel className="switch-label"
                    control={<Switch checked={props.move.type === 'combo'} onChange={handleMoveTypeToggle} name="move-type" />}
                    label="Combo"
                />
            </FormGroup>
        </div>
    </div>
}

export default MoveItem;
