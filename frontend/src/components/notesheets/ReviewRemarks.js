import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import ResponseForm from "./ResponseForm";

const actionLabels = {
  COMMENT: "Comment",
  RESPONSE: "Response",
  CLARIFICATION_REQUEST: "Clarification Request",
};

function formatDateTime(dateString) {
  if (!dateString) {
    return "—";
  }

  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReviewRemarks({
  notesheet,
  clarificationComment,
  canRespond,
  responseText,
  responseError,
  responseSuccess,
  submittingResponse,
  onResponseChange,
  onResponseSubmit,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        backgroundColor: "#ffffff",
        mb:
          notesheet.status === "FINALIZED"
            ? 2
            : 0,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#1f2937",
            mb: 2.5,
          }}
        >
          Review Remarks
        </Typography>

        {notesheet.comments?.length > 0 ? (
          <Stack spacing={2}>
            {notesheet.comments.map((comment) => {
              const isResponse =
                Boolean(comment.parent_comment);

              const actionColor =
                comment.action_type ===
                "CLARIFICATION_REQUEST"
                  ? "#806000"
                  : comment.action_type ===
                    "RESPONSE"
                  ? "#1565c0"
                  : "#4b5563";

              const actionBackground =
                comment.action_type ===
                "CLARIFICATION_REQUEST"
                  ? "#fff8e1"
                  : comment.action_type ===
                    "RESPONSE"
                  ? "#eef5ff"
                  : "#f9fafb";

              const actionBorder =
                comment.action_type ===
                "CLARIFICATION_REQUEST"
                  ? "#e8c96a"
                  : comment.action_type ===
                    "RESPONSE"
                  ? "#a9c7ef"
                  : "#d1d5db";

              const isCurrentClarification =
                clarificationComment?.id ===
                comment.id;

              return (
                <Box
                  key={comment.id}
                  sx={{
                    ml: isResponse
                      ? { xs: 2, sm: 5 }
                      : 0,
                    position: "relative",
                  }}
                >
                  {isResponse && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: {
                          xs: -12,
                          sm: -20,
                        },
                        top: 0,
                        bottom: 0,
                        width: "2px",
                        backgroundColor: "#dbe3ec",
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid #e5e7eb",
                      borderRadius: 2,
                      backgroundColor: isResponse
                        ? "#fafafa"
                        : "#ffffff",
                    }}
                  >
                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={1}
                      sx={{
                        alignItems: {
                          xs: "flex-start",
                          sm: "center",
                        },
                        justifyContent:
                          "space-between",
                        mb: 1,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: "#1f2937",
                          }}
                        >
                          {comment.author_full_name ||
                            comment.author_username}
                        </Typography>

                        {comment.author_designation && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {comment.author_designation}
                          </Typography>
                        )}
                      </Box>

                      <Chip
                        label={
                          actionLabels[
                            comment.action_type
                          ] || comment.action_type
                        }
                        size="small"
                        sx={{
                          color: actionColor,
                          backgroundColor:
                            actionBackground,
                          border: `1px solid ${actionBorder}`,
                          fontWeight: 600,
                        }}
                      />
                    </Stack>

                    <Divider sx={{ mb: 1.5 }} />

                    <Typography
                      variant="body1"
                      sx={{
                        color: "#374151",
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {comment.content}
                    </Typography>

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={1}
                      sx={{
                        mt: 1.5,
                        alignItems: {
                          xs: "flex-start",
                          sm: "center",
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatDateTime(
                          comment.created_at
                        )}
                      </Typography>

                      {comment.response_required && (
                        <Chip
                          label="Response Required"
                          size="small"
                          sx={{
                            color: "#806000",
                            backgroundColor:
                              "#fff8e1",
                            border:
                              "1px solid #e8c96a",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Stack>

                    {isCurrentClarification &&
                      canRespond && (
                        <ResponseForm
                          responseText={responseText}
                          responseError={
                            responseError
                          }
                          responseSuccess={
                            responseSuccess
                          }
                          submittingResponse={
                            submittingResponse
                          }
                          onResponseChange={
                            onResponseChange
                          }
                          onSubmit={
                            onResponseSubmit
                          }
                        />
                      )}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Typography
            color="text.secondary"
            sx={{ py: 1 }}
          >
            No review remarks have been added.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}