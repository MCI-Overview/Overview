import { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useOnboardingContext } from "../../providers/onboardingContextProvider";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import {
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/joy";

const LocationPermissionStep = () => {
  const isDarkMode = localStorage.getItem("joy-mode") === "dark";
  const { handleBack, handleNext } = useOnboardingContext();

  const [isFetchingLocations, setIsFetchingLocations] = useState(false);
  const [currLatitude, setCurrLatitude] = useState<number | null>(null);
  const [currLongitude, setCurrLongitude] = useState<number | null>(null);

  const handleFetchLocation = () => {
    setIsFetchingLocations(true);
    navigator.geolocation.getCurrentPosition((position) => {
      setIsFetchingLocations(false);
      setCurrLatitude(position.coords.latitude);
      setCurrLongitude(position.coords.longitude);
    });
  };

  const blueIcon = new L.Icon({
    iconUrl: "/Images/marker-icon-2x-blue.png",
    shadowUrl: "/Images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <Stack
      sx={{
        height: "100%",
        maxWidth: "600px",
      }}
      gap={1}
    >
      <Typography level="body-sm">
        Let's set up the required location permission for clocking in. <br />
        This location will not be stored.
      </Typography>

      <Button onClick={handleFetchLocation} disabled={isFetchingLocations}>
        {isFetchingLocations ? <CircularProgress /> : "Fetch location"}
      </Button>

      {currLatitude && currLongitude ? (
        <>
          <MapContainer
            center={[currLatitude, currLongitude]}
            zoom={14}
            style={{ height: "400px", width: "100%" }}
            minZoom={12}
            maxZoom={17}
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
              <Marker icon={blueIcon} position={[currLatitude, currLongitude]}>
                <Popup>
                  <Typography level="body-sm">Your location</Typography>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </>
      ) : (
        <Card
          sx={{
            height: "400px",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
          variant="soft"
        />
      )}

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
            disabled={!currLatitude || !currLongitude}
          >
            Next
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};

export default LocationPermissionStep;
