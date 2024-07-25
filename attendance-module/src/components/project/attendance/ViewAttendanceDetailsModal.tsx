import axios from "axios";
import { ReactNode, useEffect, useState } from "react";
import { CustomAdminAttendance } from "../../../types";
import { removeSpaces } from "../../../utils/capitalize";
import { useProjectContext } from "../../../providers/projectContextProvider";
import AttendanceStatusChip from "./AttendanceStatusChip";

import {
  Box,
  IconButton,
  ListItemButton,
  Modal,
  ModalDialog,
  ModalOverflow,
  Stack,
  Typography,
} from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";
import {
  ChevronLeftRounded as ChevronLeftIcon,
  ChevronRightRounded as ChevronRightIcon,
  DownloadOutlined as DownloadIcon,
} from "@mui/icons-material";

interface ViewDetailsModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  attendance: CustomAdminAttendance;
  handleNextAttendance?: () => void;
  handlePreviousAttendance?: () => void;
  variant: "MOBILE" | "DESKTOP";
  sx?: SxProps;
  children?: ReactNode;
}

const ViewAttendanceDetailsModal = ({
  isOpen,
  setIsOpen,
  attendance,
  handleNextAttendance,
  handlePreviousAttendance,
  variant,
  sx,
  children,
}: ViewDetailsModalProps) => {
  const { project } = useProjectContext();
  const [imagePreview, setImagePreview] = useState("");

  const handleDownloadPreviewImage = () => {
    const link = document.createElement("a");
    link.href = imagePreview;
    link.download = removeSpaces(
      `${project?.name}_Attendance_${attendance.date.format("YYYYMMMDD")}_${
        attendance.name
      }.jpg`
    );
    link.click();
  };

  useEffect(() => {
    if (!attendance.rawStart || !isOpen) return;

    setImagePreview("");

    const imageRequestURL = `/api/admin/attendance/${attendance.attendanceCuid}/image`;
    axios
      .get(imageRequestURL, {
        responseType: "blob",
      })
      .then((response) => {
        const reader = new FileReader();
        reader.readAsDataURL(response.data);
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
      });
  }, [attendance, isOpen]);

  return (
    <>
      {variant === "DESKTOP" && (
        <Modal open={isOpen} onClose={() => setIsOpen(false)}>
          <ModalOverflow>
            <ModalDialog
              sx={{
                maxWidth: "40vw",
              }}
            >
              <Stack gap={1}>
                <Typography level="title-md">
                  {`${attendance.name} - ${attendance.date.format(
                    "DD/MM/YYYY"
                  )}`}
                </Typography>

                <AttendanceStatusChip
                  leave={attendance.leave}
                  status={attendance.status}
                />

                <Typography level="body-sm">
                  {`Shift: ${attendance.shiftStart.format(
                    "HH:mm"
                  )} - ${attendance.shiftEnd.format("HH:mm")} `}
                </Typography>

                <Typography level="body-sm">
                  {`Clock in/out: ${
                    attendance.rawStart
                      ? attendance.rawStart.format("HH:mm")
                      : "NIL"
                  } - ${
                    attendance.rawEnd
                      ? attendance.rawEnd.format("HH:mm")
                      : "NIL"
                  }`}
                </Typography>

                {attendance.rawStart && (
                  <>
                    <Typography level="body-sm">{`Location: ${attendance.location.name}`}</Typography>

                    <Box
                      sx={{
                        position: "relative",
                        display: "inline-block",
                      }}
                    >
                      <img
                        src={imagePreview}
                        alt="Clock In Image"
                        style={{
                          width: "100%",
                        }}
                      />
                      <IconButton
                        onClick={handleDownloadPreviewImage}
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.5)",
                          },
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Box>
                  </>
                )}
              </Stack>

              {variant === "DESKTOP" &&
                handleNextAttendance &&
                handlePreviousAttendance && (
                  <>
                    <IconButton
                      onClick={handlePreviousAttendance}
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
                      onClick={handleNextAttendance}
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
      )}

      {variant === "MOBILE" && (
        <ListItemButton onClick={() => setIsOpen(true)} sx={sx}>
          {children}
        </ListItemButton>
      )}
    </>
  );
};

export default ViewAttendanceDetailsModal;
