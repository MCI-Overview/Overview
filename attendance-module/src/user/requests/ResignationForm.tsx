import axios from "axios";
import dayjs, { ManipulateType } from "dayjs";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRequestContext } from "../../providers/requestContextProvider";
import LoadingRequestButton from "../../components/LoadingRequestButton";

import {
  FormControl,
  FormLabel,
  Input,
  Grid,
  Autocomplete,
  Typography,
} from "@mui/joy";

export default function ResignationForm({
  setIsOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { updateRequest } = useRequestContext();

  const [project, setProject] = useState({
    cuid: "",
    endDate: "",
    noticePeriodDuration: 0,
    noticePeriodUnit: "",
  });
  const [lastDay, setLastDay] = useState("");
  const [reason, setReason] = useState("");

  const [projects, setProjects] = useState<
    {
      cuid: string;
      name: string;
      endDate: string;
      noticePeriodDuration: number;
      noticePeriodUnit: string;
    }[]
  >([]);

  useEffect(() => {
    axios.get("/api/user/projects").then((response) => {
      setProjects(
        response.data.filter(
          (project: {
            endDate: string;
            noticePeriodDuration: number;
            noticePeriodUnit: string;
          }) => {
            const endDate = dayjs(project.endDate);
            const noticePeriodEndDate = endDate.subtract(
              project.noticePeriodDuration,
              project.noticePeriodUnit as ManipulateType
            );

            return dayjs().isBefore(noticePeriodEndDate);
          }
        )
      );
    });
  }, []);

  const handleClaimSubmit = async () => {
    try {
      const response = await axios.post(`/api/user/request/resign`, {
        projectCuid: project.cuid,
        lastDay,
        reason,
      });

      if (response.status === 200) {
        setIsOpen(false);
        updateRequest();
        toast.success("Resignation request submitted successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occured while submitting your resignation request");
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>Project</FormLabel>
            <Autocomplete
              options={projects}
              getOptionLabel={(project) => project.name}
              onChange={(_e, value) => {
                if (!value) {
                  setProject({
                    cuid: "",
                    endDate: "",
                    noticePeriodDuration: 0,
                    noticePeriodUnit: "",
                  });
                  return;
                }

                setProject(
                  value as {
                    cuid: string;
                    endDate: string;
                    noticePeriodDuration: number;
                    noticePeriodUnit: string;
                  }
                );
                setLastDay(dayjs().format("YYYY-MM-DD"));
              }}
            />
          </FormControl>
        </Grid>

        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>Last Day</FormLabel>
            <Input
              disabled={!project.cuid}
              type="date"
              value={lastDay}
              onChange={(e) => setLastDay(e.target.value)}
              slotProps={{
                input: {
                  min: dayjs()
                    .add(
                      project.noticePeriodDuration,
                      project.noticePeriodUnit as ManipulateType
                    )
                    .format("YYYY-MM-DD"),
                  max: dayjs(project.endDate).format("YYYY-MM-DD"),
                },
              }}
            />
          </FormControl>
        </Grid>

        {project.cuid && (
          <Grid sx={{ pt: 0 }}>
            <Typography level="body-xs">
              Notice period of this project: {project.noticePeriodDuration}{" "}
              {project.noticePeriodUnit.toLowerCase()}.
            </Typography>
          </Grid>
        )}
      </Grid>

      <FormControl>
        <FormLabel>Reason</FormLabel>
        <Input type="text" onChange={(e) => setReason(e.target.value)} />
      </FormControl>
      <LoadingRequestButton
        promise={handleClaimSubmit}
        disabled={!project.cuid || !reason || !lastDay}
      />
    </>
  );
}
