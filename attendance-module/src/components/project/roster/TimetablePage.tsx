import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { useEffect, useState } from "react";

import {
  RosterContextProvider,
  useRosterTableContext,
} from "../../../providers/rosterContextProvider";
import ShiftDisplay from "./RosterSidebar";
import RosterTable from "./RosterTable";
import { store } from "../../../store";

import { Button, Modal, ModalClose, ModalDialog, Stack } from "@mui/joy";
import axios from "axios";

function PageComponent() {
  const [editMode, setEditMode] = useState(false);
  const { setShowAttendance } = useRosterTableContext();

  return (
    <>
      {!editMode && (
        <Stack spacing={2}>
          <RosterTable viewOnly key="rosterTable" size="md" />
          <Button
            onClick={() => {
              setEditMode(true);
              setShowAttendance(false);
            }}
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
              width: "5rem",
            }}
          >
            Edit
          </Button>
        </Stack>
      )}
      <Modal
        open={editMode}
        onClose={() => {
          setEditMode(false);
          setShowAttendance(true);
        }}
      >
        <ModalDialog layout="fullscreen">
          <ModalClose />
          <Stack direction="row" sx={{ display: "flex" }}>
            <ShiftDisplay />
            <Stack spacing={2} paddingLeft={2.25} paddingY={2.25}>
              <RosterTable key="rosterTable" size="lg" />
            </Stack>
          </Stack>
        </ModalDialog>
      </Modal>
    </>
  );
}

export default function NewRosterPage() {
  useEffect(() => {
    axios.get("/api/public-holidays").then((response) => {
      const holidays = response.data;

      store.setState((state) => ({
        ...state,
        publicHolidays: holidays,
      }));
    });
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <RosterContextProvider>
        <PageComponent />
      </RosterContextProvider>
    </DndProvider>
  );
}
