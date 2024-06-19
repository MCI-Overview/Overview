import { FormControl, FormLabel, Input, Grid, Autocomplete } from "@mui/joy";
import { useEffect, useState } from "react";
import LoadingRequestButton from "../../components/LoadingRequestButton";
import axios from "axios";
import toast from "react-hot-toast";
import dayjs, { ManipulateType } from "dayjs";

export default function ResignationForm({
  setIsOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
}) {
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
              project.noticePeriodUnit as ManipulateType,
            );

            return dayjs().isBefore(noticePeriodEndDate);
          },
        ),
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
        toast.success("Resignation request submitted successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occured while submitting your resignation request");
    }
  };

  return (
    <>
      <Grid container columns={2} spacing={2}>
        <Grid xs={1}>
          <FormControl>
            <FormLabel>Project</FormLabel>
            <Autocomplete
              options={projects}
              getOptionLabel={(project) => project.name}
              onChange={(_e, value) => {
                setProject(
                  value as {
                    cuid: string;
                    endDate: string;
                    noticePeriodDuration: number;
                    noticePeriodUnit: string;
                  },
                );
                setLastDay(dayjs().format("YYYY-MM-DD"));
              }}
            />
          </FormControl>
        </Grid>
        <Grid xs={1}>
          <FormControl>
            <FormLabel>Last Day</FormLabel>
            <Input
              disabled={!project.cuid}
              type="date"
              value={lastDay}
              onChange={(e) => setLastDay(e.target.value)}
              slotProps={{
                input: {
                  min: dayjs().format("YYYY-MM-DD"),
                  max: dayjs(project.endDate)
                    .subtract(
                      project.noticePeriodDuration,
                      project.noticePeriodUnit as ManipulateType,
                    )
                    .format("YYYY-MM-DD"),
                },
              }}
            />
          </FormControl>
        </Grid>
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
