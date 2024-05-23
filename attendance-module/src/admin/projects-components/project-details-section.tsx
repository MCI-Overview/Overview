import { useEffect, useState } from "react";
import axios from "axios";
import {
  ClientCompany,
  Location,
  MCICompany,
  ProjectData,
} from "../../types";

import {
  Stack,
  Input,
  FormLabel,
  Select,
  Option,
  Autocomplete,
  Button,

} from '@mui/joy'

interface ProjectDetailsSectionProps {
  projectData: ProjectData;
  setProjectData: (projectData: ProjectData) => void;
  locations: Location[];
  setLocations: (locations: Location[]) => void;
}

const ProjectDetailsSection = ({
  projectData,
  setProjectData,
  locations,
  setLocations,
}: ProjectDetailsSectionProps) => {
  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>([]);
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/admin/clients",
          { withCredentials: true }
        );
        setClientCompanies(response.data);
      } catch (error) {
        console.error("Error while fetching client companies", error);
      }
    };

    fetchClients();
  }, []);

  const [isUENPresent, setIsUENPresent] = useState<boolean>(false);
  const handleClientCompanyUENChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uen = e.target.value;
    const company = clientCompanies.find((client) => client.UEN === uen);
    if (company) {
      setProjectData({ ...projectData, clientCompanyName: company.name, clientCompanyUEN: uen });
      setIsUENPresent(true);
    } else {
      setProjectData({ ...projectData, clientCompanyUEN: uen });
      setIsUENPresent(false);
    }
  };

  const [postalCode, setPostalCode] = useState<string>("");
  const handleAddLocation = async () => {
    try {
      const response = await axios.get(
        `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postalCode}&returnGeom=Y&getAddrDetails=N`
      );

      if (response.data.found === 0) {
        console.error("Invalid postal code");
        return;
      }

      setLocations([
        ...locations,
        {
          postalCode: postalCode,
          address: response.data.results[0].SEARCHVAL,
          latitude: response.data.results[0].LATITUDE,
          longitude: response.data.results[0].LONGITUDE,
        },
      ]);
    } catch (error) {
      console.error("Error while fetching location data", error);
    }

    setPostalCode("");
  };

  const [validPostalCode, setValidPostalCode] = useState<boolean>(false);
  useEffect(() => {
    setValidPostalCode(/^\d{6}$/.test(postalCode)); // all numerical digits and length is 6
  }, [postalCode]);

  console.log(clientCompanies);

  return (
    <div>
      <Stack spacing={1}>
        <FormLabel>Project title</FormLabel>
        <Input
          placeholder=""
          value={projectData.projectTitle}
          onChange={(e) =>
            setProjectData({ ...projectData, projectTitle: e.target.value })
          }
          required
        />

        <FormLabel>Employment by</FormLabel>
        <Select
          placeholder="Select a company"
          required
          sx={{ minWidth: 200 }}
          value={projectData.employedBy}
        >
          {Object.values(MCICompany).map((company) => (
            <Option value={company}>{company}</Option>
          ))}
        </Select>

        <FormLabel>Client company UEN</FormLabel>
        <Autocomplete
          value={projectData.clientCompanyUEN}
          onSelect={handleClientCompanyUENChange}
          options={clientCompanies.map((company) => company.UEN)}
          getOptionLabel={(option) => option} // Display company name
          renderOption={(props, option) => (
            <li {...props}>
              {option}
            </li>
          )}
        />

        <FormLabel>Client company name</FormLabel>
        <Input
          disabled={isUENPresent}
          value={projectData.clientCompanyName}
          onChange={(e) =>
            setProjectData({ ...projectData, clientCompanyName: e.target.value })}

        />

        <FormLabel>Project start date</FormLabel>
        <Input type="date"
          value={projectData.startDate}
          onChange={(e) => setProjectData({ ...projectData, startDate: e.target.value })}
        />

        <FormLabel>Project end date</FormLabel>
        <Input type="date"
          value={projectData.endDate}
          onChange={(e) => setProjectData({ ...projectData, endDate: e.target.value })}
        />

        <FormLabel>Site locations</FormLabel>
        {locations.map((location) => (
          <p>
            {location.postalCode} - {location.address}
          </p>

        ))}
        <Input
          placeholder="Postal code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />

        <Button
          onClick={handleAddLocation}
          disabled={!validPostalCode}
        >
          Add
        </Button>

      </Stack>
    </div>
  );
};

export default ProjectDetailsSection;
