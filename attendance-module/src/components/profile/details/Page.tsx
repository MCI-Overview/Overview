import axios from "axios";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "../../../providers/userContextProvider";
import {
  CommonAddress,
  BankDetails,
  EmergencyContact,
} from "../../../types/common";

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Divider,
  FormLabel,
  Input,
  Stack,
  Typography,
} from "@mui/joy";

export type Candidate = {
  cuid: string;
  nric: string;
  contact: string;
  name: string;
  dateOfBirth: string;
  hasOnboarded: boolean;
  nationality?: string;
  bankDetails?: BankDetails;
  address?: CommonAddress;
  emergencyContact?: EmergencyContact;
};

const CandidateDetails = () => {
  const navigate = useNavigate();
  const { candidateCuid } = useParams();
  const { user } = useUserContext();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  const [isLanded, setIsLanded] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;

    if (user.userType === "Admin") {
      axios
        .get(`/api/admin/candidate/${candidateCuid}`)
        .then((response) => {
          setCandidate(response.data);
        })
        .catch(() => navigate("/admin/candidates"));
      return;
    } else if (user.userType === "User") {
      axios
        .get(`/api/user`)
        .then((response) => {
          setCandidate(response.data);
          if (response.data.address) {
            response.data.address.unit ? setIsLanded(false) : setIsLanded(true);
          } else {
            navigate("/user/new");
          }
        })
        .catch(() => navigate("/user/profile"));
      return;
    }
    navigate("/");
  }, [candidateCuid, navigate, user]);

  if (!candidate) return null;
  const isOwner = user?.cuid === candidate.cuid;

  if (isOwner && !candidate.hasOnboarded) {
    navigate("/user/new");
  }

  const handleUpdateClick = () => {
    setIsUpdateMode(true);
  };

  const handlePostalCodeChange = async (postalCode: string) => {
    setCandidate({
      ...candidate,
      address: {
        ...candidate.address!,
        postal: postalCode,
      },
    });

    if (postalCode.length !== 6) {
      return;
    }

    try {
      await axios
        .get(
          `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postalCode}&returnGeom=N&getAddrDetails=Y`,
          { withCredentials: false },
        )
        .then((res) => {
          setCandidate({
            ...candidate,
            address: {
              block: res.data.results[0].BLK_NO,
              building: res.data.results[0].BUILDING,
              floor: candidate.address!.floor,
              unit: candidate.address!.unit,
              street: res.data.results[0].ROAD_NAME,
              postal: postalCode,
              country: "Singapore",
            },
          });
        });
    } catch (error) {
      toast.error("Invalid postal code.");
      return;
    }
  };

  const handleSubmitClick = async () => {
    const apiEndpoint =
      user?.userType === "Admin" ? "/api/admin/candidate" : "/api/user";

    const errorMessage = verifyCandidateData(isLanded, candidate);
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    axios
      .patch(apiEndpoint, candidate)
      .then(() => {
        toast.success("Update successful");
      })
      .catch((error) => {
        toast.error("Update failed");
        console.log(error);
      })
      .finally(() => {
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
              <Divider sx={{ my: 1 }} />
              <Typography level="title-lg">Address</Typography>

              <FormLabel>Postal Code</FormLabel>
              <Input
                value={candidate.address!.postal}
                disabled={!isUpdateMode}
                onChange={(e) => handlePostalCodeChange(e.target.value)}
              />

              <Checkbox
                label="Landed property"
                checked={isLanded}
                onChange={() => {
                  setIsLanded(!isLanded);
                  setCandidate({
                    ...candidate,
                    address: {
                      ...candidate.address!,
                      floor: "",
                      unit: "",
                    },
                  });
                }}
                disabled={!isUpdateMode}
              />

              {!isLanded && (
                <>
                  <FormLabel>Floor</FormLabel>
                  <Input
                    value={candidate.address!.floor || ""}
                    disabled={!isUpdateMode || isLanded}
                    onChange={(e) =>
                      setCandidate({
                        ...candidate,
                        address: {
                          ...candidate.address!,
                          floor: e.target.value,
                        },
                      })
                    }
                  />

                  <FormLabel>Unit</FormLabel>
                  <Input
                    value={candidate.address!.unit || ""}
                    disabled={!isUpdateMode || isLanded}
                    onChange={(e) =>
                      setCandidate({
                        ...candidate,
                        address: {
                          ...candidate.address!,
                          unit: e.target.value,
                        },
                      })
                    }
                  />
                </>
              )}
            </>
          )}

          {candidate.bankDetails && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography level="title-lg">Bank Details</Typography>
              {Object.entries(candidate.bankDetails).map(([key, value]) => {
                return (
                  <Box key={key}>
                    <FormLabel>
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
              <Divider sx={{ my: 1 }} />
              <Typography level="title-lg">Emergency Contact</Typography>
              {Object.entries(candidate.emergencyContact).map(
                ([key, value]) => {
                  return (
                    <Box key={key}>
                      <FormLabel>
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
                },
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

const verifyCandidateData = (isLanded: boolean, candidate: Candidate) => {
  if (!candidate.name) {
    return "Name cannot be empty.";
  }

  if (!candidate.contact) {
    return "Contact cannot be empty.";
  }

  if (!candidate.dateOfBirth) {
    return "Date of Birth cannot be empty.";
  }

  if (!candidate.address) {
    return "Address fields cannot be empty.";
  }

  for (const [key, value] of Object.entries(candidate.address)) {
    if (isLanded && ["floor", "unit"].includes(key)) {
      continue;
    }

    if (!value) {
      return `Address ${key} cannot be empty.`;
    }
  }

  if (!candidate.bankDetails) {
    return "Bank Details fields cannot be empty.";
  }

  for (const [key, value] of Object.entries(candidate.bankDetails)) {
    if (!value) {
      return `Bank Details ${key} cannot be empty.`;
    }
  }

  if (!candidate.emergencyContact) {
    return "Emergency Contact fields cannot be empty.";
  }

  for (const [key, value] of Object.entries(candidate.emergencyContact)) {
    if (!value) {
      return `Emergency Contact ${key} cannot be empty.`;
    }
  }

  // TODO: Incomplete, add more validation checks

  return "";
};

export default CandidateDetails;
