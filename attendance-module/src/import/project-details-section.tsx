import { useEffect, useState } from "react";
import axios from "axios";
import {
  ClientCompany,
  Location,
  MCICompany,
  ProjectData,
} from "../../types";

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

  const isImported = projectData.projectId ? true : false;

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

  return (
    <div>
      <h1>{projectData.projectId ? "Importing Project" : "New Project"}</h1>

      <label>Project Title </label>
      <input
        type="text"
        value={projectData.projectTitle}
        onChange={(e) =>
          setProjectData({ ...projectData, projectTitle: e.target.value })
        }
        disabled={isImported}
      />
      <br />

      <label>Employment by </label>
      <select
        value={projectData.employedBy}
        onChange={(e) =>
          setProjectData({ ...projectData, employedBy: MCICompany[e.target.value as keyof typeof MCICompany]})
        }
        disabled={isImported}
      >
        <option value="" disabled>
          Select:
        </option>
        {Object.values(MCICompany).map((company) => (
          <option value={company}>{company}</option>
        ))}
      </select>
      <br />

      <label>Client Company Name </label>
      <input
        type="text"
        list="clientCompanies"
        onPaste={(e) => e.preventDefault()}
      />
      <datalist id="clientCompanies">
        {clientCompanies.map((client) => (
          <option value={client.name} />
        ))}
      </datalist>
      <br />

      <label>Start date </label>
      <input
        type="date"
        value={projectData.startDate}
        onChange={(e) => setProjectData({ ...projectData, startDate: e.target.value })}
      />
      <br />

      <label>End date </label>
      <input
        type="date"
        value={projectData.endDate}
        onChange={(e) => setProjectData({ ...projectData, endDate: e.target.value })}
      />
      <br />

      <p>Locations </p>
      {locations.map((location) => (
        <p>
          {location.postalCode} - {location.address}
        </p>
      ))}

      <label>Add new location </label>
      <input
        type="text"
        placeholder="Postal code"
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
      />
      <button onClick={handleAddLocation}>Add</button>
    </div>
  );
};

export default ProjectDetailsSection;
