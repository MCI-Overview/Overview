import { Button, ColorPaletteProp } from "@mui/joy";
import { useState, forwardRef, ReactNode } from "react";

const LoadingRequestButton = forwardRef<
  HTMLButtonElement,
  {
    promise: () => Promise<void>;
    disabled?: boolean;
    color?: ColorPaletteProp;
    children: ReactNode;
  }
>(({ promise, disabled, color, children }, ref) => {
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    promise().finally(() => setLoading(false));
  };

  return (
    <Button
      variant="soft"
      loading={loading}
      onClick={handleRequest}
      disabled={disabled}
      color={color || "primary"}
      ref={ref}
      sx={{ width: "100%" }}
    >
      {children}
    </Button>
  );
});

export default LoadingRequestButton;
