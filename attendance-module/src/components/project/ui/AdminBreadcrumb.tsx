import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { Breadcrumbs, Typography } from "@mui/joy";
import {
  HomeRounded as HomeIcon,
  ChevronRightRounded as ChevronRightIcon,
} from "@mui/icons-material";

export type BreadcrumbPart = {
  label: ReactNode;
  link: string;
};

export function AdminBreadcrumb({
  breadcrumbs,
}: {
  breadcrumbs: BreadcrumbPart[];
}) {
  const navigate = useNavigate();

  return (
    <Breadcrumbs
      size="sm"
      aria-label="breadcrumbs"
      separator={<ChevronRightIcon />}
      sx={{ pl: 0 }}
    >
      <HomeIcon
        sx={{ cursor: "pointer" }}
        onClick={() => navigate("/admin/home")}
      />
      {breadcrumbs &&
        breadcrumbs.map((breadcrumb) => (
          <Typography
            color="primary"
            fontWeight={500}
            fontSize={12}
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(breadcrumb.link)}
          >
            {breadcrumb.label}
          </Typography>
        ))}
    </Breadcrumbs>
  );
}
