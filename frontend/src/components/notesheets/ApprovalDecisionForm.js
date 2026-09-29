import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

export default function ApprovalDecisionForm({
  justification,
  decisionError,
  decisionSuccess,
  submittingDecision,
  onJustificationChange,
  onApprove,
  onReject,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        backgroundColor: "#ffffff",
        mt: 2,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#1f2937",
            mb: 1,
          }}
        >
          Approval Decision
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2.5 }}
        >
          Review the notesheet and select the
          appropriate final decision.
        </Typography>

        <Divider sx={{ mb: 2.5 }} />

        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: "#374151",
              mb: 1,
            }}
          >
            Rejection Justification
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={8}
            value={justification}
            onChange={onJustificationChange}
            placeholder="Required only if the notesheet is rejected..."
            disabled={submittingDecision}
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 0.75,
            }}
          >
            A justification is mandatory when
            rejecting a notesheet.
          </Typography>
        </Box>

        {decisionError && (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
          >
            {decisionError}
          </Alert>
        )}

        {decisionSuccess && (
          <Alert
            severity="success"
            sx={{ mt: 2 }}
          >
            {decisionSuccess}
          </Alert>
        )}

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1.5}
          sx={{
            mt: 2.5,
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            color="error"
            startIcon={
              submittingDecision ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <CancelIcon />
              )
            }
            onClick={onReject}
            disabled={submittingDecision}
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {submittingDecision
              ? "Processing..."
              : "Reject"}
          </Button>

          <Button
            variant="contained"
            startIcon={
              submittingDecision ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <CheckCircleIcon />
              )
            }
            onClick={onApprove}
            disabled={submittingDecision}
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {submittingDecision
              ? "Processing..."
              : "Approve"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}