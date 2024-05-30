import type { FC } from 'react'
import { memo, useState } from 'react'

import { Box2 } from './Box2';
import { ItemTypes } from './ItemTypes';

interface Box2State {
    name: string
    type: string
}

export interface DustbinSpec {
    accepts: string[]
    lastDroppedItem: any
}
export interface Box2Spec {
    name: string
    type: string
}
export interface ContainerState {
    droppedBox2Names: string[]
    dustbins: DustbinSpec[]
    Box2es: Box2Spec[]
}

export const Container: FC = memo(function Container() {

    const [Box2es] = useState<Box2State[]>([
        { name: 'Bottle', type: ItemTypes.GLASS },
        { name: 'Banana', type: ItemTypes.FOOD },
        { name: 'Magazine', type: ItemTypes.PAPER },
    ])

    const [droppedBox2Names] = useState<string[]>([])

    function isDropped(Box2Name: string) {
        return droppedBox2Names.indexOf(Box2Name) > -1
    }

    return (
        <div style={{ overflow: 'hidden', clear: 'both' }}>
            {Box2es.map(({ name, type }, index) => (
                <Box2
                    name={name}
                    type={type}
                    isDropped={isDropped(name)}
                    key={index}
                />
            ))}
        </div>
    )
})
