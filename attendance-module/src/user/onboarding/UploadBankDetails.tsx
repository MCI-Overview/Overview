import {
  Typography,
  Input,
  Button,
  Stack,
  FormControl,
  FormLabel,
} from "@mui/joy";
import axios from "axios";
import { ChangeEventHandler, useState } from "react";
import LoadingRequestButton from "../../components/LoadingRequestButton";
import FileUpload from "../../components/FileUpload";

export default function UploadBankDetails({
  handleNext,
  handleBack,
}: {
  handleNext: () => void;
  handleBack: () => void;
}) {
  const [bankHolderName, setBankAccountHolderName] = useState("");
  const [bankNumber, setBankAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankStatement, setBankStatement] = useState<File | null>(null);
  const [bankStatementPreview, setBankStatementPreview] = useState("");

  const handleBankAccountHolderNameChange: ChangeEventHandler<
    HTMLInputElement
  > = (event) => {
    setBankAccountHolderName(event.target.value);
  };

  const handleBankAccountNumberChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setBankAccountNumber(event.target.value);
  };

  const handleBankNameChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setBankName(event.target.value);
  };

  const handleBankStatementFileChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setBankStatement(selectedFile);

      if (bankStatementPreview) {
        URL.revokeObjectURL(bankStatementPreview);
      }

      const previewURL = URL.createObjectURL(selectedFile);
      setBankStatementPreview(previewURL);
    }
  };

  const handleBankDetailsSubmit = async () => {
    const formData = new FormData();
    formData.append("bankHolderName", bankHolderName);
    formData.append("bankNumber", bankNumber);
    formData.append("bankName", bankName);
    formData.append("bankStatement", bankStatement!);

    try {
      const response = await axios.post(`/api/user/bankDetails`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        handleNext();
      }
    } catch (error) {
      console.error("Error updating bank details:", error);
    }
  };
  return (
    <>
      <Typography level="body-sm">
        To ensure timely salary processing, please provide your banking details.
      </Typography>
      <FormControl>
        <FormLabel>Bank Account Holder Name</FormLabel>
        <Input
          type="text"
          placeholder="Enter Bank Account Holder Name"
          onChange={handleBankAccountHolderNameChange}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Bank Account Number</FormLabel>
        <Input
          type="text"
          placeholder="Enter Bank Account Number"
          onChange={handleBankAccountNumberChange}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Bank Name</FormLabel>
        <Input
          type="text"
          placeholder="Enter Bank Name"
          onChange={handleBankNameChange}
        />
      </FormControl>

      <Stack spacing={2}>
        <FileUpload
          onChange={handleBankStatementFileChange}
          label="Upload Bank Statement Image"
        />
        {bankStatementPreview && (
          <img
            src={bankStatementPreview}
            alt="Image preview"
            style={{ maxWidth: "100%" }}
          />
        )}
      </Stack>
      <Button variant="outlined" onClick={handleBack}>
        Back
      </Button>
      <LoadingRequestButton
        promise={handleBankDetailsSubmit}
        submitLabel="Submit banking details"
        loadingLabel="Submitting..."
        disabled={!bankHolderName || !bankNumber || !bankName || !bankStatement}
      />
    </>
  );
}
