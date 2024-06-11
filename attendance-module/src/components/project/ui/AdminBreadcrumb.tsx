import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { Breadcrumbs, Typography, Link } from "@mui/joy";
import { HomeRounded, ChevronRightRounded } from "@mui/icons-material";

export type BreadcrumbPart = {
  label: ReactNode;
  link: string;
};

function CustomLink({ breadcrumbPart }: { breadcrumbPart: BreadcrumbPart }) {
  const navigate = useNavigate();

  return (
    <Typography
      color="primary"
      fontWeight={500}
      fontSize={12}
      sx={{ cursor: "pointer" }}
      onClick={() => navigate(breadcrumbPart.link)}
    >
      {breadcrumbPart.label}
    </Typography>
  );
}

export function AdminBreadcrumb({
  breadcrumbs,
}: {
  breadcrumbs: BreadcrumbPart[];
}) {
  return (
    <Breadcrumbs
      size="sm"
      aria-label="breadcrumbs"
      separator={<ChevronRightRounded />}
      sx={{ pl: 0 }}
    >
      <Link
        underline="none"
        color="neutral"
        href="/admin/home"
        aria-label="Home"
      >
        <HomeRounded />
      </Link>
      {breadcrumbs.map((breadcrumb, index) => (
        <CustomLink key={index} breadcrumbPart={breadcrumb} />
      ))}
    </Breadcrumbs>
  );
}
