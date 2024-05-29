// ./login/choose-role.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tab, TabBar } from "../components/TabBar";
import { Typography, Box } from "@mui/joy";
import {
    AdminBreadcrumb,
    BreadcrumbPart,
} from "../components/project/ui/AdminBreadcrumb";
import UserNewStepper from "./UserNewStepper";

const tabs: Tab[] = [
    {
        label: "New user",
        content: <UserNewStepper />,
    },
    // {
    //     label: "Create",
    //     content: <div>HALLOOOOO</div>,
    // },
    // {
    //     label: "Plan",
    //     content: <div>Plan</div>,
    // },
];

const UserNew: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [tabValue, setTabValue] = useState<number>(0);

    const breadcrumbs: BreadcrumbPart[] = [
        {
            label: "New user",
            link: "",
        },
    ];

    useEffect(() => {
        const hash = location.hash.replace("#", "");
        switch (hash) {
            case "create":
                setTabValue(1);
                break;
            case "plan":
                setTabValue(2);
                break;
            default:
                setTabValue(0);
                break;
        }
    }, [location.hash]);

    const handleTabChange = (
        _event: React.SyntheticEvent<Element, Event> | null,
        newValue: string | number | null,
    ) => {
        if (newValue === null || typeof newValue === "string") return;
        setTabValue(newValue);
        switch (newValue) {
            case 0:
                navigate("/user/home");
                break;
            case 1:
                navigate("/user/home#create");
                break;
            case 2:
                navigate("/user/home#plan");
                break;
            case 3:
                navigate("/user/home#billing");
                break;
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
                        <AdminBreadcrumb breadcrumbs={breadcrumbs} />
                        <Typography level="h2" component="h1" sx={{ mt: 1, mb: 2 }}>
                            Overview
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

export default UserNew;
