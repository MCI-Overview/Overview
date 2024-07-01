import {
  Card,
  Box,
  Typography,
  Divider,
  Grid,
  FormControl,
  FormLabel,
  Input,
  CardOverflow,
  CardActions,
  Button,
  FormHelperText,
  Autocomplete,
} from "@mui/joy";
import { BankDetails } from "../../../types/common";
import { useState } from "react";
import isEqual from "../../../utils";
import toast from "react-hot-toast";

type BankDetailsFormProps = {
  bankDetails: BankDetails | undefined;
  handleSubmit: (
    data: object,
    successCallback: () => void,
    errorCallback: () => void
  ) => void;
};

export default function BankDetailsForm({
  bankDetails,
  handleSubmit,
}: BankDetailsFormProps) {
  const [oldBankDetails, setOldBankDetails] = useState<BankDetails>(
    bankDetails || {
      bankHolderName: "",
      bankName: "",
      bankNumber: "",
    }
  );
  const [newBankDetails, setNewBankDetails] =
    useState<BankDetails>(oldBankDetails);

  const isSame = isEqual(oldBankDetails, newBankDetails);

  const isBankHolderNameValid =
    newBankDetails.bankHolderName && newBankDetails.bankHolderName.length > 0;
  const isBankNameValid =
    newBankDetails.bankName && newBankDetails.bankName.length > 0;
  const isBankNumberValid =
    newBankDetails.bankNumber && newBankDetails.bankNumber.length > 0;

  return (
    <Card>
      <Box sx={{ mb: 1 }}>
        <Typography level="title-md">Bank details</Typography>
        <Typography level="body-sm">Update your bank details here.</Typography>
      </Box>
      <Divider />
      <Grid container columns={2} spacing={2}>
        <Grid xs={2} sm={1}>
          <FormControl error={!isBankHolderNameValid}>
            <FormLabel>Bank Holder Name</FormLabel>
            <Input
              value={newBankDetails.bankHolderName || ""}
              onChange={(e) =>
                setNewBankDetails({
                  ...newBankDetails,
                  bankHolderName: e.target.value,
                })
              }
            />
            <FormHelperText>
              {isBankHolderNameValid ? "" : "Bank holder name cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={2} sm={1}>
          <FormControl error={!isBankNameValid}>
            <FormLabel>Bank Name</FormLabel>
            <Autocomplete
              value={newBankDetails.bankName || ""}
              options={[
                "DBS/POSB",
                "UOB",
                "OCBC",
                "HSBC Personal",
                "Standard Chartered",
                "Maybank",
                "Citibank",
              ]}
              onChange={(_e, value) =>
                setNewBankDetails({
                  ...newBankDetails,
                  bankName: value || "",
                })
              }
            />
            <FormHelperText>
              {isBankNameValid ? "" : "Bank name cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={2} sm={1}>
          <FormControl error={!isBankNumberValid}>
            <FormLabel>Bank Account Number</FormLabel>
            <Input
              value={newBankDetails.bankNumber || ""}
              onChange={(e) => {
                setNewBankDetails({
                  ...newBankDetails,
                  bankNumber: e.target.value.replace(/[^0-9]/g, ""),
                });
              }}
            />
            <FormHelperText>
              {isBankNumberValid ? "" : "Bank account number cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
      <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
        <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => setNewBankDetails(oldBankDetails)}
            disabled={isSame}
          >
            Reset
          </Button>
          <Button
            size="sm"
            variant="solid"
            onClick={() =>
              handleSubmit(
                {
                  bankDetails: newBankDetails,
                },
                () => {
                  setOldBankDetails(newBankDetails);
                  toast.success("Bank details updated successfully.");
                },
                () => {
                  toast.error(
                    "Failed to update bank details. Please try again."
                  );
                }
              )
            }
            disabled={
              isSame ||
              !isBankHolderNameValid ||
              !isBankNameValid ||
              !isBankNumberValid
            }
          >
            Save
          </Button>
        </CardActions>
      </CardOverflow>
    </Card>
  );
}
