import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "../../../providers/userContextProvider";

import { Stack } from "@mui/joy";
import PersonalInfo from "./PersonalInfo";
import AddressForm from "./AddressForm";
import BankDetailsForm from "./BankDetailsForm";
import EmergencyContactForm from "./EmergencyContactForm";
import { CommonCandidate } from "../../../types/common";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { candidateCuid } = useParams();
  const { user } = useUserContext();

  const [candidate, setCandidate] = useState<CommonCandidate | null>(null);

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

  return (
    <>
      <Stack
        spacing={4}
        sx={{
          display: "flex",
          maxWidth: "800px",
          mx: "auto",
        }}
      >
        <PersonalInfo
          candidateDetails={details}
          handleSubmit={handleSubmitHandler}
        />
        <AddressForm address={address} handleSubmit={handleSubmitHandler} />
        <BankDetailsForm
          bankdetails={bankDetails}
          handleSubmit={handleSubmitHandler}
        />
        <EmergencyContactForm
          contact={emergencyContact}
          handleSubmit={handleSubmitHandler}
        />
      </Stack>
    </>
  );
};

export default ProfilePage;
