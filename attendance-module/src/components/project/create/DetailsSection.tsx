import {
  Stack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Autocomplete,
  Grid,
} from "@mui/joy";
import { CreateProjectData } from "../../../types";
import { Client } from "../../../types/common";
import axios from "axios";
import { useState, useEffect, SyntheticEvent, useRef } from "react";
import { capitalizeWords } from "../../../utils/capitalize";

const NOTICE_PERIOD_UNITS = ["DAY", "WEEK", "MONTH"];

function addS(value: number, string: string) {
  return Math.abs(value) <= 1 ? string : `${string}s`;
}

export default function ProjectDetailsSection({
  projectDetails,
  setProjectDetails,
}: {
  projectDetails: CreateProjectData;
  setProjectDetails: (projectDetails: CreateProjectData) => void;
}) {
  const [clientList, setClientList] = useState<Client[]>([]);
  const [clientExists, setClientExists] = useState<boolean>(false);
  const clientCompanyNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      axios.get("/api/admin/clients").then((response) => {
        setClientList(response.data);
      });
    } catch (error) {
      console.error("Error while fetching clients", error);
    }
  }, []);

  function handleClientUENInput(e: SyntheticEvent<Element, Event>) {
    const inputUEN = (e.target as HTMLSelectElement).value;

    if (inputUEN === projectDetails.clientUEN) {
      return;
    }

    const client = clientList.find((c) => c.uen === inputUEN);
    if (client) {
      setProjectDetails({
        ...projectDetails,
        clientUEN: client.uen,
        clientName: client.name,
      });
      setClientExists(true);
      clientCompanyNameRef.current!.value = client.name;
    } else {
      setProjectDetails({
        ...projectDetails,
        clientUEN: inputUEN,
      });
      setClientExists(false);
    }
  }

  return (
    <Stack spacing={2} sx={{ my: 1 }}>
      <FormControl required>
        <FormLabel>Project title</FormLabel>
        <Input
          placeholder="Enter project title here"
          onChange={(e) =>
            setProjectDetails({
              ...projectDetails,
              name: e.target.value,
            })
          }
        />
      </FormControl>
      <FormControl required>
        <FormLabel>Employment by</FormLabel>
        <Select
          placeholder="Select a company"
          onChange={(_e, value) => {
            setProjectDetails({
              ...projectDetails,
              employmentBy: value as string,
            });
          }}
        >
          <Option value="MCI Career Services Pte Ltd">
            MCI Career Services Pte Ltd
          </Option>
          <Option value="MCI Outsourcing Pte Ltd">
            MCI Outsourcing Pte Ltd
          </Option>
        </Select>
      </FormControl>
      <Grid container xs={12}>
        <Grid xs={6} sx={{ pr: 1 }}>
          <FormControl required sx={{ flexGrow: 1 }}>
            <FormLabel>Client company UEN</FormLabel>
            <Autocomplete
              freeSolo
              placeholder="Enter client company UEN"
              options={clientList.map((c) => ({
                label: c.uen,
                value: c.uen,
              }))}
              onSelect={handleClientUENInput}
            />
          </FormControl>
        </Grid>
        <Grid xs={6} sx={{ pl: 1 }}>
          <FormControl required sx={{ flexGrow: 1 }} disabled={clientExists}>
            <FormLabel>Client company name</FormLabel>
            <Input
              placeholder="Enter client company name"
              value={projectDetails.clientName || ""}
              ref={clientCompanyNameRef}
              onChange={(e) =>
                setProjectDetails({
                  ...projectDetails,
                  clientName: e.target.value,
                })
              }
            />
          </FormControl>
        </Grid>
      </Grid>
      <Grid container xs={12}>
        <Grid xs={6} sx={{ pr: 1 }}>
          <FormControl required sx={{ flexGrow: 1 }}>
            <FormLabel>Project start date</FormLabel>
            <Input
              type="date"
              onChange={(e) =>
                setProjectDetails({
                  ...projectDetails,
                  startDate: new Date(e.target.value),
                })
              }
            />
          </FormControl>
        </Grid>
        <Grid xs={6} sx={{ pl: 1 }}>
          <FormControl required sx={{ flexGrow: 1 }}>
            <FormLabel>Project end date</FormLabel>
            <Input
              type="date"
              onChange={(e) =>
                setProjectDetails({
                  ...projectDetails,
                  endDate: new Date(e.target.value),
                })
              }
            />
          </FormControl>
        </Grid>
      </Grid>
      <Grid container xs={12}>
        <Grid xs={6} sx={{ pr: 1 }}>
          <FormControl required sx={{ flexGrow: 1 }}>
            <FormLabel>Notice period duration</FormLabel>
            <Input
              type="number"
              placeholder="Enter notice period duration"
              value={projectDetails.noticePeriodDuration || ""}
              onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()}
              onChange={(e) => {
                if (parseInt(e.target.value) === 0) {
                  setProjectDetails({
                    ...projectDetails,
                    noticePeriodDuration: "0",
                  });
              } else {
                setProjectDetails({
                  ...projectDetails,
                  noticePeriodDuration: e.target.value,
                })
              }}}
            />
          </FormControl>
        </Grid>
        <Grid xs={6} sx={{ pl: 1 }}>
          <FormControl required sx={{ flexGrow: 1 }}>
            <FormLabel>Notice period unit</FormLabel>
            <Select
              placeholder="Select notice period unit"
              onChange={(_e, value) => {
                setProjectDetails({
                  ...projectDetails,
                  noticePeriodUnit: value as string
                })
              }
            }
            >
              {NOTICE_PERIOD_UNITS.map((unit) => (
                <Option key={unit} value={unit}>
                  {addS(parseInt(projectDetails.noticePeriodDuration ?? "") || 0, capitalizeWords(unit))}
                </Option>
              ))}
              </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Stack>
  );
}
