import axios from "axios";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { CommonCandidate } from "../../../types/common";
import { useProjectContext } from "../../../providers/projectContextProvider";

import AddCandidateModal from "./AddCandidateModal";
import AssignCandidateModal from "./AssignCandidateModal";
import DeleteCandidateModal from "./DeleteCandidateModal";
import SmallScreenDivider from "../ui/SmallScreenDivider";
import AdminProjectCandidateTable, {
  CddTableDataType,
} from "./AdminProjectCandidateTable";

import {
  Box,
  Button,
  Checkbox,
  Dropdown,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/joy";
import {
  AddRounded as AddIcon,
  ArrowDropDownRounded as ArrowDropDownIcon,
  SearchRounded as SearchIcon,
} from "@mui/icons-material";

type SortableKeys = "age" | "startDate" | "endDate";
const getHeadComponents: () => {
  name: string;
  sortKey?: SortableKeys;
}[] = () => {
  return [
    { name: "Employee ID" },
    { name: "NRIC" },
    { name: "Name" },
    { name: "Contact" },
    { name: "Date of Birth" },
    { name: "Age", sortKey: "age" },
    { name: "Residency" },
    { name: "Start Date", sortKey: "startDate" },
    { name: "End Date", sortKey: "endDate" },
    { name: "Employment Type" },
    { name: "Rest Day" },
    { name: "Consultant" },
    { name: "Action" },
  ];
};

const AdminProjectCandidatesPage = () => {
  const { project, updateProject } = useProjectContext();

  const [candidatesData, setCandidatesData] = useState<CddTableDataType[]>([]);

  useEffect(() => {
    setCandidatesData(
      project?.candidates?.map((cdd) => {
        return {
          cuid: cdd.cuid,
          nric: cdd.nric,
          name: cdd.name,
          contact: cdd.contact,
          residency: cdd.residency,
          dateOfBirth: cdd.dateOfBirth,
          createdAt: cdd.createdAt,
          startDate: cdd.startDate,
          endDate: cdd.endDate,
          hasOnboarded: cdd.hasOnboarded,
          employmentType: cdd.employmentType,
          consultantCuid: cdd.consultantCuid,
          consultantName: project?.consultants.find(
            (c) => c.cuid === cdd.consultantCuid
          )!.name,
          restDay: cdd.restDay,
          employeeId: cdd.employeeId,
        };
      }) || []
    );
  }, [project]);

  const [searchValue, setSearchValue] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newTableData, setNewTableData] = useState<CddTableDataType[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [candidatesToDelete, setCandidatesToDelete] = useState<string[]>([]);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [showColumnsList, setShowColumnsList] = useState<boolean[]>([
    true, // employeeId
    true, // nric
    true, // name
    false, // contact
    false, // dateOfBirth
    false, // age
    false, // residency
    true, // startDate
    true, // endDate
    true, // employmentType
    true, // restDay
    true, // consultant
    false, // action
  ]);

  const unhideableColumnIndexes = [
    0, // employeeId
    1, // nric
    2, // name
  ];

  // TODO: Fix type
  const matchSearchValue = (c: CommonCandidate) =>
    c.nric.toLowerCase().includes(searchValue.toLowerCase()) ||
    c.name.toLowerCase().includes(searchValue.toLowerCase());

  const handleConfirmDeletion = async (cuidList: string[]) => {
    setCandidatesToDelete(cuidList);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCandidates = async () => {
    try {
      await axios.delete(`/api/admin/project/${project?.cuid}/candidates`, {
        data: { cuidList: candidatesToDelete },
      });
      updateProject();

      setIsDeleteModalOpen(false);
      toast.success("Candidate deleted");
    } catch (error) {
      setIsDeleteModalOpen(false);
      toast.error("Error while removing candidate");
    }
  };

  useEffect(() => {
    setNewTableData(structuredClone(candidatesData));
  }, [candidatesData]);

  const handleEditCandidates = async () => {
    const editedRows = newTableData.filter((cdd) => {
      const originalCdd = candidatesData.find((c) => c.cuid === cdd.cuid);
      return (
        cdd.startDate !== originalCdd?.startDate ||
        cdd.endDate !== originalCdd?.endDate ||
        cdd.employmentType !== originalCdd?.employmentType ||
        cdd.restDay !== originalCdd?.restDay ||
        cdd.consultantCuid !== originalCdd?.consultantCuid ||
        cdd.employeeId !== originalCdd?.employeeId
      );
    });

    if (editedRows.length === 0) {
      toast.error("No changes made");
      return;
    }

    // validate all start and end dates exist and are valid
    const hasSomeInvalidDates = editedRows.some(
      (cdd) =>
        !cdd.startDate ||
        !cdd.endDate ||
        dayjs(cdd.startDate).isAfter(dayjs(cdd.endDate), "day")
    );

    if (hasSomeInvalidDates) {
      toast.error("Invalid start/end dates");
      return;
    }

    try {
      // only rows that were changed
      const body = editedRows.map((cdd) => {
        return {
          candidateCuid: cdd.cuid,
          employeeId: cdd.employeeId,
          startDate: dayjs(cdd.startDate),
          endDate: dayjs(cdd.endDate),
          employmentType: cdd.employmentType,
          restDay: cdd.restDay,
          consultantCuid: cdd.consultantCuid,
        };
      });

      await axios.patch(`/api/admin/project/${project?.cuid}/assign`, body);

      updateProject();
      toast.success("Candidate changes saved");
    } catch (error) {
      toast.error("Error while editing candidate");
    }
  };

  return (
    <Stack
      spacing={1}
      sx={{
        display: "flex",
        mx: "auto",
        px: { md: 4 },
      }}
    >
      <Box
        sx={{
          borderRadius: "sm",
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search candidates</FormLabel>
          <Input
            size="sm"
            placeholder="Search by name/nric"
            startDecorator={<SearchIcon />}
            onChange={(e) => setSearchValue(e.target.value)}
            disabled={candidatesData.length === 0}
            fullWidth
          />
        </FormControl>

        <Button
          onClick={handleEditCandidates}
          size="sm"
          sx={{
            mt: "auto",
            display: { xs: "none", sm: "flex" },
          }}
        >
          Save changes
        </Button>

        <Dropdown>
          <MenuButton
            variant="solid"
            color="primary"
            size="sm"
            sx={{
              mt: "auto",
              display: { xs: "none", sm: "flex" },
            }}
            onClick={() => setIsColumnSelectorOpen((prev) => !prev)}
          >
            Columns
            <ArrowDropDownIcon />
          </MenuButton>

          <Menu
            open={isColumnSelectorOpen}
            onClose={() => setIsColumnSelectorOpen(false)}
            onMouseLeave={() => setIsColumnSelectorOpen(false)}
          >
            {getHeadComponents().map((column, index) => {
              if (unhideableColumnIndexes.includes(index)) return null;
              return (
                <MenuItem
                  key={index}
                  onClick={() => {
                    const newShowColumnsList = [...showColumnsList];
                    newShowColumnsList[index] = !showColumnsList[index];
                    setShowColumnsList(newShowColumnsList);
                  }}
                >
                  <Checkbox
                    checked={showColumnsList[index]}
                    color="neutral"
                    onChange={() => {
                      const newShowColumnsList = [...showColumnsList];
                      newShowColumnsList[index] = !showColumnsList[index];
                      setShowColumnsList(newShowColumnsList);
                    }}
                    label={column.name}
                  />
                </MenuItem>
              );
            })}
          </Menu>
        </Dropdown>

        <Dropdown>
          <MenuButton
            variant="solid"
            color="primary"
            size="sm"
            sx={{
              mt: "auto",
              display: { xs: "none", sm: "flex" },
              alignContent: "center",
              pr: 0.5,
            }}
          >
            Add candidates
            <ArrowDropDownIcon />
          </MenuButton>
          <Menu
            sx={{
              "& .MuiMenuItem-root": {
                display: "flex",
                justifyContent: "center",
              },
            }}
          >
            <MenuItem onClick={() => setAddModalOpen(true)}>
              <Typography level="body-xs">Individual</Typography>
            </MenuItem>
            <MenuItem onClick={() => setIsUploadOpen(true)}>
              <Typography level="body-xs">Bulk Upload</Typography>
            </MenuItem>
          </Menu>
        </Dropdown>

        <Tooltip title="Add a candidate" placement="top" size="sm">
          <IconButton
            size="sm"
            color="primary"
            variant="solid"
            onClick={() => setAddModalOpen(true)}
            sx={{ py: "auto", mt: "auto", display: { xs: "flex", sm: "none" } }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <SmallScreenDivider />

      <AdminProjectCandidateTable
        tableData={candidatesData.filter((c) => matchSearchValue(c))}
        handleDelete={handleConfirmDeletion}
        showColumnsList={showColumnsList}
        newTableData={newTableData.filter((c) => matchSearchValue(c))}
        setNewTableData={setNewTableData}
      />

      <AssignCandidateModal
        isUploadOpen={isUploadOpen}
        setIsUploadOpen={setIsUploadOpen}
      />

      <DeleteCandidateModal
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        candidatesData={candidatesData}
        candidatesToDelete={candidatesToDelete}
        handleDeleteCandidates={handleDeleteCandidates}
      />

      <AddCandidateModal
        isAddModalOpen={isAddModalOpen}
        setAddModalOpen={setAddModalOpen}
      />
    </Stack>
  );
};

export default AdminProjectCandidatesPage;
