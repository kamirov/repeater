import * as React from "react";

type Props = {
    label?: string

    id?: string
    className?: string
    children?: any
}

function OrderableList(props: Props) {

    const label = props.label ? <span className="label">{props.label}</span> : null

    return <div id={props.id} className={`${props.className} orderable-list-container`}>
        {label}
        <div className="orderable-list">
            {props.children}
        </div>
    </div>
}

export default OrderableList;
