import { useState } from 'react';
import { useUserContext } from '../../../providers/userContextProvider';
import { useProjectContext } from '../../../providers/projectContextProvider';
import axios from 'axios';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { Button, FormControl, FormLabel, Grid, Input, Select, Option } from '@mui/joy';
import toast from 'react-hot-toast';
import { nricRegex, contactRegex } from '../../../utils/validation';

interface AddCandidateModalProps {
    isAddModalOpen: boolean;
    setAddModalOpen: (isOpen: boolean) => void;
}

const AddCandidateModal = ({ isAddModalOpen, setAddModalOpen }: AddCandidateModalProps) => {
    const { user } = useUserContext();
    const { project, updateProject } = useProjectContext();
    const [cdd, setCdd] = useState({
        nric: '',
        name: '',
        contact: '',
        dateOfBirth: '',
        startDate: '',
        endDate: '',
        employmentType: '',
    });

    const [errors, setErrors] = useState({
        nric: '',
        name: '',
        contact: '',
        dateOfBirth: '',
        startDate: '',
        endDate: '',
        employmentType: '',
    });

    if (!project || !user) return null;

    const projectCuid = project.cuid;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCdd((prevCdd) => ({
            ...prevCdd,
            [name]: value,
        }));
    };

    const handleSelectChange = (_event: any, value: string | null) => {
        setCdd((prevCdd) => ({
            ...prevCdd,
            employmentType: value || '',
        }));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString();
    };

    const validateInput = () => {
        let newErrors = {
            nric: '',
            name: '',
            contact: '',
            dateOfBirth: '',
            startDate: '',
            endDate: '',
            employmentType: '',
        };

        if (!nricRegex.test(cdd.nric)) {
            newErrors.nric = 'Invalid NRIC';
        }
        if (cdd.name.trim() === '') {
            newErrors.name = 'Name is required';
        }
        if (!contactRegex.test(cdd.contact)) {
            newErrors.contact = 'Invalid contact number';
        }
        if (!cdd.dateOfBirth || !Date.parse(cdd.dateOfBirth)) {
            newErrors.dateOfBirth = 'Invalid date of birth';
        }
        if (!cdd.startDate || !Date.parse(cdd.startDate)) {
            newErrors.startDate = 'Invalid start date';
        }
        if (!cdd.endDate || !Date.parse(cdd.endDate)) {
            newErrors.endDate = 'Invalid end date';
        }
        if (!cdd.employmentType) {
            newErrors.employmentType = 'Employment type is required';
        }

        setErrors(newErrors);

        return Object.values(newErrors).every((error) => error === '');
    };

    const handleSubmitData = async () => {
        if (!validateInput()) {
            toast.error("Please correct the errors in the form");
            return;
        }

        try {
            const formattedCdd = {
                ...cdd,
                dateOfBirth: formatDate(cdd.dateOfBirth),
                startDate: formatDate(cdd.startDate),
                endDate: formatDate(cdd.endDate),
            };

            const response = await axios.post(
                `/api/admin/project/${projectCuid}/candidates`,
                [formattedCdd]
            );
            if (response.data.length !== 0) {
                toast.error("Candidate already existss");
            }
            else {
                toast.success("Candidates added successfully");
                updateProject();
                setAddModalOpen(false);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "An error occurred while adding candidates");
            } else {
                toast.error("An unexpected error occurred");
            }
            console.error(error);
        }
    };

    return (
        <>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Sheet
                    variant="outlined"
                    sx={{
                        maxWidth: 500,
                        maxHeight: '100vh',
                        overflow: 'auto',
                        borderRadius: 'md',
                        p: 3,
                        boxShadow: 'lg',
                    }}
                >
                    <ModalClose variant="plain" sx={{ m: 1 }} />
                    <Typography
                        component="h2"
                        id="modal-title"
                        level="h4"
                        textColor="inherit"
                        fontWeight="lg"
                        mb={1}
                    >
                        Add a candidate
                    </Typography>
                    <Typography id="modal-desc" textColor="text.tertiary">
                        Add a candidate to your project. Select from your candidate history or fill in their details.
                    </Typography>

                    <Grid container spacing={2} py={2}>
                        <Grid xs={12}>
                            <FormControl required error={!!errors.nric}>
                                <FormLabel>Nric</FormLabel>
                                <Input name='nric' value={cdd.nric} onChange={handleChange} />
                                {errors.nric && <Typography textColor="danger">{errors.nric}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid xs={12}>
                            <FormControl required error={!!errors.name}>
                                <FormLabel>Name</FormLabel>
                                <Input name='name' value={cdd.name} onChange={handleChange} />
                                {errors.name && <Typography textColor="danger">{errors.name}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid xs={12}>
                            <FormControl required error={!!errors.contact}>
                                <FormLabel>Contact</FormLabel>
                                <Input
                                    startDecorator={'+65'}
                                    name='contact'
                                    value={cdd.contact}
                                    onChange={handleChange}
                                />
                                {errors.contact && <Typography textColor="danger">{errors.contact}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid xs={12}>
                            <FormControl required error={!!errors.dateOfBirth}>
                                <FormLabel>Date of birth</FormLabel>
                                <Input
                                    type="date"
                                    name='dateOfBirth'
                                    value={cdd.dateOfBirth}
                                    onChange={handleChange}
                                />
                                {errors.dateOfBirth && <Typography textColor="danger">{errors.dateOfBirth}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required error={!!errors.startDate}>
                                <FormLabel>Start date</FormLabel>
                                <Input
                                    type="date"
                                    name='startDate'
                                    value={cdd.startDate}
                                    onChange={handleChange}
                                />
                                {errors.startDate && <Typography textColor="danger">{errors.startDate}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl required error={!!errors.endDate}>
                                <FormLabel>End date</FormLabel>
                                <Input
                                    type="date"
                                    name='endDate'
                                    value={cdd.endDate}
                                    onChange={handleChange}
                                />
                                {errors.endDate && <Typography textColor="danger">{errors.endDate}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid xs={12}>
                            <FormControl required error={!!errors.employmentType}>
                                <FormLabel>Job type</FormLabel>
                                <Select
                                    value={cdd.employmentType}
                                    name='employmentType'
                                    onChange={handleSelectChange}
                                >
                                    <Option value={'FULL_TIME'}>FULL_TIME</Option>
                                    <Option value={'PART_TIME'}>PART_TIME</Option>
                                    <Option value={'CONTRACT'}>CONTRACT</Option>
                                </Select>
                                {errors.employmentType && <Typography textColor="danger">{errors.employmentType}</Typography>}
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Button onClick={handleSubmitData}>Save</Button>
                </Sheet>
            </Modal>
        </>
    );
};

export default AddCandidateModal;