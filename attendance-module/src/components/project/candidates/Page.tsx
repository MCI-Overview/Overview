import axios from "axios";
import { useState } from "react";
import AssignCandidateModal from "./AssignCandidateModal";
import CandidateTable from "./CandidateTable";
import { CommonCandidate } from "../../../types/common";
import DeleteCandidateModal from "./DeleteCandidateModal";
import { useProjectContext } from "../../../providers/projectContextProvider";

import { Box, Button, Card, CardOverflow, Input, Stack } from "@mui/joy";
import toast from "react-hot-toast";

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
          (c) => c.cuid === cdd.consultantCuid,
        )!.name,
      };
    }) || [];

  const [searchValue, setSearchValue] = useState("");

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [candidatesToDelete, setCandidatesToDelete] = useState<string[]>([]);

  // TODO: Fix type
  const matchSearchValue = (
    c: Omit<Omit<Omit<CommonCandidate, "dateOfBirth">, "startDate">, "endDate">,
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
        // maxWidth: "1000px",
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
              .map((c) => ({
                ...c,
                startDate: c.startDate.toISOString(),
                endDate: c.endDate.toISOString(),
                dateOfBirth: c.dateOfBirth.toISOString(),
              }))}
            // handleEdit={handleEdit}
            handleDelete={handleConfirmDeletion}
            showCandidateHolder={true}
          />
        </CardOverflow>
      </Card>

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
