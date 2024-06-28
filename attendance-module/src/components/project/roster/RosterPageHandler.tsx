import RosterPage from "./RosterPage";
import RosterPageM from "./RosterPageM";
import RosterPageS from "./RosterPageS";
import { Grid } from "@mui/joy";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function RosterPageHandler() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Grid
        sx={{
          display: {
            xs: "block",
            sm: "none",
            md: "none",
          },
        }}
      >
        <RosterPageS />
      </Grid>

      <Grid
        sx={{
          display: {
            xs: "none",
            sm: "block",
            md: "none",
          },
        }}
      >
        <RosterPageM />
      </Grid>

      <Grid
        sx={{
          display: {
            xs: "none",
            sm: "none",
            md: "block",
          },
        }}
      >
        <RosterPage />
      </Grid>
    </DndProvider>
  );
}
