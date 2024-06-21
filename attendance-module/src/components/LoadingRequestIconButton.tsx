import { ColorPaletteProp, IconButton } from "@mui/joy";
import { ReactElement, useState } from "react";
export default function LoadingRequestIconButton({
  promise,
  disabled,
  color,
  icon,
}: {
  promise: () => Promise<void>;
  icon: ReactElement;
  color?: ColorPaletteProp;
  disabled?: boolean;
}) {
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
    >
      {icon}
    </IconButton>
  );
}
