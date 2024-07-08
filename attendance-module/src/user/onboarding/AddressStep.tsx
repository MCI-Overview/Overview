import {
  Stack,
  Box,
  Typography,
  Grid,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Button,
  Autocomplete,
  Checkbox,
} from "@mui/joy";
import { useOnboardingContext } from "../../providers/onboardingContextProvider";
import { readableEnum } from "../../utils/capitalize";
import axios from "axios";

const DEFAULT_ADDRESS = {
  postal: "",
  floor: "",
  unit: "",
  block: "",
  street: "",
  building: "",
  country: "",
  isLanded: false,
};

export default function AddressStep() {
  const {
    oldCandidate,
    newCandidate,
    handleBack,
    handleNext,
    setOldCandidate,
    setNewCandidate,
  } = useOnboardingContext();

  if (!oldCandidate || !newCandidate) {
    return null;
  }

  const {
    postal: oldPostal,
    floor: oldFloor,
    unit: oldUnit,
    block: oldBlock,
    street: oldStreet,
    building: oldBuilding,
    country: oldCountry,
  } = oldCandidate.address || DEFAULT_ADDRESS;
  const {
    postal: newPostal,
    floor: newFloor,
    unit: newUnit,
    block: newBlock,
    street: newStreet,
    building: newBuilding,
    country: newCountry,
    isLanded: newIsLanded,
  } = newCandidate.address || DEFAULT_ADDRESS;

  async function loadAddress() {
    if (!newCandidate) {
      return;
    }

    axios
      .get(
        `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${newPostal}&returnGeom=N&getAddrDetails=Y`,
        { withCredentials: false }
      )
      .then((res) => {
        setNewCandidate({
          ...newCandidate,
          address: {
            ...newCandidate.address,
            block: readableEnum(res.data.results[0].BLK_NO),
            building: readableEnum(res.data.results[0].BUILDING),
            street: readableEnum(res.data.results[0].ROAD_NAME),
            country: "Singapore",
          },
        });
      });
  }

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
          Let us know where you live so we can match you with nearby jobs.
        </Typography>
      </Box>
      <Grid container spacing={2} columns={2} paddingBottom={15}>
        <Grid xs={1} sm={1}>
          <FormControl>
            <FormLabel>Postal Code</FormLabel>
            <Input
              value={newPostal || ""}
              onChange={(e) =>
                setNewCandidate({
                  ...newCandidate,
                  address: {
                    ...newCandidate.address,
                    postal: e.target.value.replace(/[^0-9]/g, ""),
                  },
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  loadAddress();
                }
              }}
            />
          </FormControl>
        </Grid>
        <Grid xs={1} sm={1}>
          <FormControl>
            <FormLabel>⠀</FormLabel>
            <Button
              onClick={loadAddress}
              disabled={
                (newPostal !== undefined && newPostal.length !== 6) ||
                (oldPostal === newPostal &&
                  oldBlock === newBlock &&
                  oldStreet === newStreet &&
                  oldCountry === newCountry &&
                  oldBuilding === newBuilding)
              }
            >
              Search
            </Button>
          </FormControl>
        </Grid>
        <Grid xs={1}>
          <FormControl>
            <FormLabel>Block</FormLabel>
            <Input
              value={newBlock || ""}
              onChange={(e) =>
                setNewCandidate({
                  ...newCandidate,
                  address: {
                    ...newCandidate.address,
                    block: e.target.value.replace(/[^0-9]/g, ""),
                  },
                })
              }
            />
          </FormControl>
        </Grid>
        <Grid xs={1}>
          <FormControl>
            <FormLabel>Country</FormLabel>
            <Autocomplete
              value={newCountry || ""}
              options={["Singapore", "Malaysia"]}
              onChange={(_e, value) =>
                setNewCandidate({
                  ...newCandidate,
                  address: {
                    ...newCandidate.address,
                    country: value || "",
                  },
                })
              }
            />
          </FormControl>
        </Grid>
        <Grid xs={2} sm={1}>
          <FormControl>
            <FormLabel>Building</FormLabel>
            <Input
              value={newBuilding || ""}
              onChange={(e) =>
                setNewCandidate({
                  ...newCandidate,
                  address: {
                    ...newCandidate.address,
                    building: e.target.value,
                  },
                })
              }
            />
          </FormControl>
        </Grid>
        <Grid xs={2} sm={1}>
          <FormControl>
            <FormLabel>Street</FormLabel>
            <Input
              value={newStreet || ""}
              onChange={(e) =>
                setNewCandidate({
                  ...newCandidate,
                  address: {
                    ...newCandidate.address,
                    street: e.target.value,
                  },
                })
              }
            />
          </FormControl>
        </Grid>
        <Grid container xs={2}>
          <Grid xs={1}>
            <FormControl>
              <FormLabel>Floor</FormLabel>
              <Input
                value={newFloor || ""}
                disabled={newIsLanded}
                onChange={(e) =>
                  setNewCandidate({
                    ...newCandidate,
                    address: {
                      ...newCandidate.address,
                      floor: e.target.value.replace(/[^0-9]/g, ""),
                    },
                  })
                }
              />
            </FormControl>
          </Grid>
          <Grid xs={1}>
            <FormControl>
              <FormLabel>Unit</FormLabel>
              <Input
                value={newUnit || ""}
                disabled={newIsLanded}
                onChange={(e) =>
                  setNewCandidate({
                    ...newCandidate,
                    address: {
                      ...newCandidate.address,
                      unit: e.target.value.replace(/[^0-9]/g, ""),
                    },
                  })
                }
              />
            </FormControl>
          </Grid>
          <Grid xs={2} sm={1}>
            <FormControl>
              <Checkbox
                label="Landed property"
                checked={newIsLanded}
                onChange={() => {
                  setNewCandidate({
                    ...newCandidate,
                    address: {
                      ...newCandidate.address,
                      floor: "",
                      unit: "",
                      isLanded: !newIsLanded,
                    },
                  });
                }}
              />
              <FormHelperText>
                Check this if you are living in a landed property.
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>
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
              const updateData = {
                address: {
                  ...(newPostal !== oldPostal && { postal: newPostal }),
                  ...(newFloor !== oldFloor && { floor: newFloor }),
                  ...(newUnit !== oldUnit && { unit: newUnit }),
                  ...(newBlock !== oldBlock && { block: newBlock }),
                  ...(newStreet !== oldStreet && { street: newStreet }),
                  ...(newBuilding !== oldBuilding && { building: newBuilding }),
                  ...(newCountry !== oldCountry && { country: newCountry }),
                  ...((newFloor !== oldFloor || newUnit !== oldUnit) && {
                    isLanded: newIsLanded,
                  }),
                },
              };

              if (Object.keys(updateData.address).length > 0) {
                axios
                  .patch("/api/user", {
                    address: {
                      ...oldCandidate.address,
                      ...updateData.address,
                    },
                  })
                  .then(() => {
                    setOldCandidate({
                      ...oldCandidate,
                      address: {
                        ...oldCandidate.address,
                        ...updateData.address,
                      },
                    });
                    handleNext();
                  });
              } else {
                handleNext();
              }
            }}
            sx={{
              width: "80dvw",
              maxWidth: "600px",
            }}
            disabled={
              !newPostal ||
              !newBlock ||
              !newStreet ||
              !newCountry ||
              !newBuilding ||
              (!newIsLanded && !(newFloor && newUnit))
            }
          >
            Next
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
