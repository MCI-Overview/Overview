import {
  ImageRounded as ImageIcon,
  DoneRounded as CheckIcon,
} from "@mui/icons-material";
import { styled, Button } from "@mui/joy";
import { ChangeEventHandler, useState } from "react";

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
  hasFile,
  setState,
}: {
  label: string;
  hasFile?: boolean;
  setState: ChangeEventHandler<HTMLInputElement>;
}) {
  const [upload, setUpload] = useState(hasFile || false);

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setUpload(true);
      setState(event);
    }
  };
  return (
    <Button
      component="label"
      role={undefined}
      tabIndex={-1}
      variant="outlined"
      color={upload ? "success" : "primary"}
      startDecorator={upload ? <CheckIcon /> : <ImageIcon />}
      sx={{
        width: "100%",
      }}
    >
      {`${label}`}
      <VisuallyHiddenInput
        type="file"
        onChange={handleFileChange}
        accept="image/*"
      />
    </Button>
  );
}
