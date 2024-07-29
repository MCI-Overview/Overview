import toast from "react-hot-toast";
import { useRef, useState } from "react";
import { useOnboardingContext } from "../../providers/onboardingContextProvider";

import Webcam from "react-webcam";

import { Box, Button, Stack, Typography } from "@mui/joy";

const CameraPermissionStep = () => {
  const { handleBack, handleNext } = useOnboardingContext();

  const webcamRef = useRef<Webcam>(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCaptureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
      } else {
        toast.error("Failed to capture image, please try again.");
        return;
      }
    }
  };

  return (
    <Stack
      sx={{
        height: "100%",
        maxWidth: "400px",
      }}
      gap={1}
    >
      <Typography level="body-sm">
        Let's set up the required image capturing permission. <br />
        This image will not be stored.
      </Typography>

      {isWebcamOpen ? (
        <Button onClick={handleCaptureImage}>Capture Image</Button>
      ) : (
        <Button onClick={() => setIsWebcamOpen(true)}>Enable camera</Button>
      )}

      <div style={{ position: "relative", width: "100%", height: "360px" }}>
        {isWebcamOpen && (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 360,
              height: 360,
              facingMode: "user",
            }}
            style={{ width: "100%", height: "100%" }}
          />
        )}
        {capturedImage && (
          <img
            src={capturedImage}
            alt="smile!"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </div>

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
            onClick={handleBack}
            variant="outlined"
            sx={{
              width: "80dvw",
              maxWidth: "600px",
            }}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            sx={{
              width: "80dvw",
              maxWidth: "600px",
            }}
            disabled={!capturedImage}
          >
            Next
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};

export default CameraPermissionStep;
