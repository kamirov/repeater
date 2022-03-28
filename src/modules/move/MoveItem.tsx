import * as React from "react";
import {Move} from "./move.types";

type Props = {
    move: Move

    id?: string
    className?: string
}

function MoveItem(props: Props) {
    return <div id={props.id} className={`${props.className} move-item`}>
        {props.move.name}
    </div>
}

export default MoveItem;
