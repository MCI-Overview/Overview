import {
  Input,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  FormHelperText,
  List,
  ListItem,
  Grid,
} from "@mui/joy";
import { Location } from "../../../types";
import { useState } from "react";
import axios from "axios";
import { InfoOutlined } from "@mui/icons-material";
import { capitalizeWords } from "../../../utils/capitalize";

export default function ProjectLocationsSection({
  locations,
  setLocations,
}: {
  locations: Location[];
  setLocations: (locations: Location[]) => void;
}) {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string | null>(null);

  function handleAddLocation() {
    if (!postalCode) {
      setErrorMessage("Please enter a postal code");
      return;
    }

    if (postalCode?.length !== 6) {
      setErrorMessage("Postal code should be 6 digits long");
      return;
    }

    try {
      axios
        .get(
          `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postalCode}&returnGeom=Y&getAddrDetails=N`,
          { withCredentials: false },
        )
        .then((response) => {
          if (response.data.found === 0) {
            setErrorMessage("Invalid postal code");
            return;
          }

          const location = {
            postalCode: postalCode,
            address: response.data.results[0].SEARCHVAL,
            latitude: response.data.results[0].LATITUDE,
            longitude: response.data.results[0].LONGITUDE,
          };

          if (
            locations
              .map((location) => location.postalCode)
              .includes(postalCode)
          ) {
            setErrorMessage("Location already added");
            return;
          }

          setLocations([...locations, location]);
        });
    } catch (error) {
      setErrorMessage("Error while fetching location data. Please try again.");
      console.error("Error while fetching location data", error);
    }
  }

  return (
    <>
      <Grid container sx={{ flexGrow: 1 }} xs={12}>
        <Grid
          xs={7}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ pr: 1 }}
        >
          <FormControl sx={{ flexGrow: 1 }} error={errorMessage !== ""}>
            <Input
              type="number"
              placeholder="Enter location postal code"
              onChange={(e) => {
                setErrorMessage("");
                setPostalCode(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddLocation();
                }
              }}
            />
          </FormControl>
        </Grid>
        <Grid xs={5} display="flex" justifyContent="center" alignItems="center">
          <Button sx={{ width: "100%" }} onClick={handleAddLocation}>
            Add location
          </Button>
        </Grid>
        <FormControl error={errorMessage !== ""}>
          <FormHelperText>
            {errorMessage && (
              <>
                <InfoOutlined />
                {errorMessage}
              </>
            )}
          </FormHelperText>
        </FormControl>
      </Grid>
      <Accordion disabled={locations.length === 0} sx={{ paddingX: "0.75rem" }}>
        <AccordionSummary>
          {locations.length === 0
            ? "No location added"
            : `${locations.length} location${
                locations.length > 1 ? "s" : ""
              } added`}
        </AccordionSummary>
        <AccordionDetails>
          <List component="ol" marker="decimal">
            {locations.map((locations) => (
              <ListItem>
                <Typography>
                  {locations.postalCode} - {capitalizeWords(locations.address)}
                </Typography>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
