import { Stack, Avatar, Typography } from "@mui/joy";
import { CommonConsultant } from "../../../types/common";
import { useConsultantsContext } from "../../../providers/consultantsContextProvider";
import { useUserContext } from "../../../providers/userContextProvider";
import { Face6Rounded as FaceIcon } from "@mui/icons-material";

export default function ConsultantDisplay({
  cuid,
  variant,
}: {
  cuid: string;
  variant?: "SMALL" | "LARGE";
}) {
  const { consultants } = useConsultantsContext();
  const { user } = useUserContext();

  if (!consultants || !user) return null;

  const isUser = user.cuid === cuid;

  const consultant = consultants.find((c) => c.cuid === cuid);
  const { name, email, contact } = consultant as CommonConsultant;

  if (variant === "SMALL") {
    return (
      <Stack
        direction="row"
        gap={2}
        sx={{
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        <Avatar>{isUser ? <FaceIcon /> : name.substring(0, 1)}</Avatar>
        <Stack>
          <Typography level="title-sm">{isUser ? "You" : name}</Typography>
          {!isUser && (
            <Stack>
              <Typography level="body-xs">{email}</Typography>
              {contact && <Typography level="body-xs">{contact}</Typography>}
            </Stack>
          )}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      gap={2}
      sx={{
        alignItems: "center",
        justifyItems: "center",
      }}
    >
      <Avatar>{isUser ? <FaceIcon /> : name.substring(0, 1)}</Avatar>
      <Stack>
        <Typography level="title-sm">{isUser ? "You" : name}</Typography>
        <Typography level="body-xs">{consultant?.designation}</Typography>
        {!isUser && (
          <Stack direction="row" gap={1}>
            <Typography level="body-xs">{email}</Typography>
            {contact && (
              <Stack direction="row" gap={1}>
                <Typography level="body-xs">•</Typography>
                <Typography level="body-xs">{contact}</Typography>
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
