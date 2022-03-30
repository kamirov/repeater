import * as React from "react";
import OrderableItem from "./OrderableItem";
import {useCallback} from "react";
import {Orderable} from "./ordering.types";
import update from 'immutability-helper'

type Props = {

    items: Orderable[]
    onReorder: (items: Orderable[]) => void

    id?: string
    className?: string
    children?: any
}

function OrderableList(props: Props) {

    const moveItem = useCallback((startIndex: number, endIndex: number) => {
        const reorderedItems = update(props.items, {
            $splice: [
                [startIndex, 1],
                [endIndex, 0, props.items[startIndex] as Orderable],
            ],
        })
        props.onReorder(reorderedItems)
    }, [props.items])

    const renderItem = useCallback(
        (item: Orderable, index: number) => {
            return (
                <OrderableItem
                    key={item.id}
                    index={index}
                    id={item.id}
                    moveItem={moveItem}
                >
                    {item.el}
                </OrderableItem>
            )
        },
        [props.items],
    )

    return <div id={props.id} className={`${props.className} orderable-list-container`}>
        <div className="orderable-list">
            {props.items.map((item, i) => renderItem(item, i))}
        </div>
    </div>
}

export default OrderableList;
