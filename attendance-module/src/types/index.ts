export type ProjectDetails = {
  name: string | null;
  clientUEN: string | null;
  clientName: string | null;
  employmentBy: MCICompany | null;
  startDate: Date | null;
  endDate: Date | null;
};

export type Location = {
  postalCode: string;
  address: string;
  latitude: string;
  longitude: string;
};

export type ClientCompany = {
  UEN: string;
  name: string;
};

export type Consultant = {
  email: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
  isUser?: boolean;
  isAdmin?: boolean;
};

export type Client = {
  UEN: string;
  name: string;
};

export type Manage = {
  role: "CLIENT_HOLDER" | "CANDIDATE_HOLDER";
  consultantEmail: string;
  projectId: string;
};

export type Project = {
  id: string;
  name: string;
  clientUEN: string;
  locations: Location[];
  createdAt: string;
  startDate: string;
  endDate: string;
  employmentBy: MCICompany;
  status: string;
  Client: Client;
  Manage: Manage[];
};

export enum MCICompany {
  MCI_CAREER_SERVICES = "MCI Career Services Pte Ltd",
  MCI_OUTSOURCING = "MCI Outsourcing Pte Ltd",
}
