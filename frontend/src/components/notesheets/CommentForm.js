import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";

export default function CommentForm({
  commentText,
  commentError,
  commentSuccess,
  submittingComment,
  onCommentChange,
  onCommentSubmit,
  onClarificationRequest,
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
            mb: 2,
          }}
        >
          Add Review Remark
        </Typography>

        <Box
          component="form"
          onSubmit={onCommentSubmit}
        >
          <TextField
            fullWidth
            multiline
            minRows={4}
            maxRows={10}
            value={commentText}
            onChange={onCommentChange}
            placeholder="Enter your review remark..."
            disabled={submittingComment}
          />

          {commentError && (
            <Alert
              severity="error"
              sx={{ mt: 1.5 }}
            >
              {commentError}
            </Alert>
          )}

          {commentSuccess && (
            <Alert
              severity="success"
              sx={{ mt: 1.5 }}
            >
              {commentSuccess}
            </Alert>
          )}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
            sx={{
              mt: 1.5,
              justifyContent: "space-between",
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={onClarificationRequest}
              disabled={
                submittingComment ||
                !commentText.trim()
              }
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Request Clarification
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={
                submittingComment ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <SendIcon />
                )
              }
              disabled={
                submittingComment ||
                !commentText.trim()
              }
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {submittingComment
                ? "Submitting..."
                : "Add Remark"}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}