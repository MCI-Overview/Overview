import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AssignCandidateModal from "./AssignCandidateModal";
import CandidateTable from "./CandidateTable";
import { Candidate } from "../../../types";

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
// import EditCandidateModal from "./EditCandidateModal";
import DeleteCandidateModal from "./DeleteCandidateModal";

const CandidatePage = () => {
  const { projectCuid } = useParams();

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [candidatesData, setCandidatesData] = useState<Candidate[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [ageOrder, setAgeOrder] = useState<"ASC" | "DSC" | null>(null);

  // const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // const [candidateToEdit, setCandidateToEdit] = useState<string>("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [candidatesToDelete, setCandidatesToDelete] = useState<string[]>([]);

  // retrieve existing candidates id
  useEffect(() => {
    const fetchExistingCandidates = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/admin/project/${projectCuid}/candidates`,
        );
        console.log(response.data);
        setCandidatesData(
          response.data.map((c: Candidate) => {
            return {
              cuid: c.cuid,
              nric: c.nric,
              name: c.name,
              contact: c.contact,
              dateOfBirth: c.dateOfBirth,
            };
          }),
        );
      } catch (error) {
        toast.error("Error while fetching candidates. Please try again later.");
      }
    };

    fetchExistingCandidates();
  }, [projectCuid]);

  const matchSearchValue = (c: Candidate) =>
    c.nric.toLowerCase().includes(searchValue.toLowerCase()) ||
    c.name.toLowerCase().includes(searchValue.toLowerCase());

  const ageComparator = (a: Candidate, b: Candidate) => {
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
        `http://localhost:3000/api/admin/project/${projectCuid}/candidates`,
        { data: { cuidList: candidatesToDelete } },
      );
      setCandidatesData((prev) =>
        prev.filter((c) => !candidatesToDelete.includes(c.cuid)),
      );

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
