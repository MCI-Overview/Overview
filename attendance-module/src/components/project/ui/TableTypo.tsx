import { Typography } from "@mui/joy";
import { ColorPaletteProp, SxProps } from "@mui/joy/styles/types";
import { ReactNode } from "react";

const ThTypo: React.FC<{
  colSpan?: number;
  onClick?: () => void;
  children: ReactNode;
}> = ({ colSpan, children, onClick }) => {
  return (
    <th colSpan={colSpan} onClick={onClick} style={{ alignContent: "center" }}>
      <Typography level="body-xs">{children}</Typography>
    </th>
  );
};

const TdTypo: React.FC<{
  colSpan?: number;
  rowSpan?: number;
  children: ReactNode;
  color?: ColorPaletteProp;
  sx?: SxProps;
}> = ({ colSpan, rowSpan, children, color, sx }) => {
  return (
    <td
      colSpan={colSpan}
      rowSpan={rowSpan}
      style={{
        overflow: "auto",
        textOverflow: "ellipsis",
        scrollbarColor: "transparent transparent",
        scrollbarWidth: "none",
      }}
    >
      <Typography level="body-xs" sx={sx} color={color}>
        {children}
      </Typography>
    </td>
  );
};

export { ThTypo, TdTypo };
