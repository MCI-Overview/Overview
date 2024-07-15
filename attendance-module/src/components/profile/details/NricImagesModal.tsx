import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useUserContext } from "../../../providers/userContextProvider";

import {
  Box,
  Divider,
  Modal,
  ModalDialog,
  ModalOverflow,
  Typography,
} from "@mui/joy";

interface NricImagesModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  candidateCuid: string;
}

const NricImagesModal = ({
  isOpen,
  setIsOpen,
  candidateCuid,
}: NricImagesModalProps) => {
  const { user } = useUserContext();
  const [nricFrontData, setNricFrontData] = useState<string | undefined>(
    undefined
  );
  const [nricBackData, setNricBackData] = useState<string | undefined>(
    undefined
  );

  const handleGetNricData = async () => {
    if (!user) return;

    const startOfURL =
      user.userType === "Admin"
        ? `/api/admin/candidate/${candidateCuid}`
        : "/api/user";

    try {
      axios
        .get(`${startOfURL}/nric/front`, {
          responseType: "blob",
        })
        .then((response) => {
          const reader = new FileReader();
          reader.readAsDataURL(response.data);
          reader.onload = () => {
            setNricFrontData(reader.result as string);
          };
        });
    } catch (error) {
      toast.error("Unable to fetch NRIC front");
      console.error("Error while fetching NRIC front data", error);
    }

    try {
      axios
        .get(`${startOfURL}/nric/back`, {
          responseType: "blob",
        })
        .then((response) => {
          const reader = new FileReader();
          reader.readAsDataURL(response.data);
          reader.onload = () => {
            setNricBackData(reader.result as string);
          };
        });
    } catch (error) {
      toast.error("Unable to fetch NRIC back");
      console.error("Error while fetching NRIC back data", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleGetNricData();
    }
  });

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverflow>
        <ModalDialog>
          <Box sx={{ maxWidth: "600px" }}>
            <Typography level="title-md">NRIC Front</Typography>
            <img
              src={nricFrontData}
              alt="NRIC front"
              style={{ width: "100%" }}
            />

            <Divider sx={{ my: 1 }} />

            <Typography level="title-md">NRIC Back</Typography>
            <img src={nricBackData} alt="NRIC back" style={{ width: "100%" }} />
          </Box>
        </ModalDialog>
      </ModalOverflow>
    </Modal>
  );
};

export default NricImagesModal;
