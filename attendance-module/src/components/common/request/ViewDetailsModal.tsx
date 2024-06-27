import axios from "axios";
import { ReactNode, useState } from "react";
import { CustomRequest } from "../../../types";
import { SxProps } from "@mui/joy/styles/types";

import ViewClaim from "./ViewClaim";
import ViewLeave from "./ViewLeave";
import ViewMedicalLeave from "./ViewMedicalLeave";
import ViewResignation from "./ViewResignation";
import LoadingRequestIconButton from "../../LoadingRequestIconButton";

import {
  Box,
  Divider,
  IconButton,
  ListItemButton,
  Modal,
  ModalDialog,
  Tooltip,
} from "@mui/joy";
import { InfoOutlined as InfoIcon } from "@mui/icons-material";
import toast from "react-hot-toast";

interface ViewDetailsModalProps {
  request: CustomRequest;
  updateRequest: () => void;
  type: "USER" | "ADMIN";
  variant: "MOBILE" | "DESKTOP";
  sx?: SxProps;
  children?: ReactNode;
}

const ViewDetailsModal = ({
  request,
  updateRequest,
  type,
  variant,
  sx,
  children,
}: ViewDetailsModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const requestURL = (str: string) =>
    `/api/${type === "ADMIN" ? "admin" : "user"}/request/${
      request.cuid
    }/${str}`;

  const componentMap = {
    CLAIM: (
      <ViewClaim
        request={request}
        imageRequestURL={requestURL("image")}
        rosterRequestURL={requestURL("roster")}
      />
    ),
    MEDICAL_LEAVE: (
      <ViewMedicalLeave
        request={request}
        imageRequestURL={requestURL("image")}
        rosterRequestURL={requestURL("roster")}
      />
    ),
    PAID_LEAVE: (
      <ViewLeave request={request} rosterRequestURL={requestURL("roster")} />
    ),
    UNPAID_LEAVE: (
      <ViewLeave request={request} rosterRequestURL={requestURL("roster")} />
    ),
    RESIGNATION: <ViewResignation request={request} />,
  };

  return (
    <>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <ModalDialog>
          {componentMap[request.type] || null}

          {request.status === "PENDING" && <Divider />}

          <ViewDetailsModalActions
            request={request}
            updateRequest={updateRequest}
            userType={type}
          />
        </ModalDialog>
      </Modal>

      {variant === "DESKTOP" && (
        <Tooltip title="View details">
          <IconButton size="sm" color="primary" onClick={() => setIsOpen(true)}>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      )}

      {variant === "MOBILE" && (
        <ListItemButton onClick={() => setIsOpen(true)} sx={sx}>
          {children}
        </ListItemButton>
      )}
    </>
  );
};

const ViewDetailsModalActions = ({
  request,
  updateRequest,
  userType,
}: {
  request: CustomRequest;
  updateRequest: () => void;
  userType: "USER" | "ADMIN";
}) => {
  if (request.status !== "PENDING") return null;

  async function cancelRequest() {
    axios
      .post("/api/user/request/cancel", { requestCuid: request.cuid })
      .then(() => {
        updateRequest();
        toast.success("Request cancelled successfully.");
      })
      .catch(() => {
        toast.error("Failed to cancel request.");
      });
  }

  async function approveRequest() {
    axios
      .post(`/api/admin/request/${request.cuid}/approve`)
      .then(() => {
        updateRequest();
        toast.success("Request approved successfully.");
      })
      .catch(() => {
        toast.error("Failed to approve request.");
      });
  }

  async function rejectRequest() {
    axios
      .post(`/api/admin/request/${request.cuid}/reject`)
      .then(() => {
        updateRequest();
        toast.success("Request rejected successfully.");
      })
      .catch(() => {
        toast.error("Failed to reject request.");
      });
  }

  return (
    <>
      {userType === "USER" && (
        <Tooltip title="Cancel">
          <LoadingRequestIconButton promise={cancelRequest} color="danger">
            Cancel request
          </LoadingRequestIconButton>
        </Tooltip>
      )}

      {userType === "ADMIN" && (
        <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
          <Tooltip title="Reject">
            <LoadingRequestIconButton promise={rejectRequest} color="danger">
              Reject
            </LoadingRequestIconButton>
          </Tooltip>

          <Tooltip title="Approve">
            <LoadingRequestIconButton promise={approveRequest} color="success">
              Approve
            </LoadingRequestIconButton>
          </Tooltip>
        </Box>
      )}
    </>
  );
};

export default ViewDetailsModal;
