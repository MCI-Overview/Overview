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

  const isStreetValid = newAddress.street.length > 0;
  const isBuildingValid = newAddress.building.length > 0;
  const isCountryValid = newAddress.country.length > 0;

  const isPostalValid = newAddress.postal && newAddress.postal.length > 0;
  const isBlockValid = newAddress.block && newAddress.block.length > 0;
  const isFloorValid =
    newAddress.isLanded || (newAddress.floor && newAddress.floor.length > 0);
  const isUnitValid =
    newAddress.isLanded || (newAddress.unit && newAddress.unit.length > 0);

  const isPostalPositive = newAddress.postal && parseInt(newAddress.postal) > 0;
  const isBlockPositive = newAddress.block && parseInt(newAddress.block) > 0;
  const isFloorPositive =
    newAddress.isLanded || (newAddress.floor && parseInt(newAddress.floor) > 0);
  const isUnitPositive =
    newAddress.isLanded || (newAddress.unit && parseInt(newAddress.unit) > 0);

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
      <Grid container columns={2} spacing={2}>
        <Grid xs={1}>
          <FormControl error={!isPostalValid || !isBlockPositive}>
            <FormLabel>Postal Code</FormLabel>
            <Input
              value={newAddress.postal}
              onChange={(e) =>
                setNewAddress({ ...newAddress, postal: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "-") {
                  e.preventDefault();
                }
              }}
            />
            <FormHelperText>
              {isPostalValid ? "" : "Postal code cannot be empty."}
              {!isPostalValid || isPostalPositive
                ? ""
                : "Postal code must be positive."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={1}>
          <FormControl>
            <FormLabel>⠀</FormLabel>
            <Button
              onClick={loadAddress}
              disabled={newAddress.postal.length !== 6}
            >
              Search
            </Button>
          </FormControl>
        </Grid>
        <Grid xs={1}>
          <FormControl error={!isBlockValid || !isBlockPositive}>
            <FormLabel>Block</FormLabel>
            <Input
              value={newAddress.block}
              type="number"
              onChange={(e) =>
                setNewAddress({ ...newAddress, block: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "-") {
                  e.preventDefault();
                }
              }}
            />
            <FormHelperText>
              {isBlockValid ? "" : "Block cannot be empty."}
              {!isBlockValid || isBlockPositive
                ? ""
                : "Block must be positive."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={1}>
          <FormControl error={!isBuildingValid}>
            <FormLabel>Building</FormLabel>
            <Input
              value={newAddress.building}
              onChange={(e) =>
                setNewAddress({ ...newAddress, building: e.target.value })
              }
            />
            <FormHelperText>
              {isBuildingValid ? "" : "Building cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={1}>
          <FormControl error={!isStreetValid}>
            <FormLabel>Street</FormLabel>
            <Input
              value={newAddress.street}
              onChange={(e) =>
                setNewAddress({ ...newAddress, street: e.target.value })
              }
            />
            <FormHelperText>
              {isStreetValid ? "" : "Street cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={1}>
          <FormControl error={!isCountryValid}>
            <FormLabel>Country</FormLabel>
            <Input
              value={newAddress.country}
              onChange={(e) =>
                setNewAddress({ ...newAddress, country: e.target.value })
              }
            />
            <FormHelperText>
              {isCountryValid ? "" : "Country cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid container xs={2}>
          <Grid xs={1}>
            <FormControl error={!isFloorValid || !isFloorPositive}>
              <FormLabel>Floor</FormLabel>
              <Input
                value={newAddress.floor}
                disabled={newAddress.isLanded}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    floor: e.target.value,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "e" || e.key === "-") {
                    e.preventDefault();
                  }
                }}
              />
              <FormHelperText>
                {isFloorValid ? "" : "Floor cannot be empty."}
                {!isFloorValid || isFloorPositive
                  ? ""
                  : "Floor must be positive."}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs={1}>
            <FormControl error={!isUnitValid || !isUnitPositive}>
              <FormLabel>Unit</FormLabel>
              <Input
                value={newAddress.unit}
                disabled={newAddress.isLanded}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    unit: e.target.value,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "e" || e.key === "-") {
                    e.preventDefault();
                  }
                }}
              />
              <FormHelperText>
                {isUnitValid ? "" : "Unit cannot be empty."}
                {!isUnitValid || isUnitPositive ? "" : "Unit must be positive."}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs={1}>
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
              !isUnitValid ||
              !isPostalPositive ||
              !isBlockPositive ||
              !isFloorPositive ||
              !isUnitPositive
            }
          >
            Save
          </Button>
        </CardActions>
      </CardOverflow>
    </Card>
  );
}
