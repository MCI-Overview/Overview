import { Typography } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";
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
  sx?: SxProps;
}> = ({ colSpan, rowSpan, children, sx }) => {
  return (
    <td colSpan={colSpan} rowSpan={rowSpan}>
      <Typography level="body-xs" sx={sx}>
        {children}
      </Typography>
    </td>
  );
};

export { ThTypo, TdTypo };
