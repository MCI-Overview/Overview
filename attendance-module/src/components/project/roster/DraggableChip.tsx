import { Chip } from "@mui/joy";
import type { CSSProperties, FC } from "react";
import { memo } from "react";
import { useDrag } from "react-dnd";

const style: CSSProperties = {
  border: "1px dashed gray",
  backgroundColor: "white",
  padding: "0.5rem 1rem",
  marginRight: "1.5rem",
  marginBottom: "1.5rem",
  cursor: "move",
  float: "left",
};

export interface ChipProps {
  children: React.ReactNode;
  type: string;
  isDropped: boolean;
}

export const DraggableChip: FC<ChipProps> = memo(function Box({
  children,
  type,
}) {
  const [{ opacity }, drag] = useDrag(
    () => ({
      type,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
      }),
    }),
    [type],
  );

  return (
    <Chip ref={drag} style={{ ...style, opacity }} data-testid="box">
      {children}
    </Chip>
  );
});
