import { useEffect, useState } from "react";

import Link from "next/link";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import AppShell from "../components/layout/AppShell";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const statusStyles = {
  DRAFT: {
    label: "Draft",
    color: "#8a6500",
    background: "#fff8e1",
    border: "#e8c96a",
  },

  UNDER_REVIEW: {
    label: "Under Review",
    color: "#806000",
    background: "#fff8e1",
    border: "#e4c65a",
  },

  WAITING_FOR_RESPONSE: {
    label: "Waiting for Response",
    color: "#806000",
    background: "#fff8e1",
    border: "#e4c65a",
  },

  APPROVED: {
    label: "Approved",
    color: "#2e6b3e",
    background: "#edf7ef",
    border: "#9ac7a5",
  },

  FINALIZED: {
    label: "Finalized",
    color: "#276438",
    background: "#edf7ef",
    border: "#8fbd9a",
  },

  REJECTED: {
    label: "Rejected",
    color: "#9a3d3d",
    background: "#fff1f1",
    border: "#d9a0a0",
  },
};

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

export default function Home() {
  const { user, loading: authLoading } = useAuth();

  const [notesheets, setNotesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    const fetchNotesheets = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("notesheets/list/");

        setNotesheets(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError("Unable to load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotesheets();
  }, [authLoading, user]);

  if (authLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  const totalNotesheets = notesheets.length;

  const draftCount = notesheets.filter(
    (notesheet) => notesheet.status === "DRAFT"
  ).length;

  const underReviewCount = notesheets.filter(
    (notesheet) => notesheet.status === "UNDER_REVIEW"
  ).length;

  const waitingCount = notesheets.filter(
    (notesheet) => notesheet.status === "WAITING_FOR_RESPONSE"
  ).length;

  const finalizedCount = notesheets.filter(
    (notesheet) => notesheet.status === "FINALIZED"
  ).length;

  const recentNotesheets = [...notesheets]
    .sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at) -
        new Date(a.updated_at || a.created_at)
    )
    .slice(0, 5);

  const cards = [
    {
      label: "Total Notesheets",
      value: totalNotesheets,
      description: "Notesheets available to you",
    },
    {
      label: "Drafts",
      value: draftCount,
      description: "Notesheets still being prepared",
    },
    {
      label: "Under Review",
      value: underReviewCount,
      description: "Currently in the review stage",
    },
    {
      label: "Waiting for Response",
      value: waitingCount,
      description: "Awaiting clarification response",
    },
    {
      label: "Finalized",
      value: finalizedCount,
      description: "Completed and read-only",
    },
  ];

  return (
    <AppShell>
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1f2937",
              mb: 1,
            }}
          >
            Dashboard
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user.username}.
            </Typography>

            <Button
              component={Link}
              href="/notesheets/create"
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Create Notesheet
            </Button>
          </Box>
        </Box>

        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 6,
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              useFlexGap
              sx={{
                flexWrap: "wrap",
              }}
            >
              {cards.map((card) => (
                <Card
                  key={card.label}
                  elevation={0}
                  sx={{
                    flex: "1 1 220px",
                    minWidth: 200,
                    border: "1px solid #e5e7eb",
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {card.label}
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "#1f2937",
                        mb: 0.75,
                      }}
                    >
                      {card.value}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {card.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 650,
                  color: "#1f2937",
                  mb: 1.5,
                }}
              >
                Recent Notesheets
              </Typography>

              {recentNotesheets.length === 0 ? (
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <CardContent sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No notesheets are available yet.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Stack spacing={1.5}>
                  {recentNotesheets.map((notesheet) => {
                    const status =
                      statusStyles[notesheet.status] ||
                      statusStyles.DRAFT;

                    return (
                      <Card
                        key={notesheet.id}
                        elevation={0}
                        onClick={() =>
                          (window.location.href = `/notesheets/${notesheet.id}`)
                        }
                        sx={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 2,
                          backgroundColor: "#ffffff",
                          cursor: "pointer",
                          transition: "box-shadow 0.2s ease",
                          "&:hover": {
                            boxShadow:
                              "0 4px 14px rgba(15, 23, 42, 0.08)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Stack
                            direction={{
                              xs: "column",
                              sm: "row",
                            }}
                            spacing={1.5}
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
                                  letterSpacing: "0.03em",
                                }}
                              >
                                {notesheet.reference_number}
                              </Typography>

                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 600,
                                  color: "#1f2937",
                                  mt: 0.25,
                                }}
                              >
                                {notesheet.title}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Updated{" "}
                                {formatDate(
                                  notesheet.updated_at ||
                                    notesheet.created_at
                                )}
                              </Typography>
                            </Box>

                            <Chip
                              label={status.label}
                              size="small"
                              sx={{
                                color: status.color,
                                backgroundColor: status.background,
                                border: `1px solid ${status.border}`,
                                fontWeight: 600,
                                fontSize: "0.75rem",
                              }}
                            />
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </>
        )}
      </Box>
    </AppShell>
  );
}