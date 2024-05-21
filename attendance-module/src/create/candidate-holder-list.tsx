import { useState } from "react";
import { CandidateHolder } from "../types";

interface CandidateHolderListProps {
  availableConsultants: CandidateHolder[];
  candidateHolders: CandidateHolder[];
  handleAddCandidateHolder: (email: string) => void;
}

const CandidateHolderList = ({
  availableConsultants,
  candidateHolders,
  handleAddCandidateHolder,
}: CandidateHolderListProps) => {
  const [newHolder, setNewHolder] = useState<string>("");

  return (
    <div>
      <h2> Candidate Holders </h2>
      {candidateHolders.map((cddHolder) => (
        <p> {cddHolder.name} - {cddHolder.email} </p>
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
