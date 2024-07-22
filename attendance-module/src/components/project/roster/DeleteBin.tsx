import { useDrop } from "react-dnd";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

import { DraggableRosterChipProps } from "./DraggableRosterChip";
import { DraggableRosterProps } from "./DraggableRoster";
import { useRosterTableContext } from "../../../providers/rosterContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";

import { Delete } from "@mui/icons-material";
import { Card, Tooltip, Typography } from "@mui/joy";

const NewDeleteBin = () => {
  const { updateProject } = useProjectContext();
  const { updateRosterData } = useRosterTableContext();

  const [{ isOver }, drop] = useDrop({
    accept: ["shift", "roster"],
    drop: (item, monitor) => {
      const itemType = monitor.getItemType();
      if (itemType === "shift") {
        const itemData = item as DraggableRosterChipProps;
        axios
          .delete(`/api/admin/shift/${itemData.shiftCuid}`)
          .then((res) => {
            toast.success(res.data.message);
            updateProject();
          })
          .catch((error) => {
            const axiosError = error as AxiosError;

            if (axiosError.response) {
              toast.error(
                (
                  axiosError.response.data as {
                    message: string;
                  }
                ).message
              );
            } else {
              toast.error(
                "Error while deleting shift. Please try again later."
              );
            }
          });
      }

      if (itemType === "roster") {
        const itemData = item as DraggableRosterProps;
        axios
          .delete(`/api/admin/roster/${itemData.rosterCuid}`)
          .then((res) => {
            toast.success(res.data.message);
            updateRosterData();
          })
          .catch((error) => {
            const axiosError = error as AxiosError;

            if (axiosError.response) {
              toast.error(
                (
                  axiosError.response.data as {
                    message: string;
                  }
                ).message
              );
            } else {
              toast.error(
                "Error while deleting roster. Please try again later."
              );
            }
          });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
      item: monitor.getItem(),
    }),
  });

  return (
    <Tooltip title="Drop shift here to delete">
      <Card
        ref={drop}
        color="danger"
        variant={isOver ? "solid" : "soft"}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed grey",
          transition: "background-color 0.5s ease",
          height: "5rem",
          width: "100%",
        }}
      >
        <Typography level="body-xs" sx={{ color: "inherit" }}>
          <Delete />
        </Typography>
      </Card>
    </Tooltip>
  );
};

export default NewDeleteBin;
