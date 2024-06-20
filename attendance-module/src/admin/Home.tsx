import {
  Box,
  tabClasses,
  Tab,
  TabList,
  Tabs,
  Typography,
  Breadcrumbs,
  Link,
  TabPanel,
} from "@mui/joy";
import {
  HomeRounded as HomeIcon,
  ChevronRightRounded as ChevronRightIcon,
} from "@mui/icons-material";

const AdminHome = () => {
  return (
    <>
      <Box sx={{ flex: 1, width: "100%" }}>
        <Box
          sx={{
            position: "sticky",
            top: { sm: -100, md: -110 },
            bgcolor: "background.body",
            zIndex: 12,
          }}
        >
          <Box sx={{ px: { xs: 2, md: 6 } }}>
            <Breadcrumbs
              size="sm"
              aria-label="breadcrumbs"
              separator={<ChevronRightIcon />}
              sx={{ pl: 0 }}
            >
              <Link
                underline="none"
                color="neutral"
                href="#some-link"
                aria-label="Home"
              >
                <HomeIcon />
              </Link>
              <Typography color="primary" fontWeight={500} fontSize={12}>
                Home
              </Typography>
            </Breadcrumbs>
            <Typography level="h2" component="h1" sx={{ mt: 1, mb: 2 }}>
              Home
            </Typography>
          </Box>
          <Tabs
            defaultValue={0}
            sx={{
              bgcolor: "transparent",
            }}
          >
            <TabList
              tabFlex={1}
              size="sm"
              sx={{
                pl: { xs: 0, md: 4 },
                justifyContent: "left",
                [`&& .${tabClasses.root}`]: {
                  fontWeight: "600",
                  flex: "initial",
                  color: "text.tertiary",
                  [`&.${tabClasses.selected}`]: {
                    bgcolor: "transparent",
                    color: "text.primary",
                    "&::after": {
                      height: "2px",
                      bgcolor: "primary.500",
                    },
                  },
                },
              }}
            >
              <Tab
                sx={{ borderRadius: "6px 6px 0 0" }}
                indicatorInset
                value={0}
              >
                Tab
              </Tab>
              <Tab
                sx={{ borderRadius: "6px 6px 0 0" }}
                indicatorInset
                value={1}
              >
                Tab
              </Tab>
              <Tab
                sx={{ borderRadius: "6px 6px 0 0" }}
                indicatorInset
                value={2}
              >
                Tab
              </Tab>
              <Tab
                sx={{ borderRadius: "6px 6px 0 0" }}
                indicatorInset
                value={3}
              >
                Tab
              </Tab>
            </TabList>
            <TabPanel value={0}></TabPanel>
            <TabPanel value={1}></TabPanel>
            <TabPanel value={2}></TabPanel>
          </Tabs>
        </Box>
      </Box>
    </>
  );
};

export default AdminHome;
