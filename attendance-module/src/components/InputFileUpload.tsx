import { ChangeEventHandler, useState } from "react";
import imageCompression from "browser-image-compression";

import { styled, Button } from "@mui/joy";
import {
  ImageRounded as ImageIcon,
  DoneRounded as CheckIcon,
} from "@mui/icons-material";

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
  setState: (file: File | null) => void;
}) {
  const [upload, setUpload] = useState(hasFile || false);

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    let selectedFile = event.target.files && event.target.files[0];

    if (!selectedFile || !event.target.files || !event.target.files[0]) return;

    if (selectedFile.size > 1024 * 1024 * 2) {
      selectedFile = await imageCompression(selectedFile, {
        maxSizeMB: 2,
        useWebWorker: true,
      });
    }

    if (selectedFile) {
      setUpload(true);
      setState(selectedFile);
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
