import { ListDivider } from "@mui/joy";

const SmallScreenDivider = () => {
  return (
    <ListDivider
      sx={{
        display: { xs: "block", sm: "none" },
        boxShadow: "0 0 0 100vmax var(--Divider-lineColor)",
        clipPath: "inset(0px -100vmax)",
      }}
    />
  );
};

export default SmallScreenDivider;
