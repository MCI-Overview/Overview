import axios from "axios";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import LoadingRequestButton from "../../components/LoadingRequestButton";

import {
  FormControl,
  FormLabel,
  Select,
  Option,
  Input,
  Textarea,
  Grid,
  Autocomplete,
  Sheet,
} from "@mui/joy";

export default function ClaimForm({
  setIsOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [type, setType] = useState("MEDICAL");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [projectCuid, setProjectCuid] = useState("");
  const [rosterCuid, setRosterCuid] = useState("");

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState("");

  const [claimableShifts, setClaimableShifts] = useState<
    Record<
      string,
      {
        name: string;
        shifts: {
          cuid: string;
          shiftType: string;
          shiftDate: string;
          Shift: {
            startTime: string;
            halfDayStartTime: string;
          };
        }[];
      }
    >
  >({});

  useEffect(() => {
    axios.get("/api/user/claimableShifts").then((response) => {
      setClaimableShifts(response.data);
    });
  }, []);

  const handleReceiptFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setReceiptFile(selectedFile);

      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }

      const previewURL = URL.createObjectURL(selectedFile);
      setReceiptPreview(previewURL);
    }
  };

  const handleClaimSubmit = async () => {
    const formData = new FormData();
    formData.append("projectCuid", projectCuid);
    formData.append("type", type);
    formData.append("description", description);
    formData.append("amount", amount.toString());
    formData.append("rosterCuid", rosterCuid);
    formData.append("receipt", receiptFile!);

    try {
      const response = await axios.post(`/api/user/request/claim`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setIsOpen(false);
        toast.success("Claim submitted successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occured while submitting your claim");
    }
  };

  return (
    <>
      <Grid container columns={2} spacing={2}>
        <Grid xs={1}>
          <FormControl>
            <FormLabel>Type</FormLabel>
            <Select
              defaultValue={type}
              onChange={(_e, value) => {
                setType(value || "");
              }}
            >
              <Option value="MEDICAL">Medical</Option>
              <Option value="TRANSPORT">Transport</Option>
              <Option value="OTHERS">Others</Option>
            </Select>
          </FormControl>
        </Grid>
        <Grid xs={1}>
          <FormControl>
            <FormLabel>Amount</FormLabel>
            <Input
              type="number"
              defaultValue={0}
              onChange={(e) => {
                setAmount(parseFloat(e.target.value));
              }}
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "-") {
                  e.preventDefault();
                }
              }}
              slotProps={{
                input: {
                  min: "0",
                  step: "0.01",
                },
              }}
              startDecorator="$"
            />
          </FormControl>
        </Grid>
      </Grid>
      <Grid container columns={2} spacing={2}>
        <Grid xs={1}>
          <FormControl>
            <FormLabel>Project</FormLabel>
            <Autocomplete
              isOptionEqualToValue={(option, value) => {
                return option.projectCuid === value.projectCuid;
              }}
              options={Object.keys(claimableShifts).map((key) => {
                return {
                  projectCuid: key,
                  label: claimableShifts[key].name,
                };
              })}
              getOptionLabel={(option) => option.label}
              onChange={(_e, value) => {
                setProjectCuid(value?.projectCuid || "");
              }}
            />
          </FormControl>
        </Grid>
        <Grid xs={1}>
          <FormControl>
            <FormLabel>Shift</FormLabel>
            <Autocomplete
              disabled={!projectCuid}
              isOptionEqualToValue={(option, value) => {
                return option.rosterCuid === value.rosterCuid;
              }}
              options={
                claimableShifts[projectCuid]?.shifts
                  .map((shift) => {
                    return {
                      rosterCuid: shift.cuid,
                      shiftDate: dayjs(shift.shiftDate),
                      shiftStartTime: dayjs(
                        shift.shiftType === "SECOND_HALF"
                          ? shift.Shift.halfDayStartTime
                          : shift.Shift.startTime
                      ),
                    };
                  })
                  .sort((a, b) =>
                    a.shiftDate.isBefore(b.shiftDate) ? -1 : 1
                  ) || []
              }
              getOptionLabel={(option) => `
                ${option.shiftDate.format(
                  "DD MMM YYYY"
                )} - ${option.shiftStartTime.format("HHmm")}`}
              onChange={(_e, value) => {
                setRosterCuid(value?.rosterCuid || "");
              }}
            />
          </FormControl>
        </Grid>
      </Grid>
      <FormControl>
        <FormLabel>Description</FormLabel>
        <Textarea
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Upload Receipt</FormLabel>
        <input
          type="file"
          accept="image/*"
          onChange={handleReceiptFileChange}
        />
      </FormControl>
      {receiptPreview && (
        <Sheet sx={{ overflowY: "auto", width: "100%" }}>
          <img
            src={receiptPreview}
            alt="Image preview"
            style={{ width: "100%", height: "auto" }}
          />
        </Sheet>
      )}
      <LoadingRequestButton
        promise={handleClaimSubmit}
        disabled={
          !projectCuid ||
          !type ||
          !description ||
          !amount ||
          !rosterCuid ||
          !receiptFile
        }
      />
    </>
  );
}
