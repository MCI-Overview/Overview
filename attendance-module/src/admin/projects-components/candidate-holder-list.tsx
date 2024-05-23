import { useState } from "react";
import { CandidateHolder } from "@/types"; // Ensure this path is correct

import {
  Stack,
  FormLabel,
  Select,
  Option,
  Button,
  Autocomplete
} from '@mui/joy'

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
      <Stack spacing={1}>
        <FormLabel>Add candidate holders</FormLabel>
        {candidateHolders.map((cddHolder) => (
          <p key={cddHolder.email}> {cddHolder.name} - {cddHolder.email} </p>
        ))}

        <Select value={newHolder} onChange={(e) => setNewHolder((e.target as HTMLSelectElement).value)}>
          <Option value="" disabled>
            Select:
          </Option>
          {availableConsultants
            .filter(
              (consultant) =>
                !candidateHolders.some(
                  (candidate) => candidate.email === consultant.email
                )
            )
            .map((cddHolder) => (
              <Option key={cddHolder.email} value={cddHolder.email}>
                {cddHolder.name} - {cddHolder.email}
              </Option>
            ))}
        </Select>
        <Button
          disabled={!newHolder}
          onClick={() => {
            handleAddCandidateHolder(newHolder);
            setNewHolder("");
          }}
        >
          Add
        </Button>
      </Stack>
    </div>
  );
};

export default CandidateHolderList;