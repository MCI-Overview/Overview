import {
  Button,
  Autocomplete,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  ListItem,
  List,
  Grid,
  Stack,
  IconButton,
} from "@mui/joy";
import axios from "axios";
import { useState, useEffect } from "react";
import { CommonConsultant } from "../../../types/common";
import { DeleteRounded as DeleteIcon } from "@mui/icons-material";
import { useUserContext } from "../../../providers/userContextProvider";

export default function ProjectCandidateHoldersSection({
  candidateHolders,
  setCandidateHolders,
}: {
  candidateHolders: CommonConsultant[];
  setCandidateHolders: (candidateHolders: CommonConsultant[]) => void;
}) {
  const [consultantList, setConsultantList] = useState<CommonConsultant[]>([]);
  const [selectedConsultant, setSelectedConsultant] =
    useState<CommonConsultant | null>(null);
  const { user } = useUserContext();

  useEffect(() => {
    try {
      axios.get("/api/admin/consultants").then((response) => {
        setConsultantList(response.data);
      });
    } catch (error) {
      console.error("Error while fetching consultants", error);
    }
  }, []);

  function handleAddConsultant() {
    if (!selectedConsultant) {
      return;
    }

    setCandidateHolders([...candidateHolders, selectedConsultant]);
    setSelectedConsultant(null);
  }

  return (
    <>
      <Grid container sx={{ flexGrow: 1 }} xs={12}>
        <Grid
          xs={7}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ pr: 1 }}
        >
          <Autocomplete
            sx={{ flexGrow: 1 }}
            placeholder="Select a consultant"
            value={selectedConsultant}
            options={consultantList
              .filter((c) => c.cuid !== user?.cuid)
              .filter((c) => !candidateHolders.includes(c))}
            getOptionKey={(option) => option.cuid}
            getOptionLabel={(option) => `${option.name} - ${option.email}`}
            onChange={(_e, value) => {
              setSelectedConsultant(value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddConsultant();
              }
            }}
          />
        </Grid>
        <Grid xs={5} display="flex" justifyContent="center" alignItems="center">
          <Button sx={{ width: "100%" }} onClick={handleAddConsultant}>
            Add candidate holder
          </Button>
        </Grid>
      </Grid>
      <Accordion
        disabled={candidateHolders.length === 0}
        sx={{ paddingX: "0.75rem" }}
      >
        <AccordionSummary>
          {candidateHolders.length === 0
            ? "No candidate holder added"
            : `${candidateHolders.length} candidate holder${
                candidateHolders.length > 1 ? "s" : ""
              } added`}
        </AccordionSummary>
        <AccordionDetails>
          <List component="ol" marker="decimal">
            {candidateHolders.map((holder) => (
              <ListItem>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography>
                    {holder.name} - {holder.email}
                  </Typography>
                  <IconButton
                    onClick={() => {
                      setCandidateHolders(
                        candidateHolders.filter(
                          (currentHolder) => currentHolder.cuid !== holder.cuid
                        )
                      );
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
