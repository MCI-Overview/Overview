import { useState } from "react";

import ClaimForm from "./ClaimForm";
import RequestLeaveForm from "./LeaveForm";
import ResignationForm from "./ResignationForm";
import MedicalLeaveForm from "./MedicalLeaveForm";
import ResponsiveDialog from "../../components/ResponsiveDialog";

import {
  Button,
  FormControl,
  FormLabel,
  Option,
  Select,
  Sheet,
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

      <ResponsiveDialog
        open={isOpen}
        handleClose={() => setIsOpen(false)}
        title="New Request"
      >
        <Sheet sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
        </Sheet>
      </ResponsiveDialog>
    </>
  );
};

export default NewRequestModal;
