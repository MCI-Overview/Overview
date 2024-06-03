import axios from "axios";
import { useState } from "react";
import AssignCandidateModal from "./AssignCandidateModal";
import CandidateTable from "./CandidateTable";
import { CommonCandidate } from "../../../types/common";
// import EditCandidateModal from "./EditCandidateModal";
import DeleteCandidateModal from "./DeleteCandidateModal";
import { useProjectContext } from "../../../providers/projectContextProvider";

import {
  Box,
  Button,
  Card,
  CardOverflow,
  IconButton,
  Input,
  Stack,
  Tooltip,
} from "@mui/joy";
import toast from "react-hot-toast";
import { FilterList, FilterListOff } from "@mui/icons-material";

const CandidatePage = () => {
  const { project, updateProject } = useProjectContext();

  const candidatesData = (project?.candidates)?.map((cdd) => {
    return {
      cuid: cdd.cuid,
      nric: cdd.nric,
      name: cdd.name,
      contact: cdd.contact,
      dateOfBirth: cdd.dateOfBirth,
      consultantCuid: cdd.consultantCuid,
      consultantName: project?.consultants.find((c) => c.cuid === cdd.consultantCuid)!.name,
    }
  }) || [];
  const [searchValue, setSearchValue] = useState("");
  const [ageOrder, setAgeOrder] = useState<"ASC" | "DSC" | null>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // const [candidateToEdit, setCandidateToEdit] = useState<string>("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [candidatesToDelete, setCandidatesToDelete] = useState<string[]>([]);

  const matchSearchValue = (c: CommonCandidate) =>
    c.nric.toLowerCase().includes(searchValue.toLowerCase()) ||
    c.name.toLowerCase().includes(searchValue.toLowerCase());

  const ageComparator = (a: CommonCandidate, b: CommonCandidate) => {
    if (ageOrder === "DSC") {
      return (
        new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime()
      );
    } else if (ageOrder === "ASC") {
      return (
        new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime()
      );
    } else {
      return 0;
    }
  };

  const handleSortByAgeClick = () => {
    if (ageOrder === null) {
      setAgeOrder("ASC");
    } else if (ageOrder === "ASC") {
      setAgeOrder("DSC");
    } else {
      setAgeOrder(null);
    }
  };

  // const handleEdit = (cuid: string) => {
  //   setCandidateToEdit(cuid);
  //   setIsEditModalOpen(true);
  // };

  const handleConfirmDeletion = async (cuidList: string[]) => {
    setCandidatesToDelete(cuidList);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCandidates = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/admin/project/${project?.cuid}/candidates`,
        { data: { cuidList: candidatesToDelete } },
      );
      updateProject();

      setIsDeleteModalOpen(false);
      toast.success("Candidate deleted");
    } catch (error) {
      setIsDeleteModalOpen(false);
      toast.error("Error while removing candidate");
    }
  };

  return (
    <Stack
      spacing={1}
      sx={{
        display: "flex",
        maxWidth: "1000px",
        mx: "auto",
        px: { xs: 2, md: 6 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Input
          placeholder="Search by nric/name..."
          onChange={(e) => setSearchValue(e.target.value)}
          disabled={candidatesData.length === 0}
          fullWidth
        />

        <Tooltip title="Sort by age" placement="top" size="sm">
          <IconButton
            onClick={handleSortByAgeClick}
            disabled={candidatesData.length === 0}
          >
            {ageOrder === "ASC" && (
              <FilterList style={{ transform: "rotate(180deg)" }} />
            )}
            {ageOrder === "DSC" && <FilterList />}
            {ageOrder === null && <FilterListOff />}
          </IconButton>
        </Tooltip>

        <Button
          onClick={() => setIsUploadOpen(true)}
          sx={{ whiteSpace: "nowrap" }}
        >
          Assign candidates
        </Button>
      </Box>

      <Card>
        <CardOverflow sx={{ px: "0px" }}>
          <CandidateTable
            tableProps={{ stripe: "odd", size: "sm" }}
            tableData={candidatesData
              .filter((c) => matchSearchValue(c))
              .sort(ageComparator)}
            // handleEdit={handleEdit}
            handleDelete={handleConfirmDeletion}
          />
        </CardOverflow>
      </Card>

      <AssignCandidateModal
        isUploadOpen={isUploadOpen}
        setIsUploadOpen={setIsUploadOpen}
      />

      {/* {candidateToEdit && (
        <EditCandidateModal
          candidate={candidatesData.find((c) => c.cuid === candidateToEdit)!}
          isEditModalOpen={isEditModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          candidatesData={candidatesData}
          setCandidatesData={setCandidatesData}
        />
      )} */}

      <DeleteCandidateModal
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        candidatesData={candidatesData}
        candidatesToDelete={candidatesToDelete}
        handleDeleteCandidates={handleDeleteCandidates}
      />
    </Stack>
  );
};

export default CandidatePage;
