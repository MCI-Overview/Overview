import axios from "axios";
import dayjs from "dayjs";
import { FC, useState, useEffect } from "react";
import { Project } from "../../types/index";
import ProjectDisplay from "./ui/Project";
import CreateProjectPage from "./create/CreatePage";

import {
  Box,
  Card,
  Divider,
  IconButton,
  Modal,
  ModalDialog,
  Option,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/joy";
import {
  ArrowDropDown as ArrowDropDownIcon,
  ControlPointRounded as ControlPointIcon,
} from "@mui/icons-material";

// sort by createdAt (most recent first)
const projectComparator = (a: Project, b: Project) => {
  return dayjs(b.createdAt).diff(dayjs(a.createdAt));
};

const MyProjects: FC = () => {
  const [previousProjects, setPreviousProjects] = useState<Project[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<Project[]>([]);
  const [futureProjects, setFutureProjects] = useState<Project[]>([]);
  const [value, setValue] = useState<"concluded" | "ongoing" | "future">(
    "ongoing"
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    axios.get("/api/admin/projects").then((response) => {
      const projects = response.data as Project[];

      setPreviousProjects(
        projects.filter((project) => dayjs().isAfter(dayjs(project.endDate)))
      );

      setOngoingProjects(
        projects.filter(
          (project) =>
            dayjs().isAfter(dayjs(project.startDate)) &&
            dayjs().isBefore(dayjs(project.endDate))
        )
      );

      setFutureProjects(
        projects.filter((project) => dayjs().isBefore(dayjs(project.startDate)))
      );
    });
  }, []);

  const handleCreateProjectClick = () => {
    setIsCreateModalOpen(true);
  };

  const getCurrentProjectList = () => {
    switch (value) {
      case "concluded":
        return previousProjects;
      case "ongoing":
        return ongoingProjects;
      case "future":
        return futureProjects;
    }
  };

  return (
    <>
      <Stack
        spacing={4}
        sx={{
          display: "flex",
          maxWidth: "800px",
          mx: "auto",
        }}
      >
        <Card>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography
                  level="title-md"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  My projects:
                </Typography>

                <Select
                  value={value}
                  onChange={(_event, newValue) => {
                    setValue(newValue || "ongoing");
                  }}
                  variant="soft"
                  indicator={<ArrowDropDownIcon />}
                  renderValue={(selected) => (
                    <Typography level="title-md">{selected?.label}</Typography>
                  )}
                  sx={{ px: 1 }}
                >
                  <Option value="concluded">concluded</Option>
                  <Option value="ongoing">ongoing</Option>
                  <Option value="future">future</Option>
                </Select>
              </Box>

              <Typography level="body-sm">
                Projects that you have joined or created.
              </Typography>
            </Box>

            <Tooltip title="Create new project" placement="right">
              <IconButton
                size="lg"
                onClick={handleCreateProjectClick}
                sx={{ my: "auto" }}
              >
                <ControlPointIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Divider />

          <Stack spacing={2} sx={{ my: 1 }}>
            {!getCurrentProjectList() ? (
              <Typography level="body-sm" textAlign="center">
                Loading...
              </Typography>
            ) : getCurrentProjectList().length === 0 ? (
              <Typography level="body-sm" textAlign="center">
                {`No ${value} projects found`}
              </Typography>
            ) : (
              getCurrentProjectList()
                .sort(projectComparator)
                .map((project: Project) => (
                  <ProjectDisplay
                    key={project.cuid}
                    projectName={project.name}
                    companyName={project.Client.name}
                    projectCuid={project.cuid}
                  />
                ))
            )}
          </Stack>
        </Card>
      </Stack>

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ModalDialog
          sx={{
            width: {
              xs: "100%",
              sm: "600px"
            }
          }}
        >
          <CreateProjectPage />
        </ModalDialog>
      </Modal>
    </>
  );
};

export default MyProjects;
