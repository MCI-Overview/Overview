import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { useState } from "react";

import { RosterTableContextProvider } from "../../../providers/rosterContextProvider";
import ShiftDisplay from "./RosterSidebar";
import RosterTable from "./RosterTable";
import WeekPicker from "./WeekPicker";

import { Button, Modal, ModalClose, ModalDialog, Stack } from "@mui/joy";

export default function NewRosterPage() {
  const [editMode, setEditMode] = useState(false);

  return (
    <DndProvider backend={HTML5Backend}>
      <RosterTableContextProvider>
        {!editMode && (
          <Stack spacing={2}>
            <WeekPicker />
            <RosterTable type="ATTENDANCE" />
            <Button
              onClick={() => {
                setEditMode(true);
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
          }}
        >
          <ModalDialog layout="fullscreen">
            <ModalClose />
            <Stack direction="row" sx={{ display: "flex" }}>
              <ShiftDisplay />
              <Stack spacing={2} paddingLeft={2.25} paddingY={2.25}>
                <WeekPicker />
                <RosterTable type="ROSTER" />
              </Stack>
            </Stack>
          </ModalDialog>
        </Modal>
      </RosterTableContextProvider>
    </DndProvider>
  );
}
