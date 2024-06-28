import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import toast from "react-hot-toast";

import {
  Modal,
  ModalDialog,
  Typography,
  Grid,
  Input,
  FormControl,
  FormLabel,
  ModalClose,
  Button,
} from "@mui/joy";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  projectCuid: string;
}

interface AttendanceData {
  attendanceCuid: string;
  date: string;
  nric: string;
  name: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  rawStart: string | null;
  rawEnd: string | null;
  status: string;
}

const AttendanceExportModal: React.FC<ModalProps> = ({
  show,
  onClose,
  projectCuid,
}) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const getExportData = async (
    formattedStartDate: string,
    formattedEndDate: string
  ) => {
    const url = `/api/admin/project/${projectCuid}/history?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
    const response = await axios.get<AttendanceData[]>(url);
    return response.data;
  };

  const handleExport = async () => {
    if (!startDate || !endDate || !projectCuid) {
      toast.error("Select both start and end dates.");
      return;
    }

    const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
    const formattedEndDate = dayjs(endDate).format("YYYY-MM-DD");

    const data = await getExportData(formattedStartDate, formattedEndDate);

    // Format the data
    const formattedData = data.map((entry) => ({
      date: dayjs(entry.date).format("DD/MM/YYYY"),
      nric: entry.nric.replace(/^(.{5})(.*)$/, "*****$2"),
      name: entry.name,
      status: entry.status,
      shiftStart: entry.shiftStart
        ? dayjs(entry.shiftStart).format("HH:mm")
        : "",
      shiftEnd: entry.shiftEnd ? dayjs(entry.shiftEnd).format("HH:mm") : "",
      rawStart: entry.rawStart ? dayjs(entry.rawStart).format("HH:mm") : "",
      rawEnd: entry.rawEnd ? dayjs(entry.rawEnd).format("HH:mm") : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Data");

    XLSX.writeFile(
      workbook,
      `attendance_${formattedStartDate}_to_${formattedEndDate}.xlsx`
    );
    toast.success("Download starting ...");
  };

  return (
    <>
      <Modal open={show} onClose={onClose}>
        <ModalDialog>
          <ModalClose />
          <Typography level="title-md">Export attendance</Typography>
          <Grid container columnGap={2} rowGap={2}>
            <Grid xs={12}>
              <FormControl>
                <FormLabel>Start date</FormLabel>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <FormControl>
                <FormLabel>End date</FormLabel>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Button onClick={handleExport}>Export</Button>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default AttendanceExportModal;
