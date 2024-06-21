import { IconButton, Modal, ModalClose, ModalDialog } from "@mui/joy";
import { VisibilityRounded as VisibilityIcon } from "@mui/icons-material";
import { useState } from "react";
import { CustomRequest } from "../../../types";
import ViewClaim from "./ViewClaim";
import ViewMedicalLeave from "./ViewMedicalLeave";
import ViewLeave from "./ViewLeave";

export default function ViewDetailsModal({ data }: { data: CustomRequest }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <ModalDialog>
          <ModalClose />
          {data.type === "CLAIM" && <ViewClaim request={data} />}
          {data.type === "MEDICAL_LEAVE" && <ViewMedicalLeave request={data} />}
          {(data.type === "PAID_LEAVE" || data.type === "UNPAID_LEAVE") && (
            <ViewLeave request={data} />
          )}
        </ModalDialog>
      </Modal>
      <IconButton
        variant="soft"
        color="primary"
        onClick={() => setIsOpen(true)}
      >
        <VisibilityIcon />
      </IconButton>
    </>
  );
}
