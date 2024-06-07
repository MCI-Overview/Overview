import { useUserContext } from "../../../providers/userContextProvider";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  FormLabel,
  Input,
  Stack,
} from "@mui/joy";
import { Address, BankDetails, EmergencyContact } from "../../../types/common";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

export type Candidate = {
  cuid: string;
  nric: string;
  contact: string;
  name: string;
  dateOfBirth: string;
  hasOnboarded: boolean;
  nationality?: string;
  bankDetails?: BankDetails;
  address?: Address;
  emergencyContact?: EmergencyContact;
};

interface CandidateDetailsProps {
  // candidateCuid: string;
}

const CandidateDetails = ({}: CandidateDetailsProps) => {
  const navigate = useNavigate();
  const { candidateCuid } = useParams();
  const { user } = useUserContext();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  if (!user) return null;

  useEffect(() => {
    if (user.userType === "Admin") {
      axios
        .get(`/api/admin/candidate/${candidateCuid}`)
        .then((response) => setCandidate(response.data))
        .catch(() => navigate("/admin/candidates"));
      return;
    } else if (user.userType === "User") {
      axios
        .get(`/api/user/candidate/${candidateCuid}`)
        .then((response) => setCandidate(response.data))
        .catch(() => navigate("/user"));
      return;
    }
    navigate("/login");
  }, [candidateCuid]);

  if (!candidate) return null;
  const isOwner = user.cuid !== candidate.cuid;

  const handleUpdateClick = () => {
    setIsUpdateMode(true);
  };

  const handleSubmitClick = () => {
    console.log(candidate);

    axios
      .patch("/api/admin/candidate", candidate)
      .then(() => {
        toast.success("Update successful");
        setIsUpdateMode(false);
      })
      .catch((error) => {
        toast.error("Update failed");
        console.log(error);
        setIsUpdateMode(false);
      });
  };

  return (
    <Stack
      spacing={1}
      sx={{
        display: "flex",
        maxWidth: "600px",
        mx: "auto",
        px: { xs: 2, md: 6 },
      }}
    >
      <Card>
        <CardContent>
          <FormLabel>Name</FormLabel>
          <Input
            type="text"
            value={candidate.name}
            disabled={!isUpdateMode}
            onChange={(e) =>
              setCandidate({
                ...candidate,
                name: e.target.value,
              })
            }
          />

          <FormLabel>NRIC</FormLabel>
          <Input value={candidate.nric} disabled />

          <FormLabel>Contact</FormLabel>
          <Input
            type="number"
            value={candidate.contact}
            disabled={!isUpdateMode}
            onChange={(e) =>
              setCandidate({
                ...candidate,
                contact: e.target.value,
              })
            }
          />

          <FormLabel>Date of Birth</FormLabel>
          <Input
            type="date"
            value={candidate.dateOfBirth.split("T")[0]}
            disabled={!isUpdateMode}
            onChange={(e) =>
              setCandidate({
                ...candidate,
                dateOfBirth: e.target.value,
              })
            }
          />

          {candidate.address && (
            <>
              <FormLabel>Address</FormLabel>
              {Object.entries(candidate.address).map(([key, value]) => {
                return (
                  <Box key={key} sx={{ display: "flex" }}>
                    <FormLabel sx={{ marginRight: 2 }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </FormLabel>
                    <Input
                      value={value}
                      disabled={!isUpdateMode}
                      onChange={(e) =>
                        setCandidate({
                          ...candidate,
                          address: {
                            ...candidate.address!,
                            [key]: e.target.value,
                          },
                        })
                      }
                    />
                  </Box>
                );
              })}
            </>
          )}

          {candidate.bankDetails && (
            <>
              <FormLabel>Bank Details</FormLabel>
              {Object.entries(candidate.bankDetails).map(([key, value]) => {
                return (
                  <Box key={key} sx={{ display: "flex" }}>
                    <FormLabel sx={{ marginRight: 2 }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </FormLabel>
                    <Input
                      value={value}
                      disabled={!isUpdateMode}
                      onChange={(e) =>
                        setCandidate({
                          ...candidate,
                          bankDetails: {
                            ...candidate.bankDetails!,
                            [key]: e.target.value,
                          },
                        })
                      }
                    />
                  </Box>
                );
              })}
            </>
          )}

          {candidate.emergencyContact && (
            <>
              <FormLabel>Emergency Contact</FormLabel>
              {Object.entries(candidate.emergencyContact).map(
                ([key, value]) => {
                  return (
                    <Box key={key} sx={{ display: "flex" }}>
                      <FormLabel sx={{ marginRight: 2 }}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </FormLabel>
                      <Input
                        value={value}
                        disabled={!isUpdateMode}
                        onChange={(e) =>
                          setCandidate({
                            ...candidate,
                            emergencyContact: {
                              ...candidate.emergencyContact!,
                              [key]: e.target.value,
                            },
                          })
                        }
                      />
                    </Box>
                  );
                }
              )}
            </>
          )}
        </CardContent>
        <CardActions hidden={!isOwner}>
          <Button
            onClick={isUpdateMode ? handleSubmitClick : handleUpdateClick}
          >
            {isUpdateMode ? "Submit" : "Update"}
          </Button>
        </CardActions>
      </Card>
    </Stack>
  );
};

export default CandidateDetails;
