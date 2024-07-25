import React, { useState, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

import ResponsiveDialog from "../../ResponsiveDialog";

import { Grid, Input, FormControl, FormLabel, Button, Autocomplete } from "@mui/joy";
import { useProjectContext } from "../../../providers/projectContextProvider";

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
  const [selectedNRIC, setSelectedNRIC] = useState<string>('all');

  const { project } = useProjectContext();
  const cddList = useMemo(() => {
    const candidates = project?.candidates.map(cdd => ({
      label: `${cdd.name} - ${cdd.nric}`,
      value: cdd.nric
    })) || [];

    return [
      { label: 'All Candidates', value: 'all' },
      ...candidates
    ];
  }, [project]);

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

    let data = await getExportData(formattedStartDate, formattedEndDate);

    // Filter data if a specific NRIC is selected
    if (selectedNRIC !== 'all') {
      data = data.filter(entry => entry.nric === selectedNRIC);
    }

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

    const fileName = selectedNRIC === 'all'
      ? `attendance_all_${formattedStartDate}_to_${formattedEndDate}.xlsx`
      : `attendance_${selectedNRIC}_${formattedStartDate}_to_${formattedEndDate}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    toast.success("Download starting ...");
  };

  return (
    <ResponsiveDialog
      open={show}
      handleClose={onClose}
      title="Export attendance"
      actions={<Button onClick={handleExport}>Export</Button>}
    >
      <Grid container columnGap={2} rowGap={2}>
        <Grid xs={12}>
          <FormControl>
            <FormLabel>Select Candidate</FormLabel>
            <Autocomplete
              options={cddList}
              value={cddList.find(option => option.value === selectedNRIC) || cddList[0]}
              onChange={(_event, newValue) => setSelectedNRIC(newValue ? newValue.value : 'all')}
              getOptionLabel={(option) => option.label}
            />
          </FormControl>
        </Grid>
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
    </ResponsiveDialog>
  );
};

export default AttendanceExportModal;