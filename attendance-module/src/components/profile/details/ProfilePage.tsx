import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { checkPermission } from "../../../utils/permission";
import { CommonCandidate, PermissionList } from "../../../types/common";
import { useUserContext } from "../../../providers/userContextProvider";

import AddressForm from "./AddressForm";
import BankDetailsForm from "./BankDetailsForm";
import EmergencyContactForm from "./EmergencyContactForm";
import PersonalInfoForm from "./PersonalInfoForm";

import { Box, Stack, Typography } from "@mui/joy";
import {
  EditOffOutlined as EditOffIcon,
  ReportGmailerrorredOutlined as WarningIcon,
} from "@mui/icons-material";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { candidateCuid } = useParams();
  const { user } = useUserContext();

  const [candidate, setCandidate] = useState<CommonCandidate | null>(null);
  const [assignersAndClientHolders, setAssignersAndClientHolders] = useState<
    string[]
  >([]);

  useEffect(() => {
    if (!user) return;

    if (user.userType === "Admin") {
      axios
        .get(`/api/admin/candidate/${candidateCuid}`)
        .then((response) => {
          setCandidate(response.data);

          const { assignersAndClientHolders } = response.data;
          setAssignersAndClientHolders(assignersAndClientHolders);
        })
        .catch(() => navigate("/admin/candidates"));
      return;
    }

    if (user.userType === "User") {
      axios
        .get(`/api/user`)
        .then((response) => {
          setCandidate(response.data);
        })
        .catch(() => navigate("/user/profile"));
      return;
    }

    navigate("/");
  }, [candidateCuid, navigate, user]);

  if (!candidate) return null;
  if (!user) return null;

  const { address, bankDetails, emergencyContact, ...details } = candidate;

  async function handleSubmitHandler(
    data: object,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    const apiEndpoint =
      user?.userType === "Admin" ? "/api/admin/candidate" : "/api/user";

    axios
      .patch(apiEndpoint, { ...data, cuid: candidate?.cuid })
      .then(successCallback)
      .catch((error) => {
        errorCallback();
        console.log(error);
      });
  }

  let canEdit = false;
  if (user.userType === "Admin") {
    canEdit =
      checkPermission(user, PermissionList.CAN_UPDATE_CANDIDATES) ||
      assignersAndClientHolders.includes(user.cuid);
  } else {
    canEdit = user.cuid === candidate.cuid;
  }

  const hasReadCandidateDetailsPermission = checkPermission(
    user,
    PermissionList.CAN_READ_CANDIDATE_DETAILS
  );

  return (
    <>
      <Stack
        spacing={2}
        sx={{
          display: "flex",
          maxWidth: "800px",
          mx: "auto",
          my: 1,
        }}
      >
        <Box
          sx={{
            gap: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {!canEdit && (
            <Typography
              variant="soft"
              color="warning"
              level="title-sm"
              sx={{
                py: 1,
                borderRadius: 7,
                textAlign: "center",
              }}
            >
              <EditOffIcon /> You do not have permission to edit this profile.
            </Typography>
          )}

          {user.userType === "Admin" && !details.hasOnboarded && (
            <Typography
              variant="soft"
              color="danger"
              level="title-sm"
              sx={{
                textAlign: "center",
                py: 1,
                borderRadius: 7,
              }}
            >
              <WarningIcon /> Candidate has yet to complete the onboarding
              process. There may be missing information.
            </Typography>
          )}
        </Box>

        <PersonalInfoForm
          candidateDetails={details}
          handleSubmit={handleSubmitHandler}
          canEdit={canEdit}
        />

        {hasReadCandidateDetailsPermission && (
          <>
            <AddressForm
              address={address}
              handleSubmit={handleSubmitHandler}
              canEdit={canEdit}
            />

            <BankDetailsForm
              bankDetails={bankDetails}
              handleSubmit={handleSubmitHandler}
              canEdit={canEdit}
            />
          </>
        )}

        <EmergencyContactForm
          contact={emergencyContact}
          handleSubmit={handleSubmitHandler}
          canEdit={canEdit}
        />
      </Stack>
    </>
  );
};

export default ProfilePage;
