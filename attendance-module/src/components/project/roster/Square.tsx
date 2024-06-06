import { CircularProgress, IconButton, Stack, Tooltip } from "@mui/joy";
import { useState } from "react";
import { CancelOutlined } from "@mui/icons-material";
import axios from "axios";
import { useProjectContext } from "../../../providers/projectContextProvider";

function ShiftTooltipDisplay({ date, shifts }) {
  const { project, updateProject } = useProjectContext();

  if (!project) return null;

  return (
    <Stack
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      {date.toString().slice(0, 10)}
      {shifts.map((shift) => (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div>
            {`${shift.shiftStartTime.format("HHmm")} -
            ${shift.shiftEndTime.format("HHmm")}`}
          </div>
          <IconButton
            size="sm"
            variant="soft"
            onClick={() =>
              axios
                .delete(`/api/admin/roster/${shift.shiftCuid}`)
                .then(() => updateProject())
            }
          >
            <CancelOutlined />
          </IconButton>
        </Stack>
      ))}
    </Stack>
  );
}

export default function Square({
  date,
  canDrop,
  didDrop,
  isOver,
  shifts,
  disabled,
  isDate,
}) {
  const tooltip = <ShiftTooltipDisplay date={date} shifts={shifts} />;
  const [hover, setHover] = useState(false);

  if ((disabled && isDate && isOver) || (!canDrop && isDate && isOver)) {
    return (
      <div
        style={{
          width: "100%",
          height: "2rem",
          backgroundColor: "red",
        }}
      />
    );
  }

  if (didDrop && isDate) {
    return (
      <div
        style={{
          width: "100%",
          height: "2rem",
          backgroundColor: "orange",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size="sm" />
      </div>
    );
  }

  if (disabled) {
    return (
      <div
        style={{
          width: "100%",
          height: "2rem",
          backgroundColor: "grey",
        }}
      />
    );
  }

  if (isOver && isDate) {
    return (
      <div
        style={{
          width: "100%",
          height: "2rem",
          backgroundColor: "green",
        }}
      />
    );
  }

  if (shifts && shifts.length > 0) {
    return (
      <Tooltip title={tooltip}>
        <div
          style={{
            width: "100%",
            height: "2rem",
            backgroundColor: "blue",
            borderRight: "1px solid rgba(99, 107, 116, 0.2)",
            transition: "border 0.3s ease-in-out",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={() => {
            setHover(true);
          }}
          onMouseLeave={() => {
            setHover(false);
          }}
        ></div>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltip}>
      <div
        style={{
          width: "100%",
          height: "2rem",
          borderRight: "1px solid rgba(99, 107, 116, 0.2)",
          transition: "border 0.3s ease-in-out",
        }}
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      />
    </Tooltip>
  );
}
