export type ProjectData = {
  projectId: string | undefined;
  projectTitle: string;
  email: string;
  clientCompanyName: string;
  employedBy: MCICompany | undefined;
  startDate: string;
  endDate: string;
  candidates: CandidateData[];
};

export type CandidateData = {
  nric: string;
  name: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  candidateHolder: string;
};

export type Location = {
  postalCode: string;
  address: string;
  latitude: string;
  longitude: string;
};

export type ClientCompany = {
  id: string;
  name: string;
};

export type CandidateHolder = {
  email: string;
  name: string;
};

export enum MCICompany {
  MCI_CAREER_SERVICES = "MCI Career Services Pte Ltd",
  MCI_OUTSOURCING = "MCI Outsourcing Pte Ltd"
}
