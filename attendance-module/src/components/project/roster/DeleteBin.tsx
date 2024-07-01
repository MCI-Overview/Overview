import { useDrop } from "react-dnd";
import axios, { AxiosError } from "axios";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { DraggableChipProps } from "../../../types";
import toast from "react-hot-toast";
import { Delete } from "@mui/icons-material";
import { Card, Tooltip, Typography } from "@mui/joy";

const DeleteBin = () => {
  const { updateProject } = useProjectContext();

  const [{ isOver }, drop] = useDrop({
    accept: "shift",
    drop: (item: DraggableChipProps) => {
      axios
        .delete("/api/admin/shift", { data: { shiftCuid: item.cuid } })
        .then((res) => {
          toast.success(res.data);
          updateProject();
        })
        .catch((error) => {
          const axiosError = error as AxiosError;

          if (axiosError.response) {
            toast.error(axiosError.response.data as string);
          } else {
            toast.error("Error while deleting shift. Please try again later.");
          }
        });
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
        size="sm"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed grey",
          transition: "background-color 0.5s ease",
          height: "100%",
        }}
      >
        <Typography level="body-xs" sx={{ color: "inherit" }}>
          <Delete />
        </Typography>
      </Card>
    </Tooltip>
  );
};

export default DeleteBin;
