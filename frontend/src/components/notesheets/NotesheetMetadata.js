import {
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

function formatDate(dateString) {
  if (!dateString) {
    return "—";
  }

  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function NotesheetMetadata({
  notesheet,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        backgroundColor: "#ffffff",
        mb: 2,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#1f2937",
            mb: 2,
          }}
        >
          Notesheet Information
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2.5,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Category
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                mt: 0.25,
              }}
            >
              {notesheet.category}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Priority
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                mt: 0.25,
              }}
            >
              {notesheet.priority}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Department
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                mt: 0.25,
              }}
            >
              {notesheet.department}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Created
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                mt: 0.25,
              }}
            >
              {formatDate(notesheet.created_at)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}