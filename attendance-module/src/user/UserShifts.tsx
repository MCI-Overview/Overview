import React, { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tab, TabBar } from "../components/TabBar";
import { Typography, Box } from "@mui/joy";
import {
    UserBreadcrumb,
    BreadcrumbPart,
} from "../components/project/ui/UserBreadcrumb";
import ViewShifts from "../components/user/shifts/ViewShifts";
import ViewAttendance from "../components/user/shifts/ViewAttendance";

const UserShifts: FC = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState<number>(0);

    const tabs: Tab[] = [
        {
            label: "Upcoming Shifts",
            content: <ViewShifts />,
        },
        {
            label: "Attendance History",
            content: <ViewAttendance />,
        },

    ];

    const breadcrumbs: BreadcrumbPart[] = [
        {
            label: "Shifts",
            link: "/user/shifts",
        },
    ];

    useEffect(() => {
        const hash = location.hash.replace("#", "");
        switch (hash) {
            case "history":
                setTabValue(1);
                break;
            case "shift":
                setTabValue(2);
                break;
            default:
                setTabValue(0);
                break;
        }
    }, [location.hash]);

    const handleTabChange = (
        _event: React.SyntheticEvent<Element, Event> | null,
        newValue: string | number | null
    ) => {
        if (newValue === null || typeof newValue === "string") return;
        setTabValue(newValue);
        switch (newValue) {
            case 0:
                navigate("/user/shifts");
                break;
            case 1:
                navigate("/user/shifts#history");
                break;
            // case 2:
            //     navigate("/user/home#history");
            //     break;
            // case 3:
            //     navigate("/user/home#billing");
            //     break;
            default:
                break;
        }
    };

    return (
        <>
            <Box sx={{ flex: 1, width: "100%" }}>
                <Box
                    sx={{
                        position: "sticky",
                        top: { sm: -100, md: -110 },
                        color: "white",
                    }}
                >
                    <Box sx={{ px: { xs: 2, md: 6 } }}>
                        <UserBreadcrumb breadcrumbs={breadcrumbs} />
                        <Typography level="h2" component="h1" sx={{ mt: 1, mb: 2 }}>
                            Shifts
                        </Typography>
                    </Box>
                    <TabBar
                        tabValue={tabValue}
                        handleTabChange={handleTabChange}
                        tabs={tabs}
                    />
                </Box>
            </Box>
        </>
    );
};

export default UserShifts;
