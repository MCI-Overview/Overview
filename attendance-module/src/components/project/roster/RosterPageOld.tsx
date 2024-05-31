import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Card, IconButton, Stack, Grid, Typography, Box } from "@mui/joy";
import moment from "moment";
import { capitalizeWords } from "../../../utils/capitalize";
import { useCallback, useState, useEffect } from "react";
import { Dustbin } from "../assign/Dustbin";
import { ItemTypes } from "../assign/ItemTypes";
import Example from "../assign/example";

const NAMES = ["Alice", "Bob", "Charlie", "David", "Eve"]; // Example names

function getWeekRange(weekOffset: number): moment.Moment[] {
  const startOfWeek = moment().startOf("isoWeek").add(weekOffset, "weeks");
  return Array.from({ length: 14 }, (_, i) =>
    startOfWeek.clone().add(i, "days"),
  );
}

interface DroppedItem {
  name: string;
  personName: string;
  date: string;
}

interface PersonState {
  [key: string]: DroppedItem[];
}

export default function Timetable() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<PersonState>({});

  useEffect(() => {
    console.log("Slots state:", slots);
  }, [slots]);

  const handleNextWeeks = () => setWeekOffset((prev) => prev + 2);
  const handlePrevWeeks = () => setWeekOffset((prev) => prev - 2);

  const currentWeekRange = getWeekRange(weekOffset);

  const handleDrop = useCallback(
    (name: string, date: string, item: { name: string } | null) => {
      setSlots((prevSlots) => {
        const newSlots = { ...prevSlots };
        const personSlots = newSlots[name] || [];

        if (item === null) {
          // Remove the slot if item is null
          newSlots[name] = personSlots.filter((slot) => slot.date !== date);
        } else {
          const existingSlotIndex = personSlots.findIndex(
            (slot) => slot.date === date,
          );

          if (existingSlotIndex !== -1) {
            // Update existing slot
            personSlots[existingSlotIndex] = {
              ...item,
              personName: name,
              date,
            };
          } else {
            // Add new slot
            personSlots.push({ ...item, personName: name, date });
          }

          newSlots[name] = personSlots;
        }

        return newSlots;
      });
    },
    [],
  );

  return (
    <Card>
      <Stack
        spacing={0}
        sx={{
          "--Grid-borderWidth": "1px",
          borderTop: "var(--Grid-borderWidth) solid",
          borderLeft: "var(--Grid-borderWidth) solid",
          borderColor: "divider",
          "& > div": {
            borderRight: "var(--Grid-borderWidth) solid",
            borderBottom: "var(--Grid-borderWidth) solid",
            borderColor: "divider",
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <IconButton onClick={handlePrevWeeks}>
            <ChevronLeft />
          </IconButton>
          <Typography level="h4">Timetable</Typography>
          <IconButton onClick={handleNextWeeks}>
            <ChevronRight />
          </IconButton>
        </Stack>
        <Grid container spacing={0}>
          <Grid xs={2}>
            <Box />
          </Grid>
          {currentWeekRange.map((date, index) => (
            <Grid xs key={index}>
              <Typography textAlign="center">{date.format("MM/DD")}</Typography>
              <Typography textAlign="center">
                {capitalizeWords(date.format("ddd"))}
              </Typography>
            </Grid>
          ))}
        </Grid>
        {NAMES.map((name, nameIndex) => (
          <Grid container key={nameIndex} spacing={0}>
            <Grid xs={2}>
              <Typography textAlign="center">{name}</Typography>
            </Grid>
            {currentWeekRange.map((date, dateIndex) => {
              const slot = slots[name]?.find(
                (slot) => slot.date === date.format("MM/DD"),
              );
              return (
                <Grid xs key={dateIndex}>
                  <Dustbin
                    accept={[ItemTypes.GLASS, ItemTypes.PAPER, ItemTypes.FOOD]}
                    lastDroppedItem={slot || null}
                    onDrop={(item) =>
                      handleDrop(name, date.format("MM/DD"), item)
                    }
                    name={name}
                    date={date.format("MM/DD")}
                  />
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Stack>
      <Example />
    </Card>
  );
}
