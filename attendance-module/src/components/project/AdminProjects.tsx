import axios from "axios";
import dayjs from "dayjs";
import { FC, useState, useEffect } from "react";
import { BasicProject } from "../../types/index";
import { useUserContext } from "../../providers/userContextProvider";
import AdminProjectDisplay from "./ui/AdminProjectDisplay";

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
const projectComparator = (a: BasicProject, b: BasicProject) => {
  return dayjs(b.createdAt).diff(dayjs(a.createdAt));
};

const AllProjects: FC<{
  apiURL: string;
}> = ({ apiURL }) => {
  const [previousProjects, setPreviousProjects] = useState<BasicProject[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<BasicProject[]>([]);
  const [futureProjects, setFutureProjects] = useState<BasicProject[]>([]);
  const [value, setValue] = useState<"concluded" | "ongoing" | "upcoming">(
    "ongoing"
  );

  const { user } = useUserContext();

  useEffect(() => {
    if (!user) return;

    axios.get(apiURL).then((response) => {
      const projects = response.data as BasicProject[];

      const currentTime = dayjs();

      setPreviousProjects(
        projects.filter((project) =>
          currentTime.isAfter(dayjs(project.endDate))
        )
      );

      setOngoingProjects(
        projects.filter((project) =>
          currentTime.isBetween(
            dayjs(project.startDate),
            dayjs(project.endDate),
            null,
            "[]"
          )
        )
      );

      setFutureProjects(
        projects.filter((project) =>
          currentTime.isBefore(dayjs(project.startDate))
        )
      );
    });
  }, [apiURL, user]);

  if (!user) return null;

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
                <Option value="upcoming">upcoming</Option>
              </Select>
            </Box>

            <Typography level="body-sm">
              Projects that you are not a collaborator of.
            </Typography>
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
                    viewOnly
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
