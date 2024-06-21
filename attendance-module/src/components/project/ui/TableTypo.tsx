import { Typography } from "@mui/joy";
import { ReactNode } from "react";

const ThTypo: React.FC<{
  children: ReactNode;
  onClick?: () => void;
}> = ({ children, onClick }) => {
  return (
    <th onClick={onClick} style={{ alignContent: "center" }}>
      <Typography level="body-xs">{children}</Typography>
    </th>
  );
};

const TdTypo: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <td>
      <Typography level="body-xs">{children}</Typography>
    </td>
  );
};

export { ThTypo, TdTypo };
