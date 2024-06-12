import { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  Card,
  Modal,
  ModalDialog,
} from "@mui/joy";
import Webcam from "react-webcam";
import axios from "axios";
import Clock from "./Clock";
import toast from "react-hot-toast";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CommonLocation } from "../../types/common";
import L from "leaflet";

export default function ClockIn() {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
  const [currAttendance, setCurrAttendance] = useState(undefined);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currLatitude, setCurrLatitude] = useState<number | null>(null);
  const [currLongitude, setCurrLongitude] = useState<number | null>(null);
  const [projectLocations, setProjectLocations] = useState<CommonLocation[]>(
    []
  );
  const webcamRef = useRef<Webcam>(null);

  const videoConstraints = {
    width: 360,
    height: 360,
    facingMode: "user",
  };

  const handleCaptureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setIsPictureModalOpen(false);

        // TODO: update attendance and upload image

        toast.success("Successfully clocked in!");
      } else {
        toast.error("Failed to capture image, please try again.");
        return;
      }
    }
  };

  const handleGetLocation = () => {
    navigator.geolocation.watchPosition(
      (pos) => {
        setCurrLatitude(pos.coords.latitude);
        setCurrLongitude(pos.coords.longitude);
      },
      () => {
        toast.error("Failed to obtain location data.");
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    axios
      .get("/api/user/attendance")
      .then((response) => {
        const curr = getCurrAttendance(response.data);
        setCurrAttendance(curr);

        console.log(currAttendance);

        setProjectLocations(curr.Shift.Project.locations);
      })
      .catch((error) => console.error(error));
  }, []);

  var redIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // retrieve joy-mode light/dark from localStorage
  const isDarkMode = localStorage.getItem("joy-mode") === "dark";

  return (
    <>
      <Stack
        spacing={4}
        sx={{
          display: "flex",
          maxWidth: "800px",
          mx: "auto",
          px: { xs: 2, md: 6 },
          py: { xs: 2, md: 3 },
          alignItems: "center",
        }}
      >
        <Card>
          <Box>
            <Typography level="title-md">Clock</Typography>
            <Typography level="body-sm">Clock your attendance</Typography>
          </Box>

          <Divider />

          <Clock />

          <Divider />

          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
            <Button
              onClick={() => {
                handleGetLocation();
                setIsLocationModalOpen(true);
              }}
            >
              Clock In
            </Button>
            <Button>Clock Out</Button>
          </Box>
        </Card>

        {/* display captured image */}
        {capturedImage && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <img
              src={capturedImage}
              alt="captured"
              style={{ width: "100%", height: "auto" }}
            />
          </Box>
        )}

        <Modal
          open={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
        >
          <ModalDialog sx={{ width: "600px" }}>
            {currLatitude && currLongitude && (
              <>
                <MapContainer
                  center={[currLatitude, currLongitude]}
                  zoom={15}
                  style={{ height: "400px", width: "100%" }}
                  minZoom={12}
                  maxZoom={18}
                >
                  <TileLayer
                    url={
                      "https://www.onemap.gov.sg/maps/tiles/" +
                      (isDarkMode ? "Night" : "Default") +
                      "/{z}/{x}/{y}.png"
                    }
                    attribution='<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
                    detectRetina={true}
                  />

                  {currLatitude && currLongitude && (
                    <Marker position={[currLatitude, currLongitude]}>
                      <Popup>
                        <Typography level="body-sm">Your location</Typography>
                      </Popup>
                    </Marker>
                  )}

                  {projectLocations.length > 0 &&
                    projectLocations.map((loc) => (
                      <Marker
                        key={loc.postalCode}
                        icon={redIcon}
                        position={[
                          parseFloat(loc.latitude),
                          parseFloat(loc.longitude),
                        ]}
                      >
                        <Popup>
                          <Typography level="body-sm">
                            {loc.address}, {loc.postalCode}
                          </Typography>
                        </Popup>
                      </Marker>
                    ))}
                </MapContainer>

                <Divider />
              </>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Button onClick={handleGetLocation} fullWidth>
                Update Location
              </Button>
              <Button
                onClick={() => {
                  setIsLocationModalOpen(false);
                  setIsPictureModalOpen(true);
                }}
                fullWidth
                disabled={!currLatitude || !currLongitude} // TODO: Add check for location within range
              >
                Next
              </Button>
            </Box>
          </ModalDialog>
        </Modal>

        <Modal
          open={isPictureModalOpen}
          onClose={() => setIsPictureModalOpen(false)}
        >
          <ModalDialog sx={{ width: "400px" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
              />
              <Button onClick={handleCaptureImage} sx={{ mt: 2 }} fullWidth>
                Take photo
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      </Stack>
    </>
  );
}

const getCurrAttendance = (attendanceData: any[]) => {
  const now = new Date();

  // TODO: This should be set on per project basis
  // const startTimeRange = 15 * 60 * 1000; // 15 minutes
  const endTimeRange = 15 * 60 * 1000; // 15 minutes

  const currAttendance = attendanceData.find((attendance: any) => {
    const { correctEnd } = correctTimes(
      attendance.shiftDate,
      attendance.Shift.startTime,
      attendance.Shift.endTime
    );

    // true if current time is before endTimeRange after the end time of the shift
    const cutoff = new Date(correctEnd).getTime() + endTimeRange;
    return now.getTime() <= cutoff;
  });

  return currAttendance;
};

function correctTimes(
  dateStr: string,
  startTimeStr: string,
  endTimeStr: string
): { correctStart: string; correctEnd: string } {
  // Parse the main date
  const mainDate = new Date(dateStr);

  // Parse the start and end times
  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);

  // Replace the date part of the start and end times with the main date
  const correctedStartTime = new Date(
    Date.UTC(
      mainDate.getUTCFullYear(),
      mainDate.getUTCMonth(),
      mainDate.getUTCDate(),
      startTime.getUTCHours(),
      startTime.getUTCMinutes(),
      startTime.getUTCSeconds(),
      startTime.getUTCMilliseconds()
    )
  );

  const correctedEndTime = new Date(
    Date.UTC(
      mainDate.getUTCFullYear(),
      mainDate.getUTCMonth(),
      mainDate.getUTCDate(),
      endTime.getUTCHours(),
      endTime.getUTCMinutes(),
      endTime.getUTCSeconds(),
      endTime.getUTCMilliseconds()
    )
  );

  // Convert to ISO string and ensure the format ends with 'Z' to indicate UTC
  const correctStart = correctedStartTime
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");
  const correctEnd = correctedEndTime.toISOString().replace(/\.\d{3}Z$/, "Z");

  return { correctStart, correctEnd };
}
