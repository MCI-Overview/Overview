import axios from "axios";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

import { useUserContext } from "../../../providers/userContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { CommonConsultant } from "../../../types/common";

import CollaboratorsTable from "./CollaboratorsTable";
import InviteCollaborators from "./InviteCollaborators";
import RemoveConsultantModal from "./RemoveConsultantModal";

import {
  Box,
  Card,
  CardOverflow,
  CardActions,
  Divider,
  Stack,
  Typography,
} from "@mui/joy";

const ManageProjectAccess = () => {
  const [allConsultants, setAllConsultants] = useState<CommonConsultant[]>([]);

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [consultantToRemove, setConsultantToRemove] =
    useState<CommonConsultant | null>(null);

  const { user } = useUserContext();
  const { project, updateProject } = useProjectContext();

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const { data } = await axios.get("/api/admin/consultants");
        setAllConsultants(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch consultants. Please try again later.");
      }
    };
    fetchConsultants();
  }, []);

  if (!user || !project) return null;

  const currentUser = project.consultants.find(
    (collaborator) => collaborator.cuid === user.cuid
  );

  if (!currentUser) return null;

  const handleRemoveConsultant = (consultant: CommonConsultant) => {
    setConsultantToRemove(consultant);
    setIsRemoveModalOpen(true);
  };

  const handleRoleChange = async (
    newRole: "CLIENT_HOLDER" | "CANDIDATE_HOLDER" | null,
    consultant: CommonConsultant
  ) => {
    if (!newRole) return;

    await axios
      .patch(`/api/admin/project/${project.cuid}/manage`, {
        consultantCuid: consultant.cuid,
        role: newRole,
      })
      .then(() => {
        toast.success("Role updated successfully");
        updateProject();
      })
      .catch((error) => {
        console.error(error);
        toast.error("Unable to update role.");
      });
  };

  return (
    <>
      <Stack
        spacing={4}
        sx={{
          display: "flex",
          mx: "auto",
        }}
      >
        <Card>
          <Box sx={{ mb: 1 }}>
            <Typography level="title-md">Project collaborators</Typography>
            <Typography level="body-sm">
              Only collaborators are allowed access to this project.{" "}
            </Typography>
          </Box>
          <Divider />
          <Stack spacing={2} sx={{ my: 1 }}>
            {currentUser.role === "CLIENT_HOLDER" && (
              <>
                <InviteCollaborators allConsultants={allConsultants} />
                <Divider />
              </>
            )}
            <CollaboratorsTable
              consultants={project.consultants.sort((a) =>
                a.cuid === currentUser.cuid
                  ? -1
                  : a.role === "CLIENT_HOLDER"
                  ? 0
                  : 1
              )}
              currentUser={currentUser}
              handleRemoveConsultant={handleRemoveConsultant}
              handleRoleChange={handleRoleChange}
            />
          </Stack>
          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ alignSelf: "flex-start", pt: 2 }}>
              <Typography level="body-sm">
                Only client holders can invite and remove collaborators.
              </Typography>
            </CardActions>
          </CardOverflow>
        </Card>
      </Stack>

      {consultantToRemove && (
        <RemoveConsultantModal
          isOpen={isRemoveModalOpen}
          setIsOpen={setIsRemoveModalOpen}
          consultantToRemove={consultantToRemove}
        />
      )}
    </>
  );
};

export default ManageProjectAccess;
