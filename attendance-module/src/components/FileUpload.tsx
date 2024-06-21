import { ImageRounded as ImageIcon } from "@mui/icons-material";
import { styled, Button } from "@mui/joy";
import { ChangeEventHandler } from "react";

const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

export default function InputFileUpload({
  label,
  onChange,
}: {
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <Button
      component="label"
      role={undefined}
      tabIndex={-1}
      variant="outlined"
      color="primary"
      startDecorator={<ImageIcon />}
    >
      {label}
      <VisuallyHiddenInput type="file" onChange={onChange} accept="image/*" />
    </Button>
  );
}
