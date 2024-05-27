import { Breadcrumbs, Typography, Link } from "@mui/joy";
import { HomeRounded, ChevronRightRounded } from "@mui/icons-material";
import React from "react";

export type BreadcrumbPart = {
  label: React.ReactNode;
  link: string;
};

function CustomLink({ breadcrumbPart }: { breadcrumbPart: BreadcrumbPart }) {
  return (
    <Link
      underline="none"
      color="neutral"
      href={breadcrumbPart.link}
      aria-label="Home"
    >
      <Typography color="primary" fontWeight={500} fontSize={12}>
        {breadcrumbPart.label}
      </Typography>
    </Link>
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
