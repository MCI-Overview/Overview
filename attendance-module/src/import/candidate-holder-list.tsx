import { useState } from "react";
import { CandidateHolder, CandidateData } from "../../types";

const candidateInfoHeader = ["NRIC", "Name", "Mobile Number"];

interface CandidateHolderListProps {
  candidateList: CandidateData[];
  availableConsultants: CandidateHolder[];
  candidateHolders: CandidateHolder[];
  handleAddCandidateHolder: (email: string) => void;
}

const CandidateHolderList = ({
  candidateList,
  availableConsultants,
  candidateHolders,
  handleAddCandidateHolder,
}: CandidateHolderListProps) => {
  const [newHolder, setNewHolder] = useState<string>("");

  return (
    <div>
      <h2> Candidate Holders </h2>
      {candidateHolders.map((cddHolder) => (
        <div>
          <h3>
            {cddHolder.name} - {cddHolder.email} :{" "}
            {
              candidateList.filter(
                (cdd) => cdd.candidateHolder === cddHolder.email
              ).length
            }
          </h3>
          <table>
            <thead>
              <tr>
                {candidateInfoHeader.map((header) => (
                  <th key={header}> {header} </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidateList
                .filter((cdd) => cdd.candidateHolder === cddHolder.email)
                .map((cdd) => (
                  <tr key={cdd.nric}>
                    <td> {cdd.nric} </td>
                    <td> {cdd.name} </td>
                    <td> {cdd.mobileNumber} </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}

      <h3>Add candidate holder:</h3>
      <select value={newHolder} onChange={(e) => setNewHolder(e.target.value)}>
        <option value="" disabled>
          Select:
        </option>
        {availableConsultants
          .filter(
            (consultant) =>
              !candidateHolders.some(
                (candidate) => candidate.email === consultant.email
              )
          )
          .map((cddHolder) => (
            <option key={cddHolder.email} value={cddHolder.email}>
              {cddHolder.name} - {cddHolder.email}
            </option>
          ))}
      </select>
      <button
        disabled={!newHolder}
        onClick={() => {
          handleAddCandidateHolder(newHolder);
          setNewHolder("");
        }}
      >
        Add
      </button>
    </div>
  );
};

export default CandidateHolderList;
