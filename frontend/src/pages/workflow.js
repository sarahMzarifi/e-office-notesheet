import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";

import AppShell from "../components/layout/AppShell";
import api from "../services/api";

const stageLabels = {
  REVIEW: "Review",
  APPROVAL: "Approval",
};

const statusLabels = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
};

function getNotesheetId(assignment) {
  if (typeof assignment?.notesheet === "number") {
    return assignment.notesheet;
  }

  if (assignment?.notesheet?.id) {
    return assignment.notesheet.id;
  }

  if (assignment?.notesheet_id) {
    return assignment.notesheet_id;
  }

  return null;
}

function getNotesheetReference(assignment) {
  if (assignment?.reference_number) {
    return assignment.reference_number;
  }

  if (assignment?.notesheet?.reference_number) {
    return assignment.notesheet.reference_number;
  }

  if (assignment?.notesheet_reference_number) {
    return assignment.notesheet_reference_number;
  }

  const notesheetId = getNotesheetId(assignment);

  return notesheetId
    ? `Notesheet #${notesheetId}`
    : "Notesheet";
}

function getNotesheetTitle(assignment) {
  if (assignment?.title) {
    return assignment.title;
  }

  if (assignment?.notesheet?.title) {
    return assignment.notesheet.title;
  }

  if (assignment?.notesheet_title) {
    return assignment.notesheet_title;
  }

  return "Notesheet";
}

function getAssignedOfficer(assignment) {
  return (
    assignment?.assigned_to_full_name ||
    assignment?.assigned_to_username ||
    assignment?.assigned_to?.username ||
    "Assigned officer"
  );
}

function getAssignedDesignation(assignment) {
  return (
    assignment?.assigned_to_designation ||
    assignment?.assigned_to?.designation ||
    ""
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

function getStageIcon(stage) {
  if (stage === "APPROVAL") {
    return <GavelOutlinedIcon />;
  }

  return <RateReviewOutlinedIcon />;
}

function getStageDescription(stage) {
  if (stage === "APPROVAL") {
    return "Review and take the final approval decision.";
  }

  return "Review the notesheet, add your official remark, and forward it when ready.";
}

export default function Workflow() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("workflow/my-assignments/");

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        setAssignments(data);
      } catch (error) {
        if (error.response?.status === 401) {
          setError(
            "Your session has expired. Please sign in again."
          );
        } else {
          setError(
            "Unable to load your workflow assignments. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const activeAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) => assignment.status === "ACTIVE"
      ),
    [assignments]
  );

  const reviewAssignments = useMemo(
    () =>
      activeAssignments.filter(
        (assignment) => assignment.stage === "REVIEW"
      ),
    [activeAssignments]
  );

  const approvalAssignments = useMemo(
    () =>
      activeAssignments.filter(
        (assignment) => assignment.stage === "APPROVAL"
      ),
    [activeAssignments]
  );

  const completedAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) => assignment.status === "COMPLETED"
      ),
    [assignments]
  );

  const renderAssignment = (assignment) => {
    const notesheetId = getNotesheetId(assignment);
    const stage = assignment.stage;
    const status = assignment.status;

    return (
      <Card
        key={assignment.id}
        elevation={0}
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: 2,
          backgroundColor: "#ffffff",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack spacing={2}>
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                justifyContent: "space-between",
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
                gap: 1.5,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 0.5,
                    fontWeight: 600,
                  }}
                >
                  {getNotesheetReference(assignment)}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 650,
                    color: "#1f2937",
                    overflowWrap: "anywhere",
                  }}
                >
                  {getNotesheetTitle(assignment)}
                </Typography>
              </Box>

              <Chip
                icon={getStageIcon(stage)}
                label={
                  stageLabels[stage] || stage || "Workflow"
                }
                size="small"
                sx={{
                  fontWeight: 600,
                  color:
                    stage === "APPROVAL"
                      ? "#6a1b9a"
                      : "#1565c0",
                  backgroundColor:
                    stage === "APPROVAL"
                      ? "#f5edfa"
                      : "#eaf2ff",
                  border: "1px solid #dbe4f0",
                  flexShrink: 0,
                }}
              />
            </Box>

            <Divider />

            {/* Assignment information */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Assigned Officer
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: "#1f2937",
                    overflowWrap: "anywhere",
                  }}
                >
                  {getAssignedOfficer(assignment)}
                </Typography>

                {getAssignedDesignation(assignment) && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.25 }}
                  >
                    {getAssignedDesignation(assignment)}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Assigned At
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#374151",
                  }}
                >
                  {formatDate(assignment.assigned_at)}
                </Typography>
              </Box>
            </Box>

            {/* Current task */}
            <Box
              sx={{
                p: 1.75,
                borderRadius: 1.5,
                backgroundColor: "#f5f7fa",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "#1f2937",
                  mb: 0.5,
                }}
              >
                Current task
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {getStageDescription(stage)}
              </Typography>
            </Box>

            {/* Action */}
            {notesheetId ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: {
                    xs: "stretch",
                    sm: "flex-end",
                  },
                }}
              >
                <Button
                  component={Link}
                  href={`/notesheets/${notesheetId}`}
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                  sx={{
                    maxWidth: {
                      xs: "100%",
                      sm: 190,
                    },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Open Notesheet
                </Button>
              </Box>
            ) : (
              <Alert severity="warning">
                This assignment does not contain a valid notesheet
                reference.
              </Alert>
            )}

            {status === "COMPLETED" && (
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Completed: {formatDate(assignment.completed_at)}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppShell>
      <Box>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1f2937",
              mb: 0.75,
            }}
          >
            My Work
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
          >
            View notesheets currently assigned to you for review or
            approval.
          </Typography>
        </Box>

        {/* Loading */}
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 10,
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        {/* Error */}
        {!loading && error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Summary */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                },
                gap: 2,
                mb: 4,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  backgroundColor: "#ffffff",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Active Assignments
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#1565c0",
                    }}
                  >
                    {activeAssignments.length}
                  </Typography>
                </CardContent>
              </Card>

              <Card
                elevation={0}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  backgroundColor: "#ffffff",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Pending Review
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#1565c0",
                    }}
                  >
                    {reviewAssignments.length}
                  </Typography>
                </CardContent>
              </Card>

              <Card
                elevation={0}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  backgroundColor: "#ffffff",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Pending Approval
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#6a1b9a",
                    }}
                  >
                    {approvalAssignments.length}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Review assignments */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <RateReviewOutlinedIcon
                  sx={{ color: "#1565c0" }}
                />

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 650,
                    color: "#1f2937",
                  }}
                >
                  Pending Review
                </Typography>
              </Box>

              {reviewAssignments.length > 0 ? (
                <Stack spacing={2}>
                  {reviewAssignments.map(renderAssignment)}
                </Stack>
              ) : (
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <CardContent sx={{ py: 4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: 1,
                      }}
                    >
                      <AssignmentOutlinedIcon
                        sx={{
                          fontSize: 40,
                          color: "#9ca3af",
                        }}
                      />

                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600 }}
                      >
                        No notesheets are awaiting your review.
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        New review assignments will appear here.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>

            {/* Approval assignments */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <GavelOutlinedIcon
                  sx={{ color: "#6a1b9a" }}
                />

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 650,
                    color: "#1f2937",
                  }}
                >
                  Pending Approval
                </Typography>
              </Box>

              {approvalAssignments.length > 0 ? (
                <Stack spacing={2}>
                  {approvalAssignments.map(renderAssignment)}
                </Stack>
              ) : (
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <CardContent sx={{ py: 4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: 1,
                      }}
                    >
                      <GavelOutlinedIcon
                        sx={{
                          fontSize: 40,
                          color: "#9ca3af",
                        }}
                      />

                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600 }}
                      >
                        No notesheets are awaiting your approval.
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Approval assignments will appear here when
                        a reviewer forwards a notesheet to you.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>

            {/* Completed assignments */}
            {completedAssignments.length > 0 && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <CheckCircleIcon
                    sx={{ color: "#4b5563" }}
                  />

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 650,
                      color: "#1f2937",
                    }}
                  >
                    Completed Assignments
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {completedAssignments.map(renderAssignment)}
                </Stack>
              </Box>
            )}
          </>
        )}
      </Box>
    </AppShell>
  );
}