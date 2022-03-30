import * as React from "react";
import OrderableList from "../ordering/OrderableList";
import {Orderable} from "../ordering/ordering.types";

type Props = {
    items: Orderable[]
    onReorder?: (items: Orderable[]) => void
    label: string

    weight?: number,
    onWeightChange?: (weight: number) => void

    id?: string
    className?: string
}

function MoveList(props: Props) {

    const onReorder = props.onReorder ? props.onReorder : () => null

    const handleWeightChange = (event: any) => {
        if (props.onWeightChange) {
            const weight = parseInt(event.target.value) || 0
            props.onWeightChange(weight)
        }
    }

    return <div
        id={props.id}
        className={props.className}
    >
        <div className="move-list-header">
            <span className="list-label">{props.label}</span>
            {Boolean(typeof props.weight !== 'undefined') && <>
                <input
                    type="number"
                    autoComplete="off"
                    max="100"
                    min="0"
                    title="Percentage that the next move item will come from this list"
                    aria-autocomplete={"none"}
                    value={props.weight}
                    className="weight"
                    onChange={handleWeightChange}
                    placeholder="Weight"
                />%
            </>
            }
        </div>
        <OrderableList
            items={props.items}
            onReorder={onReorder}
        />
    </div>
}

export default MoveList;
