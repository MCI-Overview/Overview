import { ReactNode, useEffect, useState } from "react";
import { CustomAdminAttendance } from "../../../types";
import { SxProps } from "@mui/joy/styles/types";

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
import {
  ChevronLeftRounded as ChevronLeftIcon,
  ChevronRightRounded as ChevronRightIcon,
  DownloadOutlined as DownloadIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import AttendanceStatusChip from "./AttendanceStatusChip";
import axios from "axios";

const getStartColor = (
  rawStart: dayjs.Dayjs | null,
  shiftStart: dayjs.Dayjs
) => {
  if (!rawStart) return undefined;

  const diff = rawStart.diff(shiftStart);
  return diff < 0 ? "success" : "warning";
};

const getEndColor = (
  rawStart: dayjs.Dayjs | null,
  rawEnd: dayjs.Dayjs | null,
  shiftEnd: dayjs.Dayjs
) => {
  if (!rawEnd) return rawStart ? "warning" : undefined;

  const diff = rawEnd.diff(shiftEnd);
  return diff > 0 ? "success" : "warning";
};

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
  const [imagePreview, setImagePreview] = useState("");

  const handleDownloadPreviewImage = () => {
    const link = document.createElement("a");
    link.href = imagePreview;
    link.download = `${attendance.attendanceCuid}.jpg`;
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
                  {`Clock in: ${attendance.shiftStart.format("HH:mm")} / `}
                  <Typography
                    color={getStartColor(
                      attendance.rawStart,
                      attendance.shiftStart
                    )}
                  >
                    {attendance.rawStart
                      ? attendance.rawStart.format("HH:mm")
                      : "-"}
                  </Typography>
                </Typography>

                <Typography level="body-sm">
                  {`Clock out: ${attendance.shiftEnd.format("HH:mm")} / `}
                  <Typography
                    color={getEndColor(
                      attendance.rawStart,
                      attendance.rawEnd,
                      attendance.shiftEnd
                    )}
                  >
                    {attendance.rawEnd
                      ? attendance.rawEnd.format("HH:mm")
                      : "-"}
                  </Typography>
                </Typography>

                {attendance.rawStart && (
                  <>
                    <Typography level="body-sm">{`Location: ${attendance.postalCode}`}</Typography>

                    <Box
                      sx={{
                        position: "relative",
                        display: "inline-block",
                        maxWidth: "500px",
                      }}
                    >
                      <img
                        src={imagePreview}
                        alt="Clock In Image"
                        style={{
                          width: "100%",
                          maxHeight: "300px",
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
