import {
  Card,
  Box,
  Typography,
  Divider,
  Grid,
  FormControl,
  FormLabel,
  Input,
  CardOverflow,
  CardActions,
  Button,
  FormHelperText,
  Autocomplete,
} from "@mui/joy";
import { EmergencyContact } from "../../../types/common";
import { useState } from "react";
import isEqual from "../../../utils";
import toast from "react-hot-toast";

type EmergencyContactFormProps = {
  contact: EmergencyContact | undefined;
  handleSubmit: (
    data: object,
    successCallback: () => void,
    errorCallback: () => void
  ) => void;
};

export default function EmergencyContactForm({
  contact,
  handleSubmit,
}: EmergencyContactFormProps) {
  const [oldContact, setOldContact] = useState<EmergencyContact>(
    contact || {
      name: "",
      contact: "",
      relationship: "",
    }
  );
  const [newContact, setNewContact] = useState<EmergencyContact>(oldContact);

  const isSame = isEqual(oldContact, newContact);

  const isNameValid = newContact.name && newContact.name.length > 0;
  const isContactValid = newContact.contact && newContact.contact.length > 0;
  const isRelationshipValid =
    newContact.relationship && newContact.relationship.length > 0;

  const [relationship, setRelationship] = useState<string | null>(null);

  return (
    <Card>
      <Box sx={{ mb: 1 }}>
        <Typography level="title-md">Emergency Contact</Typography>
        <Typography level="body-sm">
          Update your emergency contact here.
        </Typography>
      </Box>
      <Divider />
      <Grid container columns={2} spacing={2}>
        <Grid xs={2} sm={1}>
          <FormControl error={!isNameValid}>
            <FormLabel>Name</FormLabel>
            <Input
              value={newContact.name || ""}
              onChange={(e) =>
                setNewContact({ ...newContact, name: e.target.value })
              }
            />
            <FormHelperText>
              {!isNameValid && "Name cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={2} sm={1}>
          <FormControl error={!isContactValid}>
            <FormLabel>Contact Number</FormLabel>
            <Input
              value={newContact.contact || ""}
              type="number"
              onChange={(e) =>
                setNewContact({ ...newContact, contact: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "-") {
                  e.preventDefault();
                }
              }}
            />
            <FormHelperText>
              {!isContactValid && "Contact number cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={2} sm={1}>
          <FormControl error={!isRelationshipValid && !relationship}>
            <FormLabel>Relationship</FormLabel>
            <Autocomplete
              value={relationship || ""}
              options={[
                "Mother",
                "Father",
                "Daughter",
                "Son",
                "Sister",
                "Brother",
                "Aunt",
                "Uncle",
                "Niece",
                "Nephew",
                "Cousin (Female)",
                "Cousin (Male)",
                "Grandmother",
                "Grandfather",
                "Granddaughter",
                "Grandson",
                "Stepsister",
                "Stepbrother",
                "Stepmother",
                "Stepfather",
                "Others",
              ]}
              onChange={(_e, value) => {
                setRelationship(value);
                setNewContact({
                  ...newContact,
                  relationship: "",
                });

                if (value !== "Others") {
                  setNewContact({
                    ...newContact,
                    relationship: value || "",
                  });
                }
              }}
            />
            <FormHelperText>
              {!isRelationshipValid &&
                !relationship &&
                "Please select a relationship."}
            </FormHelperText>
          </FormControl>
        </Grid>
        {relationship === "Others" && (
          <Grid xs={2} sm={1}>
            <FormControl error={!isRelationshipValid}>
              <FormLabel>Custom Relationship</FormLabel>
              <Input
                value={newContact.relationship || ""}
                onChange={(e) =>
                  setNewContact({ ...newContact, relationship: e.target.value })
                }
              />
              <FormHelperText>
                {!isRelationshipValid && "Please specify a relationship."}
              </FormHelperText>
            </FormControl>
          </Grid>
        )}
      </Grid>
      <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
        <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => setNewContact(oldContact)}
            disabled={isSame}
          >
            Reset
          </Button>
          <Button
            size="sm"
            variant="solid"
            onClick={() =>
              handleSubmit(
                { emergencyContact: newContact },
                () => {
                  setOldContact(newContact);
                  toast.success("Emergency contact updated successfully.");
                },
                () => {
                  toast.error("Failed to update emergency contact.");
                }
              )
            }
            disabled={
              isSame || !isNameValid || !isContactValid || !isRelationshipValid
            }
          >
            Save
          </Button>
        </CardActions>
      </CardOverflow>
    </Card>
  );
}
