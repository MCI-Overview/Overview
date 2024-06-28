import { Box, Button, iconButtonClasses, Card } from "@mui/joy";
import {
  KeyboardArrowLeftRounded as KeyboardArrowLeftIcon,
  KeyboardArrowRightRounded as KeyboardArrowRightIcon,
} from "@mui/icons-material";

interface PaginationFooterProps {
  maxPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const PaginationFooter = ({
  maxPage,
  currentPage,
  setCurrentPage,
}: PaginationFooterProps) => {
  if (maxPage <= 1) return null;

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === maxPage;

  const handlePreviousPage = () => {
    if (!isFirstPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (!isLastPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Box
      sx={{
        pt: 2,
        gap: 1,
        [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
        display: {
          xs: "flex",
          md: "flex",
        },
      }}
    >
      <Button
        size="sm"
        variant="outlined"
        color="neutral"
        startDecorator={<KeyboardArrowLeftIcon />}
        onClick={handlePreviousPage}
        disabled={isFirstPage}
      >
        Previous
      </Button>

      <Box sx={{ flex: 1 }} />
      <Card
        size="sm"
        variant="outlined"
        color="neutral"
        sx={{
          px: 2,
          py: 0,
          justifyContent: "center",
          userSelect: "none",
          fontWeight: "600",
        }}
      >
        {currentPage} / {maxPage}
      </Card>
      <Box sx={{ flex: 1 }} />

      <Button
        size="sm"
        variant="outlined"
        color="neutral"
        endDecorator={<KeyboardArrowRightIcon />}
        onClick={handleNextPage}
        disabled={isLastPage}
      >
        Next
      </Button>
    </Box>
  );
};

export default PaginationFooter;
