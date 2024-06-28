import {
  Card,
  Box,
  Typography,
  Divider,
  Grid,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  FormHelperText,
  CardOverflow,
  CardActions,
  Button,
  Autocomplete,
} from "@mui/joy";
import { CommonAddress } from "../../../types/common";
import { useState } from "react";
import isEqual from "../../../utils";
import toast from "react-hot-toast";
import axios from "axios";
import { readableEnum } from "../../../utils/capitalize";

type AugmentedAddress = CommonAddress & { isLanded: boolean };

type AddressFormProps = {
  address: CommonAddress | undefined;
  handleSubmit: (
    data: object,
    successCallback: () => void,
    errorCallback: () => void
  ) => void;
};

export default function AddressForm({
  address,
  handleSubmit,
}: AddressFormProps) {
  const [oldAddress, setOldAddress] = useState<AugmentedAddress>({
    ...address,
    isLanded: !address?.floor && !address?.unit,
  } as AugmentedAddress) || {
    postal: "",
    floor: "",
    unit: "",
    block: "",
    street: "",
    building: "",
    country: "",
    isLanded: false,
  };
  const [newAddress, setNewAddress] = useState<AugmentedAddress>(oldAddress);

  const isSame = isEqual(oldAddress, newAddress);

  const isStreetValid = newAddress.street && newAddress.street.length > 0;
  const isBuildingValid = newAddress.building && newAddress.building.length > 0;
  const isCountryValid = newAddress.country && newAddress.country.length > 0;

  const isPostalValid = newAddress.postal && newAddress.postal.length > 0;
  const isBlockValid = newAddress.block && newAddress.block.length > 0;
  const isFloorValid =
    newAddress.isLanded || (newAddress.floor && newAddress.floor.length > 0);
  const isUnitValid =
    newAddress.isLanded || (newAddress.unit && newAddress.unit.length > 0);

  async function loadAddress() {
    axios
      .get(
        `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${newAddress.postal}&returnGeom=N&getAddrDetails=Y`,
        { withCredentials: false }
      )
      .then((res) => {
        setNewAddress({
          ...newAddress,
          block: readableEnum(res.data.results[0].BLK_NO),
          building: readableEnum(res.data.results[0].BUILDING),
          street: readableEnum(res.data.results[0].ROAD_NAME),
          country: "Singapore",
        });
      });
  }

  return (
    <Card>
      <Box sx={{ mb: 1 }}>
        <Typography level="title-md">Address</Typography>
        <Typography level="body-sm">Update your address here.</Typography>
      </Box>
      <Divider />
      <Grid container spacing={2} columns={2}>
        <Grid xs={1} sm={1}>
          <FormControl error={!isPostalValid}>
            <FormLabel>Postal Code</FormLabel>
            <Input
              value={newAddress.postal || ""}
              onChange={(e) =>
                setNewAddress({
                  ...newAddress,
                  postal: e.target.value.replace(/[^0-9]/g, ""),
                })
              }
            />
            <FormHelperText>
              {isPostalValid ? "" : "Postal code cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={1} sm={1}>
          <FormControl>
            <FormLabel>⠀</FormLabel>
            <Button
              onClick={loadAddress}
              disabled={
                newAddress.postal !== undefined &&
                newAddress.postal.length !== 6
              }
            >
              Search
            </Button>
          </FormControl>
        </Grid>
        <Grid xs={1}>
          <FormControl error={!isBlockValid}>
            <FormLabel>Block</FormLabel>
            <Input
              value={newAddress.block || ""}
              onChange={(e) =>
                setNewAddress({
                  ...newAddress,
                  block: e.target.value.replace(/[^0-9]/g, ""),
                })
              }
            />
            <FormHelperText>
              {isBlockValid ? "" : "Block cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={1}>
          <FormControl error={!isCountryValid}>
            <FormLabel>Country</FormLabel>
            <Autocomplete
              value={newAddress.country || ""}
              options={["Singapore", "Malaysia"]}
              onChange={(_e, value) =>
                setNewAddress({
                  ...newAddress,
                  country: value || "",
                })
              }
            />
            <FormHelperText>
              {isCountryValid ? "" : "Country cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={2} sm={1}>
          <FormControl error={!isBuildingValid}>
            <FormLabel>Building</FormLabel>
            <Input
              value={newAddress.building || ""}
              onChange={(e) =>
                setNewAddress({ ...newAddress, building: e.target.value })
              }
            />
            <FormHelperText>
              {isBuildingValid ? "" : "Building cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={2} sm={1}>
          <FormControl error={!isStreetValid}>
            <FormLabel>Street</FormLabel>
            <Input
              value={newAddress.street || ""}
              onChange={(e) =>
                setNewAddress({ ...newAddress, street: e.target.value })
              }
            />
            <FormHelperText>
              {isStreetValid ? "" : "Street cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid container xs={2}>
          <Grid xs={1}>
            <FormControl error={!isFloorValid}>
              <FormLabel>Floor</FormLabel>
              <Input
                value={newAddress.floor || ""}
                disabled={newAddress.isLanded}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    floor: e.target.value.replace(/[^0-9]/g, ""),
                  })
                }
              />
              <FormHelperText>
                {isFloorValid ? "" : "Floor cannot be empty."}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs={1}>
            <FormControl error={!isUnitValid}>
              <FormLabel>Unit</FormLabel>
              <Input
                value={newAddress.unit || ""}
                disabled={newAddress.isLanded}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    unit: e.target.value.replace(/[^0-9]/g, ""),
                  })
                }
              />
              <FormHelperText>
                {isUnitValid ? "" : "Unit cannot be empty."}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs={2} sm={1}>
            <FormControl>
              <Checkbox
                label="Landed property"
                checked={newAddress.isLanded}
                onChange={() => {
                  setNewAddress({
                    ...newAddress,
                    floor: "",
                    unit: "",
                    isLanded: !newAddress.isLanded,
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
      <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
        <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => setNewAddress(oldAddress)}
            disabled={isSame}
          >
            Reset
          </Button>
          <Button
            size="sm"
            variant="solid"
            onClick={async () => {
              handleSubmit(
                {
                  address: newAddress,
                },
                () => {
                  setOldAddress(newAddress);
                  toast.success("Address updated successfully.");
                },
                () => {
                  toast.error("Failed to update address. Please try again.");
                }
              );
            }}
            disabled={
              isSame ||
              !isPostalValid ||
              !isBlockValid ||
              !isStreetValid ||
              !isBuildingValid ||
              !isCountryValid ||
              !isFloorValid ||
              !isUnitValid
            }
          >
            Save
          </Button>
        </CardActions>
      </CardOverflow>
    </Card>
  );
}
