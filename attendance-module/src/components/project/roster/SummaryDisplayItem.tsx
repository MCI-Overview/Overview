import { Grid, Stack, Typography } from "@mui/joy";

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
    <Grid container>
      <Grid xs={11}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <div
            style={{
              height: "1rem",
              width: "1rem",
              backgroundColor: color,
            }}
          />
          <Typography fontFamily="sans-serif">{`${text}:  `}</Typography>
        </Stack>
      </Grid>
      <Grid xs={1}>
        <Typography>{`${count}`}</Typography>
      </Grid>
    </Grid>
  );
}
