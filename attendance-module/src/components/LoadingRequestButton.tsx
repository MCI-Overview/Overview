import { Button, CircularProgress } from "@mui/joy";
import { useState } from "react";
export default function LoadingRequestButton({
  promise,
  disabled,
  submitLabel,
  loadingLabel,
}: {
  promise: () => Promise<void>;
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
    <Button onClick={handleRequest} disabled={disabled}>
      {submitLabel || "Submit"}
    </Button>
  );
}
