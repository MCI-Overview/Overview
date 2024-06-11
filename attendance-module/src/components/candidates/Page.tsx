import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import { useUserContext } from "../../providers/userContextProvider";
import { formatDate } from "../../utils/date-time";

import {
  Box,
  Card,
  CardOverflow,
  Chip,
  Input,
  Link,
  Stack,
  Table,
  Typography,
} from "@mui/joy";

export type CandidateData = {
  candidateCuid: string;
  candidateNric: string;
  candidateName: string;
  projectCuid: string;
  projectName: string;
  startDate: Date;
  endDate: Date;
};

type ResponseDataType = {
  candidateCuid: string;
  candidateNric: string;
  candidateName: string;
  projectCuid: string;
  projectName: string;
  startDate: string;
  endDate: string;
};

const MyCandidatesPage = () => {
  const { user } = useUserContext();

  const [candidateData, setCandidateData] = useState<CandidateData[]>([]);
  const [searchValue, setSearchValue] = useState("");

  if (!user) return null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `/api/admin/consultant/${user.cuid}/candidates`
        );
        const data = res.data.map((data: ResponseDataType) => ({
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        }));
        setCandidateData(data);
      } catch (error) {
        console.error("Error while fetching candidate data", error);
      }
    };

    fetchData();
  }, [user.cuid]);

  const groupByCandidates = (data: CandidateData[]) => {
    const groupedData: Record<string, CandidateData[]> = {};

    data.forEach((row) => {
      if (!groupedData[row.candidateCuid]) {
        groupedData[row.candidateCuid] = [];
      }
      groupedData[row.candidateCuid].push(row);
    });

    return groupedData;
  };

  const dateComparator = (a: CandidateData, b: CandidateData) => {
    const currDate = new Date();

    // A has yet to start
    if (currDate < a.startDate) {
      // B has yet to start
      if (currDate < b.startDate) {
        return a.startDate.getTime() - b.startDate.getTime();
      }

      // B has started/ended
      return -1;
    }

    // A is ongoing
    if (a.startDate <= currDate && currDate <= a.endDate) {
      // B has yet to start
      if (currDate < b.startDate) {
        return 1;
      }

      // B is ongoing
      if (b.startDate <= currDate && currDate <= b.endDate) {
        return a.startDate.getTime() - b.startDate.getTime();
      }

      // B has ended
      return -1;
    }

    // A has ended
    if (currDate > a.endDate) {
      // B has yet to start
      if (currDate < b.startDate) {
        return 1;
      }

      // B is ongoing
      if (b.startDate <= currDate && currDate <= b.endDate) {
        return 1;
      }

      // B has ended
      return a.endDate.getTime() - b.endDate.getTime();
    }

    return 0;
  };

  const legendFields: {
    color: "warning" | "success" | "neutral";
    label: string;
    name: string;
  }[] = [
      { color: "warning", label: "Upcoming", name: "Project Foo" },
      { color: "success", label: "Ongoing", name: "Project Bar" },
      { color: "neutral", label: "Former", name: "Project Baz" },
    ];

  const matchSearchValue = (cdd: [string, CandidateData[]]) => {
    return cdd[1].some(
      (project) =>
        project.candidateName
          .toLowerCase()
          .includes(searchValue.toLowerCase()) ||
        project.candidateNric.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  return (
    <Stack
      spacing={1}
      sx={{
        display: "flex",
        maxWidth: "800px",
        mx: "auto",
        px: { xs: 2, md: 6 },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Input
          placeholder="Search candidates by name/nric"
          fullWidth
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </Box>

      <Card>
        <CardOverflow sx={{ px: "0px" }}>
          <Box maxHeight="60vh" overflow="auto" sx={{ scrollbarWidth: "thin" }}>
            <Table
              sx={{
                "& tr > *": { textAlign: "center" },
                maxHeight: "60vh",
                overflow: "auto",
                scrollbarWidth: "thin",
              }}
              size="sm"
              stickyHeader
            >
              <thead>
                <tr>
                  <th>NRIC</th>
                  <th>Name</th>
                  <th>Project</th>
                  <th>Start date</th>
                  <th>End date</th>
                </tr>
              </thead>
              <tbody>
                {candidateData.length === 0 && (
                  <tr>
                    <td colSpan={5}>No candidates found.</td>
                  </tr>
                )}
                {Object.entries(groupByCandidates(candidateData))
                  .filter(matchSearchValue)
                  .map(([candidateCuid, projects]) => (
                    <Fragment key={candidateCuid}>
                      {projects.sort(dateComparator).map((project, index) => (
                        <tr key={project.projectCuid}>
                          {index === 0 && (
                            <td rowSpan={projects.length}>
                              {project.candidateNric}
                            </td>
                          )}
                          {index === 0 && (
                            <td rowSpan={projects.length}>
                              <Link
                                variant="soft"
                                href={`/admin/candidate/${candidateCuid}`} // TODO: Change this to the correct path
                              >
                                {project.candidateName}
                              </Link>
                            </td>
                          )}
                          <td>
                            <Link
                              variant="soft"
                              color={
                                new Date() < project.startDate
                                  ? "warning"
                                  : new Date() > project.endDate
                                    ? "neutral"
                                    : "success"
                              }
                              href={`/admin/project/${project.projectCuid}`}
                            >
                              {project.projectName}
                            </Link>
                          </td>
                          <td>{formatDate(project.startDate)}</td>
                          <td>{formatDate(project.endDate)}</td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
              </tbody>
            </Table>
          </Box>
        </CardOverflow>
      </Card>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-evenly",
          alignContent: "center",
        }}
      >
        <Typography level="title-sm">Legend:</Typography>
        {legendFields.map((field) => (
          <Box
            key={field.name}
            fontSize="small"
            sx={{
              display: "flex",
              gap: 0.5,
            }}
          >
            <Typography level="body-xs">{field.label + ":"}</Typography>
            <Chip key={field.color} color={field.color} size="sm">
              {field.name}
            </Chip>
          </Box>
        ))}
      </Box>
    </Stack>
  );
};

export default MyCandidatesPage;
