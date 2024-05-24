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
import { ClientCompany, MCICompany, ProjectDetails } from "../../../types";
import axios from "axios";
import { useState, useEffect, SyntheticEvent, useRef } from "react";

export default function ProjectDetailsSection({
  projectDetails,
  setProjectDetails,
}: {
  projectDetails: ProjectDetails;
  setProjectDetails: (projectDetails: ProjectDetails) => void;
}) {
  const [clientList, setClientList] = useState<ClientCompany[]>([]);
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

    const client = clientList.find((c) => c.UEN === inputUEN);
    if (client) {
      setProjectDetails({
        ...projectDetails,
        clientUEN: client.UEN,
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
              employmentBy: value as MCICompany,
            });
          }}
        >
          <Option value={MCICompany.MCI_CAREER_SERVICES}>
            MCI Career Services Pte Ltd
          </Option>
          <Option value={MCICompany.MCI_OUTSOURCING}>
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
                label: c.UEN,
                value: c.UEN,
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
    </Stack>
  );
}
