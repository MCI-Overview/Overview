import { Typography, Input, Button, FormControl, FormLabel } from "@mui/joy";
import axios from "axios";
import { ChangeEventHandler, useState } from "react";
import LoadingRequestButton from "../../components/LoadingRequestButton";

export default function UploadEmergencyContactDetails({
  handleNext,
  handleBack,
}: {
  handleNext: () => void;
  handleBack: () => void;
}) {
  const [relationship, setRelationship] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const handleNameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value);
  };

  const handleContactChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setContact(event.target.value);
  };

  const handleRelationshipChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setRelationship(event.target.value);
  };

  const handleEmergencyContactSubmit = async () => {
    try {
      const response = await axios.post(
        `/api/user/emergencyContact`,
        {
          name,
          contact,
          relationship,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        handleNext();
      }
    } catch (error) {
      console.error("Error updating emergency contact information", error);
    }
  };
  return (
    <>
      <Typography level="body-sm">
        To ensure we can promptly reach someone on your behalf in case of an
        emergency, please provide the name, relationship, and contact number of
        your emergency contact. Thank you for helping us ensure your safety and
        well-being.
      </Typography>
      <FormControl>
        <FormLabel>Emergency Contact Name</FormLabel>
        <Input
          type="text"
          placeholder="Enter Emergency Contact Name"
          onChange={handleNameChange}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Emergency Contact Number</FormLabel>
        <Input
          type="text"
          placeholder="Enter Emergency Contact Number"
          onChange={handleContactChange}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Relationship</FormLabel>
        <Input
          type="text"
          placeholder="Enter Relationship With Emergency Contact"
          onChange={handleRelationshipChange}
        />
      </FormControl>
      <Button variant="outlined" onClick={handleBack}>
        Back
      </Button>
      <LoadingRequestButton
        promise={handleEmergencyContactSubmit}
        submitLabel="Submit"
        loadingLabel="Submitting..."
        disabled={!name || !contact || !relationship}
      />
    </>
  );
}
