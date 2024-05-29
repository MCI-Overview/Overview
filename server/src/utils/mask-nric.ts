function maskNRIC(nric: string): string {
  return nric.replace(/(\d{5})(\d{4})/, "*****$2");
}

export default maskNRIC;
