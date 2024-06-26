import axios from "axios";
import dayjs from "dayjs";
import { FC, useState, useEffect } from "react";
import { Project } from "../../types/index";
import { useUserContext } from "../../providers/userContextProvider";
import ProjectDisplay from "./ui/Project";

import {
  Box,
  Card,
  Divider,
  Option,
  Select,
  Stack,
  Typography,
} from "@mui/joy";
import { ArrowDropDown as ArrowDropDownIcon } from "@mui/icons-material";

// sort by createdAt (most recent first)
const projectComparator = (a: Project, b: Project) => {
  return dayjs(b.createdAt).diff(dayjs(a.createdAt));
};

const AllProjects: FC = () => {
  const [previousProjects, setPreviousProjects] = useState<Project[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<Project[]>([]);
  const [futureProjects, setFutureProjects] = useState<Project[]>([]);
  const [value, setValue] = useState<"concluded" | "ongoing" | "future">(
    "ongoing"
  );

  const { user } = useUserContext();

  useEffect(() => {
    if (!user) return;

    axios.get("/api/admin/projects/all").then((response) => {
      const allProjects = response.data as Project[];

      const projects = allProjects.filter((project) => {
        return !project.Manage.find((m) => m.consultantCuid === user.cuid);
      });

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
  }, [user]);

  if (!user) return null;

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

  const getClientHolders = (project: Project) => {
    return project.Manage.filter((m) => m.role === "CLIENT_HOLDER").map(
      (m) => m.Consultant.name
    );
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
          <Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography
                level="title-md"
                sx={{ display: "flex", alignItems: "center" }}
              >
                All projects:
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
              Projects that you are not a collaborator of.
            </Typography>
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
                    clientHolders={getClientHolders(project)}
                    viewOnly={true}
                  />
                ))
            )}
          </Stack>
        </Card>
      </Stack>
    </>
  );
};

export default AllProjects;
