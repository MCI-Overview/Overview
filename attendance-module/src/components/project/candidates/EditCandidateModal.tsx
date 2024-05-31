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
import { Candidate } from "../../../types";
import toast from "react-hot-toast";
import axios from "axios";
import { dateRegex, contactRegex } from "../../../utils/validation";
import { getExactAge } from "../../../utils/date-time";

interface EditCandidateModalProps {
  candidate: Candidate;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (isOpen: boolean) => void;
  candidatesData: Candidate[];
  setCandidatesData: (candidates: Candidate[]) => void;
}

const EditCandidateModal = ({
  candidate,
  isEditModalOpen,
  setIsEditModalOpen,
  candidatesData,
  setCandidatesData,
}: EditCandidateModalProps) => {
  const [name, setName] = useState(candidate.name);
  const [contact, setContact] = useState(candidate.contact);
  const [dateOfBirth, setDateOfBirth] = useState(
    new Date(candidate.dateOfBirth).toDateString(),
  );

  const [isNameValid, setIsNameValid] = useState(true);
  const [isContactValid, setIsContactValid] = useState(true);
  const [isDateOfBirthValid, setIsDateOfBirthValid] = useState(true);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  useEffect(() => {
    setName(candidate.name);
    setContact(candidate.contact);
    setDateOfBirth(candidate.dateOfBirth.slice(0, 10));
  }, [candidate]);

  // name validation
  useEffect(() => {
    setIsNameValid(name.length > 0);
  }, [name]);

  // phone number validation
  useEffect(() => {
    setIsContactValid(contact.length > 0 && contactRegex.test(contact));
  }, [contact]);

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
    setIsSubmitDisabled(!isNameValid || !isContactValid || !isDateOfBirthValid);
  }, [isNameValid, isContactValid, isDateOfBirthValid]);

  const handleSave = async () => {
    try {
      await axios.patch("http://localhost:3000/api/admin/candidate", {
        cuid: candidate.cuid,
        name: name,
        contact: contact,
        dateOfBirth: new Date(dateOfBirth),
      });

      toast.success("Candidate edited");
      const updatedCandidates = candidatesData.map((c) => {
        if (c.cuid === candidate.cuid) {
          return {
            cuid: c.cuid,
            nric: c.nric,
            name: name,
            contact: contact,
            dateOfBirth: dateOfBirth,
          };
        }
        return c;
      });
      setCandidatesData(updatedCandidates);
      setIsEditModalOpen(false);
    } catch (error) {
      const prismaError = error as PrismaError;
      console.log(prismaError);
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
          {isContactValid ? (
            <Typography level="body-xs">Contact Number</Typography>
          ) : (
            <Typography level="body-xs" color="danger">
              Contact Number is invalid
            </Typography>
          )}
          <Input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            color={isContactValid ? "neutral" : "danger"}
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
