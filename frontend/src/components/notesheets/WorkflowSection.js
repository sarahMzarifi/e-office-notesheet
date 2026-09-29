import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";

const stageLabels = {
  REVIEW: "Review",
  APPROVAL: "Approval",
};

const statusStyles = {
  DRAFT: {
    color: "#8a6500",
    background: "#fff8e1",
    border: "#e8c96a",
  },

  UNDER_REVIEW: {
    color: "#806000",
    background: "#fff8e1",
    border: "#e4c65a",
  },

  WAITING_FOR_RESPONSE: {
    color: "#806000",
    background: "#fff8e1",
    border: "#e4c65a",
  },

  APPROVED: {
    color: "#2e6b3e",
    background: "#edf7ef",
    border: "#9ac7a5",
  },

  FINALIZED: {
    color: "#276438",
    background: "#edf7ef",
    border: "#8fbd9a",
  },

  REJECTED: {
    color: "#9a3d3d",
    background: "#fff1f1",
    border: "#d9a0a0",
  },
};

export default function WorkflowSection({
  notesheet,
  canForward,
  forwarding,
  forwardError,
  forwardSuccess,
  onForward,
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
            mb: 2.5,
          }}
        >
          Workflow
        </Typography>

        {notesheet.workflow_assignments?.length > 0 ? (
          <Stack spacing={2}>
            {notesheet.workflow_assignments.map(
              (assignment, index) => {
                const assignmentStatus =
                  statusStyles[
                    assignment.status === "COMPLETED"
                      ? "APPROVED"
                      : notesheet.status
                  ] || statusStyles.DRAFT;

                return (
                  <Box key={assignment.id}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "140px 1fr auto",
                        },
                        gap: 2,
                        alignItems: "center",
                        p: 2,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                        backgroundColor: "#fafafa",
                      }}
                    >
                      {/* Stage */}
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Stage
                        </Typography>

                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: "#1f2937",
                            mt: 0.25,
                          }}
                        >
                          {stageLabels[
                            assignment.stage
                          ] || assignment.stage}
                        </Typography>
                      </Box>

                      {/* Officer */}
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Assigned Officer
                        </Typography>

                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: "#1f2937",
                            mt: 0.25,
                          }}
                        >
                          {assignment.assigned_to_full_name ||
                            assignment.assigned_to_username}
                        </Typography>

                        {assignment.assigned_to_designation && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.25 }}
                          >
                            {
                              assignment.assigned_to_designation
                            }
                          </Typography>
                        )}
                      </Box>

                      {/* Status */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: {
                            xs: "flex-start",
                            md: "flex-end",
                          },
                        }}
                      >
                        <Chip
                          label={
                            assignment.status ===
                            "COMPLETED"
                              ? "Completed"
                              : assignment.status
                          }
                          size="small"
                          sx={{
                            color:
                              assignmentStatus.color,
                            backgroundColor:
                              assignmentStatus.background,
                            border: `1px solid ${assignmentStatus.border}`,
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Workflow connector */}
                    {index <
                      notesheet.workflow_assignments
                        .length -
                        1 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          py: 0.75,
                        }}
                      >
                        <Box
                          sx={{
                            width: "2px",
                            height: "18px",
                            backgroundColor: "#d1d5db",
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                );
              }
            )}
          </Stack>
        ) : (
          <Typography
            color="text.secondary"
            sx={{ py: 1 }}
          >
            No workflow assignments are available.
          </Typography>
        )}

        {/* Forward to Approval */}
        {canForward && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2.5 }} />

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.5}
              sx={{
                alignItems: {
                  xs: "stretch",
                  sm: "center",
                },
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: "#1f2937",
                  }}
                >
                  Ready for Approval
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Forward this notesheet to the
                  authorized approval authority.
                </Typography>
              </Box>

              <Button
                variant="contained"
                onClick={onForward}
                startIcon={
                  forwarding ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : (
                    <SendIcon />
                  )
                }
                disabled={forwarding}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {forwarding
                  ? "Forwarding..."
                  : "Forward to Approval"}
              </Button>
            </Stack>

            {forwardError && (
              <Alert
                severity="error"
                sx={{ mt: 2 }}
              >
                {forwardError}
              </Alert>
            )}

            {forwardSuccess && (
              <Alert
                severity="success"
                sx={{ mt: 2 }}
              >
                {forwardSuccess}
              </Alert>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}