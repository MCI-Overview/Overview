import { ReactElement } from "react";
import {
  AspectRatio,
  Box,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Typography,
  CardProps,
} from "@mui/joy";
import {
  CheckRounded as CheckIcon,
  InsertDriveFileRounded as InsertDriveFileIcon,
  RemoveCircleOutlineRounded as RemoveCircleOutlineIcon,
} from "@mui/icons-material";

export default function FileUpload(
  props: CardProps & {
    icon?: ReactElement;
    fileName: string;
    fileSize: string;
    progress: number;
  },
) {
  const { icon, fileName, fileSize, progress, sx, ...other } = props;
  return (
    <Card
      variant="outlined"
      orientation="horizontal"
      {...other}
      sx={[
        {
          gap: 1.5,
          alignItems: "flex-start",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <AspectRatio
        ratio="1"
        variant="soft"
        color="neutral"
        sx={{
          minWidth: 32,
          borderRadius: "50%",
          "--Icon-fontSize": "16px",
        }}
      >
        <div>{icon ?? <InsertDriveFileIcon />}</div>
      </AspectRatio>
      <CardContent>
        <Typography fontSize="sm">{fileName}</Typography>
        <Typography level="body-xs">{fileSize}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LinearProgress
            color="neutral"
            value={progress}
            determinate
            sx={[
              {
                ...(progress >= 100 && {
                  color: "var(--joy-palette-success-solidBg)",
                }),
              },
            ]}
          />
          <Typography fontSize="xs">{progress}%</Typography>
        </Box>
      </CardContent>
      {progress >= 100 ? (
        <AspectRatio
          ratio="1"
          variant="solid"
          color="success"
          sx={{
            minWidth: 20,
            borderRadius: "50%",
            "--Icon-fontSize": "14px",
          }}
        >
          <div>
            <CheckIcon />
          </div>
        </AspectRatio>
      ) : (
        <IconButton
          variant="plain"
          color="danger"
          size="sm"
          sx={{ mt: -1, mr: -1 }}
        >
          <RemoveCircleOutlineIcon />
        </IconButton>
      )}
    </Card>
  );
}
