import type { CSSProperties, FC } from 'react';
import { memo } from 'react';
import { useDrop } from 'react-dnd';
import { Card, Typography, Stack } from '@mui/joy';

const style: CSSProperties = {
    color: 'white'
};

export interface DustbinProps {
    accept: string[];
    lastDroppedItem?: any;
    onDrop: (item: any | null) => void;
    name: string;
    date: string;
}

export const Dustbin: FC<DustbinProps> = memo(function Dustbin({
    accept,
    lastDroppedItem,
    onDrop,
    name,
    date
}) {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept,
        drop: (item) => onDrop(item),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const [{ isOver: isOverRemove, canDrop: canDropRemove }, remove] = useDrop({
        accept,
        drop: () => onDrop(null), // Handle removal
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const isActive = isOver && canDrop;
    const isRemoveActive = isOverRemove && canDropRemove;
    let backgroundColor = '';
    if (isActive) {
        backgroundColor = 'darkgreen';
    } else if (canDrop) {
        backgroundColor = 'darkkhaki';
    } else if (lastDroppedItem) {
        backgroundColor = '';
    }

    return (
        <div ref={drop} style={{ ...style, backgroundColor }} data-testid="dustbin">
            <Stack>
                <Card sx={{
                    "--Card-padding": "4px"
                }}>
                    <Typography level="body-xs">
                        {lastDroppedItem ? `${lastDroppedItem.name} ${lastDroppedItem.personName} ${date}` : '?'}
                    </Typography>
                </Card>
            </Stack>
            <div ref={remove} style={{ display: 'none' }} /> {/* Hidden remove target */}
        </div>
    );
});
