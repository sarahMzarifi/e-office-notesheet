import {
  Card,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";

export default function NotesheetBody({
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
          Notesheet Content
        </Typography>

        <Divider sx={{ mb: 2.5 }} />

        <Typography
          variant="body1"
          sx={{
            color: "#374151",
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
          }}
        >
          {notesheet.body}
        </Typography>
      </CardContent>
    </Card>
  );
}