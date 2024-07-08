import { Stack, Typography } from "@mui/joy";

export default function SummaryDisplayItem({
  color,
  text,
  count,
}: {
  color: string;
  text: string;
  count: number;
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      paddingX={1}
      justifyContent="space-between"
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <div
          style={{
            height: "1rem",
            width: "1rem",
            backgroundColor: color,
          }}
        />
        <Typography>{text}</Typography>
      </Stack>
      <Typography>{`: ${count}`}</Typography>
    </Stack>
  );
}
