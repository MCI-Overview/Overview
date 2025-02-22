import { ReactNode } from "react";

import { Breadcrumbs, Typography, Link } from "@mui/joy";
import {
  HomeRounded as HomeIcon,
  ChevronRightRounded as ChevronRightIcon,
} from "@mui/icons-material";

export type BreadcrumbPart = {
  label: ReactNode;
  link: string;
};

function CustomLink({ breadcrumbPart }: { breadcrumbPart: BreadcrumbPart }) {
  return (
    <Link
      underline="none"
      color="neutral"
      href={`#${breadcrumbPart.link}`}
      aria-label="Home"
    >
      <Typography color="primary" fontWeight={500} fontSize={12}>
        {breadcrumbPart.label}
      </Typography>
    </Link>
  );
}

export function UserBreadcrumb({
  breadcrumbs,
}: {
  breadcrumbs: BreadcrumbPart[];
}) {
  return (
    <Breadcrumbs
      size="sm"
      aria-label="breadcrumbs"
      separator={<ChevronRightIcon />}
      sx={{ pl: 0 }}
    >
      <Link
        underline="none"
        color="neutral"
        href="#/user/home"
        aria-label="Home"
      >
        <HomeIcon />
      </Link>
      {breadcrumbs.map((breadcrumb, index) => (
        <CustomLink key={index} breadcrumbPart={breadcrumb} />
      ))}
    </Breadcrumbs>
  );
}
