import axios from "axios";
import toast from "react-hot-toast";
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
  ModalOverflow,
  Tooltip,
} from "@mui/joy";
import {
  ChevronLeftRounded as ChevronLeftIcon,
  ChevronRightRounded as ChevronRightIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";

interface ViewDetailsModalProps {
  onClick?: () => void;
  request: CustomRequest;
  updateRequest: () => void;
  handleNextRequest?: () => void;
  handlePreviousRequest?: () => void;
  type: "USER" | "ADMIN";
  variant: "MOBILE" | "DESKTOP";
  sx?: SxProps;
  children?: ReactNode;
}

const ViewDetailsModal = ({
  onClick,
  request,
  updateRequest,
  handleNextRequest,
  handlePreviousRequest,
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
      <ViewClaim request={request} imageRequestURL={requestURL("image")} />
    ),
    MEDICAL_LEAVE: (
      <ViewMedicalLeave
        request={request}
        imageRequestURL={requestURL("image")}
      />
    ),
    PAID_LEAVE: <ViewLeave request={request} />,
    UNPAID_LEAVE: <ViewLeave request={request} />,
    RESIGNATION: <ViewResignation request={request} />,
  };

  return (
    <>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverflow>
          <ModalDialog sx={{ maxWidth: "30vw" }}>
            {componentMap[request.type] || null}

            <ViewDetailsModalActions
              request={request}
              updateRequest={updateRequest}
              userType={type}
            />

            {variant === "DESKTOP" &&
              handleNextRequest &&
              handlePreviousRequest && (
                <>
                  <IconButton
                    onClick={handlePreviousRequest}
                    sx={{
                      position: "absolute",
                      left: -43,
                      top: "50%",
                      transform: "translateY(-50%)",
                      height: "100%",
                      px: 1,
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                      },
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>

                  <IconButton
                    onClick={handleNextRequest}
                    sx={{
                      position: "absolute",
                      right: -43,
                      top: "50%",
                      transform: "translateY(-50%)",
                      height: "100%",
                      px: 1,
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                      },
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </>
              )}
          </ModalDialog>
        </ModalOverflow>
      </Modal>

      {variant === "DESKTOP" && onClick && (
        <Tooltip title="View details">
          <IconButton
            size="sm"
            color="primary"
            onClick={() => {
              onClick();
              setIsOpen(true);
            }}
          >
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

  // if the roster has been deleted, do not display actions for leaves
  // claims should still be able to be approved, even if the roster is somehow deleted
  const leaveTypes = ["MEDICAL_LEAVE", "PAID_LEAVE", "UNPAID_LEAVE"];
  if (
    userType === "ADMIN" &&
    leaveTypes.includes(request.type) &&
    request.affectedRosters.length === 0
  ) {
    return null;
  }

  return (
    <>
      <Divider />

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
