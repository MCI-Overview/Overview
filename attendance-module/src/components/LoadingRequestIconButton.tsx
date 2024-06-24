import { ColorPaletteProp, IconButton } from "@mui/joy";
import { ReactElement, useState, forwardRef } from "react";

const LoadingRequestIconButton = forwardRef<
  HTMLButtonElement,
  {
    promise: () => Promise<void>;
    disabled?: boolean;
    color?: ColorPaletteProp;
    icon: ReactElement;
  }
>(({ promise, disabled, color, icon }, ref) => {
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    promise().finally(() => setLoading(false));
  };

  return (
    <IconButton
      variant="soft"
      loading={loading}
      onClick={handleRequest}
      disabled={disabled}
      color={color || "primary"}
      ref={ref}
    >
      {icon}
    </IconButton>
  );
});

export default LoadingRequestIconButton;
