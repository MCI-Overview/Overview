import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy";

export default function ResponsiveDialog({
  open,
  title,
  subtitle,
  actions,
  children,
  handleClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
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
          <DialogTitle
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography level="title-lg">{title}</Typography>
            {subtitle && <Typography level="body-sm">{subtitle}</Typography>}
          </DialogTitle>
          <DialogContent
            sx={{
              minWidth: "30rem",
              overflow: "auto",
              textOverflow: "ellipsis",
              scrollbarColor: "transparent transparent",
              scrollbarWidth: "none",
            }}
          >
            {children}
          </DialogContent>
          {actions && <DialogActions>{actions}</DialogActions>}
        </ModalDialog>
      </Modal>
      <Drawer
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
        <DialogTitle
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography level="title-lg">{title}</Typography>
          {subtitle && <Typography level="body-sm">{subtitle}</Typography>}
        </DialogTitle>
        <DialogContent
          sx={{
            p: 1.5,
          }}
        >
          {children}
        </DialogContent>
        {actions && <DialogActions>{actions}</DialogActions>}
      </Drawer>
    </>
  );
}
