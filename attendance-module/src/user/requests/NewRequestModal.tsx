import { useState } from "react";
import ClaimForm from "./ClaimForm";
import MedicalLeaveForm from "./MedicalLeaveForm";
import RequestLeaveForm from "./LeaveForm";
import ResignationForm from "./ResignationForm";

import {
  Select,
  Option,
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Button,
} from "@mui/joy";

export default function NewRequest() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("MC");

  return (
    <>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <ModalDialog>
          <Typography level="title-lg">New Request</Typography>
          <ModalClose onClick={() => setIsOpen(false)} />
          <FormControl>
            <FormLabel>Request type</FormLabel>
            <Select onChange={(_e, value) => setType(value || "")} value={type}>
              <Option value="MC">MC</Option>
              <Option value="Leave">Leave</Option>
              <Option value="Claim">Claim</Option>
              <Option value="Resign">Resign</Option>
            </Select>
          </FormControl>
          {type === "MC" && <MedicalLeaveForm setIsOpen={setIsOpen} />}
          {type === "Leave" && <RequestLeaveForm setIsOpen={setIsOpen} />}
          {type === "Claim" && <ClaimForm setIsOpen={setIsOpen} />}
          {type === "Resign" && <ResignationForm setIsOpen={setIsOpen} />}
        </ModalDialog>
      </Modal>
      <Button onClick={() => setIsOpen(true)}>New Request</Button>
    </>
  );
}
