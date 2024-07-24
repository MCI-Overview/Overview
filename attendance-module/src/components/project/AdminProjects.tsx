import axios from "axios";
import dayjs from "dayjs";
import { FC, useState, useEffect } from "react";
import { BasicProject } from "../../types/index";
import AdminProjectDisplay from "./ui/AdminProjectDisplay";
import CreateProjectModal from "./create/CreateProjectModal";

import {
  Box,
  Card,
  Divider,
  IconButton,
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
const projectComparator = (a: BasicProject, b: BasicProject) => {
  return dayjs(b.createdAt).diff(dayjs(a.createdAt));
};

const AdminProjects: FC<{ variant: "OWN" | "ALL" }> = ({ variant }) => {
  const [previousProjects, setPreviousProjects] = useState<BasicProject[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<BasicProject[]>([]);
  const [futureProjects, setFutureProjects] = useState<BasicProject[]>([]);
  const [value, setValue] = useState<"concluded" | "ongoing" | "upcoming">(
    "ongoing"
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const url =
      variant === "OWN" ? "/api/admin/projects" : "/api/admin/projects/all";

    axios.get(url).then((response) => {
      const projects = response.data as BasicProject[];

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
  }, [variant]);

  const currentProjectList =
    value === "concluded"
      ? previousProjects
      : value === "ongoing"
      ? ongoingProjects
      : futureProjects;

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
                  {variant === "OWN" && "My projects"}
                  {variant === "ALL" && "All projects"}
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
                  <Option value="upcoming">upcoming</Option>
                </Select>
              </Box>

              <Typography level="body-sm">
                {variant === "OWN" &&
                  "Projects that you have joined or created."}
                {variant === "ALL" &&
                  "Projects that you are not a collaborator of."}
              </Typography>
            </Box>
            {variant === "OWN" && (
              <Tooltip title="Create new project" placement="right">
                <IconButton
                  size="lg"
                  onClick={() => setIsCreateModalOpen(true)}
                  sx={{ my: "auto" }}
                >
                  <ControlPointIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Divider />

          <Stack spacing={2} sx={{ my: 1 }}>
            {!currentProjectList ? (
              <Typography level="body-sm" textAlign="center">
                Loading...
              </Typography>
            ) : currentProjectList.length === 0 ? (
              <Typography level="body-sm" textAlign="center">
                {`No ${value} projects found`}
              </Typography>
            ) : (
              currentProjectList
                .sort(projectComparator)
                .map((project: BasicProject) => (
                  <AdminProjectDisplay
                    key={project.cuid}
                    project={project}
                    viewOnly={variant === "ALL"}
                  />
                ))
            )}
          </Stack>
        </Card>
      </Stack>

      {variant === "OWN" && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          setIsOpen={setIsCreateModalOpen}
        />
      )}
    </>
  );
};

export default AdminProjects;
