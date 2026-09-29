import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";

export default function ResponseForm({
  responseText,
  responseError,
  responseSuccess,
  submittingResponse,
  onResponseChange,
  onSubmit,
}) {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{ mt: 2.5 }}
    >
      <Divider sx={{ mb: 2 }} />

      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: "#1f2937",
          mb: 1.5,
        }}
      >
        Your Response
      </Typography>

      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={8}
        value={responseText}
        onChange={onResponseChange}
        placeholder="Enter your response..."
        disabled={submittingResponse}
      />

      {responseError && (
        <Alert
          severity="error"
          sx={{ mt: 1.5 }}
        >
          {responseError}
        </Alert>
      )}

      {responseSuccess && (
        <Alert
          severity="success"
          sx={{ mt: 1.5 }}
        >
          {responseSuccess}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 1.5,
        }}
      >
        <Button
          type="submit"
          variant="contained"
          startIcon={
            submittingResponse ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <SendIcon />
            )
          }
          disabled={
            submittingResponse ||
            !responseText.trim()
          }
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {submittingResponse
            ? "Submitting..."
            : "Submit Response"}
        </Button>
      </Box>
    </Box>
  );
}