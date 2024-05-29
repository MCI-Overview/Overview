import {
  Box,
  Button,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { CandidateBasic } from "../../../types";
import toast from "react-hot-toast";
import axios from "axios";
import { dateRegex, phoneRegex } from "../../../utils/validation";
import { getExactAge } from "../../../utils/date-time";

interface EditCandidateModalProps {
  candidate: CandidateBasic;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (isOpen: boolean) => void;
  candidatesData: CandidateBasic[];
  setCandidatesData: (candidates: CandidateBasic[]) => void;
}

const EditCandidateModal = ({
  candidate,
  isEditModalOpen,
  setIsEditModalOpen,
  candidatesData,
  setCandidatesData,
}: EditCandidateModalProps) => {
  const [name, setName] = useState(candidate.name);
  const [phoneNumber, setPhoneNumber] = useState(candidate.phoneNumber);
  const [dateOfBirth, setDateOfBirth] = useState(
    new Date(candidate.dateOfBirth).toDateString(),
  );

  const [isNameValid, setIsNameValid] = useState(true);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);
  const [isDateOfBirthValid, setIsDateOfBirthValid] = useState(true);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  useEffect(() => {
    setName(candidate.name);
    setPhoneNumber(candidate.phoneNumber);
    setDateOfBirth(candidate.dateOfBirth.slice(0, 10));
  }, [candidate]);

  // name validation
  useEffect(() => {
    setIsNameValid(name.length > 0);
  }, [name]);

  // phone number validation
  useEffect(() => {
    setIsPhoneNumberValid(
      phoneNumber.length > 0 && phoneRegex.test(phoneNumber),
    );
  }, [phoneNumber]);

  // dob validation
  useEffect(() => {
    setIsDateOfBirthValid(
      dateOfBirth.length > 0 &&
        dateRegex.test(dateOfBirth) &&
        getExactAge(dateOfBirth) >= 16,
    );
  }, [dateOfBirth]);

  // disallow submission if any of the fields are invalid
  useEffect(() => {
    setIsSubmitDisabled(
      !isNameValid || !isPhoneNumberValid || !isDateOfBirthValid,
    );
  }, [isNameValid, isPhoneNumberValid, isDateOfBirthValid]);

  const handleSave = async () => {
    try {
      await axios.patch("http://localhost:3000/api/admin/candidate", {
        nric: candidate.nric,
        name: name,
        phoneNumber: phoneNumber,
        dateOfBirth: new Date(dateOfBirth),
      });

      toast.success("Candidate edited");
      const updatedCandidates = candidatesData.map((c) => {
        if (c.nric === candidate.nric) {
          return {
            nric: c.nric,
            name: name,
            phoneNumber: phoneNumber,
            dateOfBirth: dateOfBirth,
          };
        }
        return c;
      });
      setCandidatesData(updatedCandidates);
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error("Error while editing candidate");
    }
  };

  return (
    <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
      <ModalDialog>
        <ModalClose />
        <Typography level="title-sm">Edit Candidate</Typography>
        <Box>
          {isNameValid ? (
            <Typography level="body-xs">Name</Typography>
          ) : (
            <Typography level="body-xs" color="danger">
              Name cannot be empty
            </Typography>
          )}
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!isNameValid}
          />
        </Box>
        <Box>
          {isPhoneNumberValid ? (
            <Typography level="body-xs">Phone Number</Typography>
          ) : (
            <Typography level="body-xs" color="danger">
              Phone Number is invalid
            </Typography>
          )}
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            color={isPhoneNumberValid ? "neutral" : "danger"}
          />
        </Box>
        <Box>
          {isDateOfBirthValid ? (
            <Typography level="body-xs">DoB</Typography>
          ) : (
            <Typography level="body-xs" color="danger">
              DoB is invalid. YYYY-MM-DD and over 16
            </Typography>
          )}
          <Input
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            error={!isDateOfBirthValid}
          />
        </Box>
        <Button onClick={handleSave} disabled={isSubmitDisabled}>
          Save
        </Button>
      </ModalDialog>
    </Modal>
  );
};

export default EditCandidateModal;
