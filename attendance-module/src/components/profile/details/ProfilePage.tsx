import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "../../../providers/userContextProvider";

import { Stack } from "@mui/joy";
import PersonalInfoForm from "./PersonalInfoForm";
import AddressForm from "./AddressForm";
import BankDetailsForm from "./BankDetailsForm";
import EmergencyContactForm from "./EmergencyContactForm";
import { CommonCandidate, PermissionList } from "../../../types/common";
import { checkPermission } from "../../../utils/permission";

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

  return (
    <>
      <Stack
        spacing={2}
        sx={{
          display: "flex",
          maxWidth: "800px",
          mx: "auto",
        }}
      >
        <PersonalInfoForm
          candidateDetails={details}
          handleSubmit={handleSubmitHandler}
          canEdit={canEdit}
        />

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
