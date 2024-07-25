import { Box, Typography, Button, Grid, Stack } from "@mui/joy";
import { useOnboardingContext } from "../../providers/onboardingContextProvider";
import { useState } from "react";
import InputFileUpload from "../../components/InputFileUpload";
import axios from "axios";

export default function NRICStep() {
  const {
    oldCandidate,
    newCandidate,
    handleBack,
    handleNext,
    setOldCandidate,
    setNewCandidate,
  } = useOnboardingContext();

  const [nricFrontPreview, setNricFrontPreview] = useState(
    (newCandidate?.nricFront && URL.createObjectURL(newCandidate?.nricFront)) ||
      ""
  );
  const [nricBackPreview, setNricBackPreview] = useState(
    (newCandidate?.nricBack && URL.createObjectURL(newCandidate?.nricBack)) ||
      ""
  );

  const [debugMessage, setDebugMessage] = useState("");

  if (!oldCandidate || !newCandidate) {
    return null;
  }

  const { nricFront: oldNricFront, nricBack: oldNricBack } = oldCandidate;
  const { nricFront: newNricFront, nricBack: newNricBack } = newCandidate;

  const handleNRICFrontFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setNewCandidate({ ...newCandidate, nricFront: selectedFile });

      if (nricFrontPreview) {
        URL.revokeObjectURL(nricFrontPreview);
      }

      const previewURL = URL.createObjectURL(selectedFile);
      setNricFrontPreview(previewURL);
    }
  };

  const handleNRICBackFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setNewCandidate({ ...newCandidate, nricBack: selectedFile });

      if (nricBackPreview) {
        URL.revokeObjectURL(nricBackPreview);
      }

      const previewURL = URL.createObjectURL(selectedFile);
      setNricBackPreview(previewURL);
    }
  };

  return (
    <Stack
      sx={{
        height: "100%",
        maxWidth: "600px",
      }}
      gap={1}
    >
      <Box>
        <Typography level="body-sm">
          Great! We now need you to upload your NRIC.
        </Typography>
      </Box>
      <Grid container columns={2} paddingBottom={15} gap={2}>
        <Grid xs={2} sx={{ maxWidth: "600px" }}>
          <Stack spacing={1}>
            <InputFileUpload
              setState={handleNRICFrontFileChange}
              hasFile={!!newNricFront}
              label="NRIC (Front)"
            />
            {nricFrontPreview && (
              <img
                src={nricFrontPreview}
                alt="NRIC Front preview"
                style={{ maxWidth: "100%" }}
              />
            )}
          </Stack>
        </Grid>
        <Grid xs={2} sx={{ maxWidth: "600px" }}>
          <Stack spacing={1}>
            <InputFileUpload
              setState={handleNRICBackFileChange}
              hasFile={!!newNricBack}
              label="NRIC (Back)"
            />
            {nricBackPreview && (
              <img
                src={nricBackPreview}
                alt="NRIC Back preview"
                style={{ maxWidth: "100%" }}
              />
            )}
          </Stack>
        </Grid>
      </Grid>
      <Box>
        <Typography level="body-sm" color="danger">
          {debugMessage}
        </Typography>
      </Box>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          background: "white",
          paddingY: "1rem",
          width: "100%",
          left: 0,
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Stack spacing={1}>
          <Button
            onClick={() => {
              handleBack();
            }}
            variant="outlined"
            sx={{
              width: "80dvw",
              maxWidth: "600px",
            }}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              const isSameNricFront = oldNricFront === newNricFront;
              const isSameNricBack = oldNricBack === newNricBack;

              const formData = new FormData();

              if (!isSameNricFront) {
                formData.append("nricFront", newNricFront as Blob);
              }

              if (!isSameNricBack) {
                formData.append("nricBack", newNricBack as Blob);
              }

              if (!isSameNricFront || !isSameNricBack) {
                axios
                  .patch("/api/user", formData, {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  })
                  .then(() => {
                    setOldCandidate({
                      ...oldCandidate,
                      nricFront: newNricFront,
                      nricBack: newNricBack,
                    });
                    handleNext();
                  })
                  .catch((error) => {
                    setDebugMessage(error.message);
                  });
              } else {
                handleNext();
              }
            }}
            sx={{
              width: "80dvw",
              maxWidth: "600px",
            }}
            disabled={!newNricFront || !newNricBack}
          >
            Next
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
