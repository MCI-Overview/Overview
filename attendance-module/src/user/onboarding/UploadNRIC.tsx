import { Typography, Button, Stack, Grid } from "@mui/joy";
import axios from "axios";
import { ChangeEventHandler, useState } from "react";
import LoadingRequestButton from "../../components/LoadingRequestButton";
import FileUpload from "../../components/FileUpload";

export default function UploadNRIC({
  handleNext,
  handleBack,
}: {
  handleNext: () => void;
  handleBack: () => void;
}) {
  const [nricFront, setNricFront] = useState<File | null>(null);
  const [nricBack, setNricBack] = useState<File | null>(null);
  const [nricFrontPreview, setNricFrontPreview] = useState("");
  const [nricBackPreview, setNricBackPreview] = useState("");

  const handleNRICFrontFileChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setNricFront(selectedFile);

      if (nricFrontPreview) {
        URL.revokeObjectURL(nricFrontPreview);
      }

      const previewURL = URL.createObjectURL(selectedFile);
      setNricFrontPreview(previewURL);
    }
  };

  const handleNRICBackFileChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setNricBack(selectedFile);

      if (nricBackPreview) {
        URL.revokeObjectURL(nricBackPreview);
      }

      const previewURL = URL.createObjectURL(selectedFile);
      setNricBackPreview(previewURL);
    }
  };

  const handleNRICSubmit = async () => {
    const formData = new FormData();
    formData.append("nricFront", nricFront!);
    formData.append("nricBack", nricBack!);

    try {
      const response = await axios.post(`/api/user/nric`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        handleNext();
      }
    } catch (error) {
      console.error("Error uploading NRIC images:", error);
    }
  };
  return (
    <>
      <Typography level="body-sm">
        To ensure accurate attendance tracking, please upload both the front and
        back of your NRIC. This helps us verify your identity.
      </Typography>
      <Grid container columns={2} spacing={2}>
        <Grid xs={1}>
          <Stack spacing={2} padding={2}>
            <FileUpload
              onChange={handleNRICFrontFileChange}
              label="Upload NRIC (Front)"
            />
            {nricFrontPreview && (
              <img
                src={nricFrontPreview}
                alt="Image preview"
                style={{ maxWidth: "100%" }}
              />
            )}
          </Stack>
        </Grid>
        <Grid xs={1}>
          <Stack spacing={2} padding={2}>
            <FileUpload
              onChange={handleNRICBackFileChange}
              label="Upload NRIC (Back)"
            />
            {nricBackPreview && (
              <img
                src={nricBackPreview}
                alt="Image preview"
                style={{ maxWidth: "100%" }}
              />
            )}
          </Stack>
        </Grid>
      </Grid>
      <Button variant="outlined" onClick={handleBack}>
        Back
      </Button>
      <LoadingRequestButton
        promise={handleNRICSubmit}
        submitLabel="Upload NRIC"
        loadingLabel="Uploading..."
        disabled={!nricFront || !nricBack}
      />
    </>
  );
}
