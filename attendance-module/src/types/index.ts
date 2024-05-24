export type ProjectDetails = {
  name: string | null;
  clientUEN: string | null;
  clientName: string | null;
  employmentBy: MCICompany | null;
  startDate: Date | null;
  endDate: Date | null;
};

export type CandidateData = {
  nric: Date | null;
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

export enum MCICompany {
  MCI_CAREER_SERVICES = "MCI Career Services Pte Ltd",
  MCI_OUTSOURCING = "MCI Outsourcing Pte Ltd",
}
