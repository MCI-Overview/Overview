import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AssignCandidateSection from "../../components/project/candidates/AssignCandidateSection";
import CandidateTable from "../../components/project/candidates/CandidateTable";

import {
  Button,
  Card,
  CardOverflow,
  IconButton,
  Input,
  List,
  ListItem,
  Modal,
  ModalDialog,
  Sheet,
  Stack,
  Tooltip,
  Typography,
} from "@mui/joy";
import toast from "react-hot-toast";
import { FilterList, FilterListOff } from "@mui/icons-material";

type Candidate = {
  nric: string;
  name: string;
  phoneNumber: string;
  dateOfBirth: string;
};

const AssignCandidatePage = () => {
  const { projectId } = useParams();

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [candidatesData, setCandidatesData] = useState<Candidate[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [ageOrder, setAgeOrder] = useState<"ASC" | "DSC" | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  // retrieve existing candidates id
  useEffect(() => {
    const fetchExistingCandidates = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/admin/project/${projectId}/candidates`,
          { withCredentials: true }
        );
        setCandidatesData(
          response.data.map((c: Candidate) => {
            return {
              nric: c.nric,
              name: c.name,
              phoneNumber: c.phoneNumber,
              dateOfBirth: c.dateOfBirth,
            };
          })
        );
      } catch (error) {
        toast.error("Error while fetching candidates. Please try again later.");
      }
    };

    fetchExistingCandidates();
  }, [projectId]);

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

  const handleConfirmDeletion = async (nricList: string[]) => {
    if (nricList.length === 0) {
      toast.error("No candidate selected");
      return;
    }
    setSelectedCandidates(nricList);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCandidates = async () => {
    try {
      const body = { nricList: selectedCandidates };
      await axios.delete(
        `http://localhost:3000/api/admin/project/${projectId}/candidates`,
        { data: body, withCredentials: true }
      );
      setCandidatesData((prev) =>
        prev.filter((c) => !selectedCandidates.includes(c.nric))
      );

      setIsDeleteModalOpen(false);
      toast.success("Candidate removed successfully");
    } catch (error) {
      setIsDeleteModalOpen(false);
      toast.error("Error while removing candidate");
    }
  };

  return (
    <>
      <Stack
        spacing={1}
        sx={{
          display: "flex",
          maxWidth: "1000px",
          mx: "auto",
          px: { xs: 2, md: 6 },
        }}
      >
        <Sheet
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
            fullWidth
          />

          <Tooltip title="Sort by age" placement="top" size="sm">
            <IconButton onClick={handleSortByAgeClick}>
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
        </Sheet>

        <Card>
          <CardOverflow sx={{ px: "0px" }}>
            <CandidateTable
              tableProps={{ stripe: "odd", size: "sm" }}
              tableData={candidatesData
                .filter((c) => matchSearchValue(c))
                .sort(ageComparator)}
              showActions={true}
              handleDelete={handleConfirmDeletion}
            />
          </CardOverflow>
        </Card>
      </Stack>

      <AssignCandidateSection
        isUploadOpen={isUploadOpen}
        setIsUploadOpen={setIsUploadOpen}
        existingCddIdList={candidatesData.map((c) => c.nric)}
      />

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <ModalDialog sx={{ maxWidth: "525px" }}>
          <Typography level="title-md">
            Are you sure you want to delete the following candidates? This
            action cannot be undone.
          </Typography>
          <List component="ol" marker="decimal">
            {candidatesData.map((c) => {
              if (selectedCandidates.includes(c.nric)) {
                return (
                  <ListItem key={c.nric}>
                    <Typography level="title-md">
                      {c.nric} - {c.name}
                    </Typography>
                  </ListItem>
                );
              }
            })}
          </List>
          <Stack direction="row" spacing={1}>
            <Button
              onClick={() => handleDeleteCandidates()}
              color="danger"
              fullWidth
            >
              Confirm
            </Button>
            <Button onClick={() => setIsDeleteModalOpen(false)} fullWidth>
              Cancel
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default AssignCandidatePage;
