import { Button, CircularProgress, ColorPaletteProp } from "@mui/joy";
import { useState } from "react";
export default function LoadingRequestButton({
  promise,
  disabled,
  color,
  submitLabel,
  loadingLabel,
}: {
  promise: () => Promise<void>;
  color?: ColorPaletteProp;
  disabled?: boolean;
  submitLabel?: string;
  loadingLabel?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);

    promise().finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <Button
        startDecorator={<CircularProgress variant="solid" />}
        disabled={true}
      >
        {loadingLabel || "Loading…"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleRequest}
      disabled={disabled}
      color={color || "primary"}
    >
      {submitLabel || "Submit"}
    </Button>
  );
}
