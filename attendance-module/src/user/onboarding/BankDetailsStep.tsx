import {
  Stack,
  Box,
  Typography,
  Grid,
  FormControl,
  FormLabel,
  Input,
  Autocomplete,
  Button,
} from "@mui/joy";
import { useOnboardingContext } from "../../providers/onboardingContextProvider";
import axios from "axios";
import InputFileUpload from "../../components/InputFileUpload";
import { useState, ChangeEventHandler } from "react";

export default function BankDetailsStep() {
  const {
    oldCandidate,
    newCandidate,
    handleBack,
    handleNext,
    setOldCandidate,
    setNewCandidate,
  } = useOnboardingContext();

  const [bankStatementPreview, setBankStatementPreview] = useState(
    (newCandidate?.bankStatement &&
      URL.createObjectURL(newCandidate?.bankStatement)) ||
      ""
  );

  if (!oldCandidate || !newCandidate) {
    return null;
  }

  const {
    bankName: oldBankName,
    bankHolderName: oldBankHolderName,
    bankNumber: oldBankNumber,
  } = oldCandidate.bankDetails;
  const {
    bankName: newBankName,
    bankHolderName: newBankHolderName,
    bankNumber: newBankNumber,
  } = newCandidate.bankDetails;

  const { bankStatement: oldBankStatement } = oldCandidate;
  const { bankStatement: newBankStatement } = newCandidate;

  const handleBankStatementFileChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setNewCandidate({ ...newCandidate, bankStatement: selectedFile });

      if (bankStatementPreview) {
        URL.revokeObjectURL(bankStatementPreview);
      }

      const previewURL = URL.createObjectURL(selectedFile);
      setBankStatementPreview(previewURL);
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
          To ensure that you get paid on time, please provide your bank details.
        </Typography>
      </Box>
      <Grid container columns={2} spacing={2}>
        <Grid xs={2} sm={1}>
          <FormControl>
            <FormLabel>Bank Holder Name</FormLabel>
            <Input
              value={newBankHolderName || ""}
              onChange={(e) =>
                setNewCandidate({
                  ...newCandidate,
                  bankDetails: {
                    bankName: newBankName,
                    bankNumber: newBankNumber,
                    bankHolderName: e.target.value,
                  },
                })
              }
            />
          </FormControl>
        </Grid>
        <Grid xs={2} sm={1}>
          <FormControl>
            <FormLabel>Bank Name</FormLabel>
            <Autocomplete
              value={newBankName || ""}
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
                setNewCandidate({
                  ...newCandidate,
                  bankDetails: {
                    bankName: value || "",
                    bankNumber: newBankNumber,
                    bankHolderName: newBankHolderName,
                  },
                })
              }
            />
          </FormControl>
        </Grid>
        <Grid xs={2} sm={1}>
          <FormControl>
            <FormLabel>Bank Account Number</FormLabel>
            <Input
              value={newBankNumber || ""}
              onChange={(e) => {
                setNewCandidate({
                  ...newCandidate,
                  bankDetails: {
                    bankName: newBankName,
                    bankNumber: e.target.value.replace(/[^0-9]/g, ""),
                    bankHolderName: newBankHolderName,
                  },
                });
              }}
            />
          </FormControl>
        </Grid>
        <Grid xs={2} sm={1} sx={{ maxWidth: "600px" }}>
          <Stack spacing={1}>
            <FormControl>
              <FormLabel
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                }}
              >
                ⠀
              </FormLabel>
              <InputFileUpload
                setState={handleBankStatementFileChange}
                hasFile={!!newBankStatement}
                label="Bank Statement"
              />
            </FormControl>
          </Stack>
        </Grid>
        <Grid xs={2} sx={{ maxWidth: "600px" }}>
          {bankStatementPreview && (
            <img
              src={bankStatementPreview}
              alt="Bank Statement preview"
              style={{ maxWidth: "100%" }}
            />
          )}
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
              const isSameBankStatement = oldBankStatement === newBankStatement;

              const formData = new FormData();

              if (!isSameBankStatement) {
                formData.append("bankStatement", newBankStatement as Blob);
              }

              const updateData = {
                bankDetails: {
                  ...(oldBankName !== newBankName && { bankName: newBankName }),
                  ...(oldBankHolderName !== newBankHolderName && {
                    bankHolderName: newBankHolderName,
                  }),
                  ...(oldBankNumber !== newBankNumber && {
                    bankNumber: newBankNumber,
                  }),
                },
              };

              Object.keys(oldCandidate.bankDetails).forEach((key) => {
                formData.set(
                  `bankDetails[${key}]`,
                  (oldCandidate.bankDetails as Record<string, string>)[key]
                );
              });

              Object.keys(updateData.bankDetails).forEach((key) => {
                formData.set(
                  `bankDetails[${key}]`,
                  (updateData.bankDetails as Record<string, string>)[key]
                );
              });

              if (
                Object.keys(updateData.bankDetails).length > 0 ||
                !isSameBankStatement
              ) {
                axios.patch("/api/user", formData).then(() => {
                  setOldCandidate({
                    ...oldCandidate,
                    bankDetails: {
                      ...oldCandidate.bankDetails,
                      ...updateData.bankDetails,
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
              !newBankName ||
              !newBankHolderName ||
              !newBankNumber ||
              !newBankStatement
            }
          >
            Next
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
