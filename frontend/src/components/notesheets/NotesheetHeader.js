import { Box, Chip, Stack, Typography } from "@mui/material";

export default function NotesheetHeader({
  notesheet,
  status,
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.04em",
            }}
          >
            {notesheet.reference_number}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mt: 0.5,
              fontWeight: 700,
              color: "#1f2937",
              lineHeight: 1.3,
            }}
          >
            {notesheet.title}
          </Typography>
        </Box>

        <Chip
          label={status.label}
          sx={{
            color: status.color,
            backgroundColor: status.background,
            border: `1px solid ${status.border}`,
            fontWeight: 600,
          }}
        />
      </Stack>
    </Box>
  );
}