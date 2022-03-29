import * as React from "react";
import {Move} from "./move.types";
import {Checkbox, FormGroup, IconButton, Switch} from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import PublicIcon from '@material-ui/icons/Public';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import {UrlModule} from "../common/UrlModule";
import {useState} from "react";

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

    const [showFields, setShowFields] = useState(false)

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

    const handleInputFocus = () => {
        setShowFields(true)
    }

    const handleInputBlur = (event: any) => {
        // if the blur was because of outside focus
        // currentTarget is the parent element, relatedTarget is the clicked element
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setShowFields(false)
        }
    }


    const checkbox = <Checkbox className="checkbox"
        checked={props.move.isLearned}
        onChange={props.onToggleLearn}
    />

    const classNameAddendum = props.isActive ? 'active' : ''
    const inputRowClassName = `input-row ${showFields ? 'visible' : ''}`

    return <div
        id={props.id}
        className={`${props.className} move-item ${classNameAddendum}`}
        onBlur={handleInputBlur}
    >
        <div className="main-row">
            <FormGroup className={"check-container"}>
                {checkbox}
                <input
                    type="text"
                    autoComplete="off"
                    aria-autocomplete={"none"}
                    value={props.move.name}
                    onChange={handleNameChange}
                    onFocus={handleInputFocus}
                    placeholder="Move"
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
        <div className={inputRowClassName}>
            <FormGroup className={"input-container"}>
                <div className="icon">
                    <PublicIcon/>
                </div>
                <input
                    className="link"
                    type="text"
                    aria-autocomplete={"none"}
                    autoComplete="off"
                    value={props.move.link || ""}
                    onChange={handleLinkChange}
                    onFocus={handleInputFocus}
                    placeholder="Link"
                />
            </FormGroup>
        </div>
        <div className={inputRowClassName}>
            <FormGroup className={"input-container"}>
                <div className="icon">
                    <DirectionsRunIcon/>
                </div>
                <Switch className="switch" checked={props.move.type === 'combo'} onChange={handleMoveTypeToggle} name="move-type" />
                <span className="switch-label">Combo</span>
            </FormGroup>
        </div>
    </div>
}

export default MoveItem;
