import { IconButton, MenuItem, Modal, ModalClose, ModalDialog } from "@mui/joy";
import { VisibilityRounded as VisibilityIcon } from "@mui/icons-material";
import { useState } from "react";
import { CustomRequest } from "../../../types";
import ViewClaim from "./ViewClaim";
import ViewMedicalLeave from "./ViewMedicalLeave";
import ViewLeave from "./ViewLeave";

export default function ViewDetailsModal({
  data,
  type,
  variant,
}: {
  data: CustomRequest;
  type: "USER" | "ADMIN";
  variant: "MOBILE" | "DESKTOP";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rosterRequestURL =
    type === "ADMIN"
      ? `/api/admin/request/${data.cuid}/roster`
      : `/api/user/request/${data.cuid}/roster`;
  const imageRequestURL =
    type === "ADMIN"
      ? `/api/admin/request/${data.cuid}/image`
      : `/api/user/request/${data.cuid}/roster`;

  return (
    <>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <ModalDialog>
          <ModalClose />
          {data.type === "CLAIM" && (
            <ViewClaim
              request={data}
              imageRequestURL={imageRequestURL}
              rosterRequestURL={rosterRequestURL}
            />
          )}
          {data.type === "MEDICAL_LEAVE" && (
            <ViewMedicalLeave
              request={data}
              imageRequestURL={imageRequestURL}
              rosterRequestURL={rosterRequestURL}
            />
          )}
          {(data.type === "PAID_LEAVE" || data.type === "UNPAID_LEAVE") && (
            <ViewLeave request={data} rosterRequestURL={rosterRequestURL} />
          )}
        </ModalDialog>
      </Modal>
      {variant === "DESKTOP" && (
        <IconButton
          variant="soft"
          color="primary"
          onClick={() => setIsOpen(true)}
        >
          <VisibilityIcon />
        </IconButton>
      )}
      {variant === "MOBILE" && (
        <MenuItem onClick={() => setIsOpen(true)}>View</MenuItem>
      )}
    </>
  );
}
