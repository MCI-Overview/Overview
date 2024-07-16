import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  Modal,
  ModalClose,
  ModalDialog,
} from "@mui/joy";

export default function ResponsiveDialog({
  open,
  title,
  actions,
  children,
  handleClose,
}: {
  open: boolean;
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  handleClose: () => void;
}) {
  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          display: {
            xs: "none",
            sm: "initial",
          },
        }}
      >
        <ModalDialog
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            maxWidth: "40rem",
          }}
        >
          <ModalClose />
          <DialogTitle>{title}</DialogTitle>
          <DialogContent
            sx={{
              minWidth: "30rem",
              // Prevent overflow on X-axis
              padding: 0.01,
            }}
          >
            {children}
          </DialogContent>
          <DialogActions>{actions}</DialogActions>
        </ModalDialog>
      </Modal>
      <Drawer
        size="sm"
        open={open}
        onClose={handleClose}
        anchor="bottom"
        sx={{
          display: {
            xs: "initial",
            sm: "none",
          },
        }}
        slotProps={{
          content: {
            sx: {
              p: 1,
            },
          },
        }}
      >
        <ModalClose
          sx={{
            p: 2,
          }}
        />
        <DialogTitle>{title}</DialogTitle>
        <DialogContent
          sx={{
            p: 1.5,
          }}
        >
          {children}
        </DialogContent>
        <DialogActions>{actions}</DialogActions>
      </Drawer>
    </>
  );
}
