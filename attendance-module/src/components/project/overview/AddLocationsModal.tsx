const AddLocationsModal = () => {


  return (
    <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
      <ModalDialog sx={{ maxWidth: "525px" }}>
        <Typography level="title-md">
          Add a new location to the project
        </Typography>

        <Input type="text" placeholder="Postal code" fullWidth />

        <Stack direction="row" spacing={1}>
          <Button onClick={() => setIsAddModalOpen(false)} fullWidth>
            Cancel
          </Button>
          <Button onClick={() => handleAddLocation()} color="danger" fullWidth>
            Confirm
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default AddLocationsModal;
