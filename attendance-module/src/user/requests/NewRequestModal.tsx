import { useState } from "react";
import ClaimForm from "./ClaimForm";
import MedicalLeaveForm from "./MedicalLeaveForm";
import RequestLeaveForm from "./LeaveForm";
import ResignationForm from "./ResignationForm";

import {
  Button,
  FormControl,
  FormLabel,
  Option,
  ModalClose,
  ModalDialog,
  ModalOverflow,
  Modal,
  Select,
  Sheet,
  Typography,
} from "@mui/joy";

const NewRequestModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("MC");

  return (
    <>
      <Sheet sx={{ display: "flex", height: "100%" }}>
        <Button
          onClick={() => setIsOpen(true)}
          sx={{ mt: "auto" }}
          fullWidth
          size="sm"
        >
          New Request
        </Button>
      </Sheet>

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverflow sx={{ height: "100vh", width: "100vw" }}>
          <ModalDialog sx={{ maxWidth: { sm: "600px" } }}>
            <Typography level="title-lg">New Request</Typography>
            <ModalClose onClick={() => setIsOpen(false)} />
            <FormControl>
              <FormLabel>Request type</FormLabel>
              <Select
                onChange={(_e, value) => setType(value || "")}
                value={type}
              >
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
        </ModalOverflow>
      </Modal>
    </>
  );
};

export default NewRequestModal;
