import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import AssignCandidateModal from "./AssignCandidateModal";
import CandidateTable from "./CandidateTable";
import { CommonCandidate } from "../../../types/common";
import DeleteCandidateModal from "./DeleteCandidateModal";
import { useProjectContext } from "../../../providers/projectContextProvider";

import { Box, Button, Input, FormControl, FormLabel, Stack } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import SmallScreenDivider from "../ui/SmallScreenDivider";

const CandidatePage = () => {
  const { project, updateProject } = useProjectContext();

  const candidatesData =
    project?.candidates?.map((cdd) => {
      return {
        cuid: cdd.cuid,
        nric: cdd.nric,
        name: cdd.name,
        contact: cdd.contact,
        dateOfBirth: cdd.dateOfBirth,
        startDate: cdd.startDate,
        endDate: cdd.endDate,
        hasOnboarded: cdd.hasOnboarded,
        employmentType: cdd.employmentType,
        consultantCuid: cdd.consultantCuid,
        consultantName: project?.consultants.find(
          (c) => c.cuid === cdd.consultantCuid
        )!.name,
      };
    }) || [];

  const [searchValue, setSearchValue] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [candidatesToDelete, setCandidatesToDelete] = useState<string[]>([]);

  // TODO: Fix type
  const matchSearchValue = (
    c: Omit<Omit<Omit<CommonCandidate, "dateOfBirth">, "startDate">, "endDate">
  ) =>
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
          <FormLabel>Search by nric / name</FormLabel>
          <Input
            size="sm"
            placeholder="Search"
            startDecorator={<SearchIcon />}
            onChange={(e) => setSearchValue(e.target.value)}
            disabled={candidatesData.length === 0}
            fullWidth
          />
        </FormControl>

        <Box sx={{ display: "flex" }}>
          <Button
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            sx={{ mt: "auto", display: { xs: "none", sm: "block" } }}
          >
            Import candidates
          </Button>
        </Box>
      </Box>

      <SmallScreenDivider />

      <CandidateTable
        tableData={candidatesData
          .filter((c) => matchSearchValue(c))
          .map((c) => ({
            ...c,
            startDate: c.startDate.toISOString(),
            endDate: c.endDate.toISOString(),
            dateOfBirth: c.dateOfBirth.toISOString(),
          }))}
        handleDelete={handleConfirmDeletion}
        showCandidateHolder={true}
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
    </Stack>
  );
};

export default CandidatePage;
