import { Typography, Button } from "@mui/joy";
import { useUserContext } from "../../providers/userContextProvider";

export default function UserOnboarded() {
  const { updateUser } = useUserContext();

  return (
    <>
      <Typography>
        Your registration was successful, welcome to Overview!
      </Typography>
      <Button
        onClick={() => {
          updateUser();
        }}
      >
        Lets go!
      </Button>
    </>
  );
}
