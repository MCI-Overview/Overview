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
  IconButton,
  Card,
  CardContent,
  Avatar,
  Stack,
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
          xs={12}
          sm={7}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ pr: { sm: 2 } }}
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
        <Grid
          sm={5}
          xs={12}
          sx={{ pt: { xs: 2, sm: 0 } }}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Button sx={{ width: "100%" }} onClick={handleAddConsultant}>
            Add collaborators
          </Button>
        </Grid>
      </Grid>
      <Accordion
        disabled={candidateHolders.length === 0}
        sx={{ paddingX: "0.75rem" }}
      >
        <AccordionSummary>
          {candidateHolders.length === 0
            ? "No collaborators added"
            : `${candidateHolders.length} candidate holder${
                candidateHolders.length > 1 ? "s" : ""
              } added`}
        </AccordionSummary>
        <AccordionDetails>
          <List component="ol">
            {candidateHolders.map((holder) => (
              <ListItem>
                <Card
                  variant="outlined"
                  orientation="horizontal"
                  sx={{
                    width: "100%",
                    "&:hover": {
                      boxShadow: "md",
                      borderColor: "neutral.outlinedHoverBorder",
                    },
                  }}
                >
                  <CardContent>
                    <Grid container alignItems="center">
                      <Grid xs>
                        <Stack direction="row" gap={2} alignItems="center">
                          <Avatar>{holder.name.substring(0, 1)}</Avatar>
                          <Stack>
                            <Typography level="body-lg" id="card-description">
                              {holder.name}
                            </Typography>
                            <Typography
                              level="body-sm"
                              aria-describedby="card-description"
                              mb={1}
                            >
                              {holder.email}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid>
                        <IconButton
                          onClick={() => {
                            setCandidateHolders(
                              candidateHolders.filter(
                                (currentHolder) =>
                                  currentHolder.cuid !== holder.cuid,
                              ),
                            );
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
