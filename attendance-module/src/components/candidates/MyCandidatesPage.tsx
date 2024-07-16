import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import { useUserContext } from "../../providers/userContextProvider";
import { formatDate } from "../../utils/date-time";
import { TdTypo, ThTypo } from "../project/ui/TableTypo";

import {
  Box,
  Chip,
  FormControl,
  FormLabel,
  Input,
  Link,
  Sheet,
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

  useEffect(() => {
    if (!user?.cuid) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `/api/admin/consultant/${user?.cuid}/candidates`
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
  }, [user?.cuid]);

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
      <FormControl size="sm">
        <FormLabel>Search candidates</FormLabel>
        <Input
          placeholder="Search by name/nric"
          fullWidth
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </FormControl>

      <Sheet
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          minHeight: 0,
          maxHeight: "60vh",
          scrollbarWidth: "thin",
        }}
      >
        <Table
          aria-labelledby="tableTitle"
          stickyHeader
          // hoverRow
          sx={{
            "--TableCell-headBackground":
              "var(--joy-palette-background-level1)",
            "--Table-headerUnderlineThickness": "1px",
            "--TableRow-hoverBackground":
              "var(--joy-palette-background-level1)",
            "--TableCell-paddingY": "4px",
            "--TableCell-paddingX": "8px",
            "& tr > *": { textAlign: "center" },
          }}
        >
          <thead>
            <tr>
              <ThTypo>NRIC</ThTypo>
              <ThTypo>Name</ThTypo>
              <ThTypo>Project</ThTypo>
              <ThTypo>Start date</ThTypo>
              <ThTypo>End date</ThTypo>
            </tr>
          </thead>
          <tbody>
            {candidateData.length === 0 && (
              <tr>
                <TdTypo colSpan={5}>No candidates found</TdTypo>
              </tr>
            )}
            {Object.entries(groupByCandidates(candidateData))
              .filter(matchSearchValue)
              .map(([candidateCuid, projects]) => (
                <Fragment key={candidateCuid}>
                  {projects.sort(dateComparator).map((project, index) => (
                    <tr key={project.projectCuid}>
                      {index === 0 && (
                        <TdTypo rowSpan={projects.length}>
                          {project.candidateNric}
                        </TdTypo>
                      )}
                      {index === 0 && (
                        <TdTypo rowSpan={projects.length}>
                          <Link
                            variant="soft"
                            href={`#/admin/candidate/${candidateCuid}`}
                          >
                            {project.candidateName}
                          </Link>
                        </TdTypo>
                      )}
                      <TdTypo>
                        <Link
                          variant="soft"
                          color={
                            new Date() < project.startDate
                              ? "warning"
                              : new Date() > project.endDate
                              ? "neutral"
                              : "success"
                          }
                          href={`#/admin/project/${project.projectCuid}`}
                        >
                          {project.projectName}
                        </Link>
                      </TdTypo>
                      <TdTypo>{formatDate(project.startDate)}</TdTypo>
                      <TdTypo>{formatDate(project.endDate)}</TdTypo>
                    </tr>
                  ))}
                </Fragment>
              ))}
          </tbody>
        </Table>
      </Sheet>

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
