import toast from "react-hot-toast";
import { useState } from "react";
import isEqual from "../../../utils";
import { EmergencyContact } from "../../../types/common";

import {
  Autocomplete,
  Button,
  Card,
  CardActions,
  CardOverflow,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Typography,
} from "@mui/joy";

type EmergencyContactFormProps = {
  contact: EmergencyContact | undefined;
  handleSubmit: (
    data: object,
    successCallback: () => void,
    errorCallback: () => void
  ) => void;
  canEdit: boolean;
};

export default function EmergencyContactForm({
  contact,
  handleSubmit,
  canEdit,
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

  return (
    <Card>
      <Typography level="title-md">Emergency Contact</Typography>

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
              disabled={!canEdit}
            />
            {canEdit && (
              <FormHelperText>
                {!isNameValid && "Name cannot be empty."}
              </FormHelperText>
            )}
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
              disabled={!canEdit}
            />
            {canEdit && (
              <FormHelperText>
                {!isContactValid && "Contact number cannot be empty."}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid xs={2} sm={1}>
          <FormControl error={!isRelationshipValid}>
            <FormLabel>Relationship</FormLabel>
            <Autocomplete
              value={newContact.relationship || ""}
              options={RELATIONSHIPS}
              freeSolo
              onInputChange={(_e, value) => {
                setNewContact({
                  ...newContact,
                  relationship: value || "",
                });
              }}
              disabled={!canEdit}
            />
            {canEdit && (
              <FormHelperText>
                {!isRelationshipValid &&
                  !newContact.relationship &&
                  "Please select a relationship."}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>

      {canEdit && (
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
                isSame ||
                !isNameValid ||
                !isContactValid ||
                !isRelationshipValid
              }
            >
              Save
            </Button>
          </CardActions>
        </CardOverflow>
      )}
    </Card>
  );
}

const RELATIONSHIPS = [
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
];
