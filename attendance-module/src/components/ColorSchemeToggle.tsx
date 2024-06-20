import { useEffect, useState } from "react";
import { useColorScheme, IconButton, IconButtonProps } from "@mui/joy";
import {
  DarkModeRounded as DarkModeIcon,
  LightModeRounded as LightModeIcon,
} from "@mui/icons-material";

export default function ColorSchemeToggle(props: IconButtonProps) {
  const { onClick, sx, ...other } = props;
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mode) {
      const theme = localStorage.getItem("joy-mode");
      localStorage.setItem("chakra-ui-color-mode", theme || "light");
      return;
    }

    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return (
      <IconButton
        size="sm"
        variant="outlined"
        color="neutral"
        {...other}
        sx={sx}
        disabled
      />
    );
  }
  return (
    <IconButton
      id="toggle-mode"
      size="sm"
      variant="outlined"
      color="neutral"
      {...props}
      onClick={(event) => {
        if (mode === "light") {
          setMode("dark");
        } else {
          setMode("light");
        }
        onClick?.(event);
      }}
      sx={[
        {
          "& > *:first-of-type": {
            display: mode === "dark" ? "none" : "initial",
          },
          "& > *:last-of-type": {
            display: mode === "light" ? "none" : "initial",
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <DarkModeIcon />
      <LightModeIcon />
    </IconButton>
  );
}
