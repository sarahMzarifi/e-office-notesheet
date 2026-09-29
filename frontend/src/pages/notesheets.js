import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import AppShell from "../components/layout/AppShell";
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

export default function Notesheets() {
  const router = useRouter();

  const [notesheets, setNotesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const statusFilter =
    typeof router.query.status === "string"
      ? router.query.status
      : "";

  useEffect(() => {
    const fetchNotesheets = async () => {
      try {
        setError("");

        const response = await api.get("notesheets/list/");

        setNotesheets(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError("Unable to load notesheets.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotesheets();
  }, []);

  const displayedNotesheets = notesheets.filter((notesheet) => {
    const matchesStatus =
      !statusFilter || notesheet.status === statusFilter;

    const searchValue = search.trim().toLowerCase();

    const matchesSearch =
      !searchValue ||
      notesheet.title?.toLowerCase().includes(searchValue) ||
      notesheet.reference_number
        ?.toLowerCase()
        .includes(searchValue);

    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (event) => {
    const value = event.target.value;

    router.push(
      value
        ? `/notesheets?status=${value}`
        : "/notesheets",
      undefined,
      { shallow: true }
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
            {statusFilter === "DRAFT"
              ? "My Drafts"
              : "Notesheets"}
          </Typography>

          <Typography color="text.secondary">
            {statusFilter === "DRAFT"
              ? "View your saved draft notesheets."
              : "View and manage your accessible notesheets."}
          </Typography>
        </Box>

        {/* Filters */}
        {!loading && !error && (
          <Card
            elevation={0}
            sx={{
              mb: 3,
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              backgroundColor: "#ffffff",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by title or reference number"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <SearchIcon
                          sx={{
                            mr: 1,
                            color: "text.secondary",
                          }}
                        />
                      ),
                    },
                  }}
                />

                <FormControl
                  size="small"
                  sx={{
                    minWidth: { xs: "100%", sm: 210 },
                  }}
                >
                  <InputLabel>Status</InputLabel>

                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={handleStatusChange}
                  >
                    <MenuItem value="">All Statuses</MenuItem>

                    <MenuItem value="DRAFT">
                      Draft
                    </MenuItem>

                    <MenuItem value="UNDER_REVIEW">
                      Under Review
                    </MenuItem>

                    <MenuItem value="WAITING_FOR_RESPONSE">
                      Waiting for Response
                    </MenuItem>

                    <MenuItem value="APPROVED">
                      Approved
                    </MenuItem>

                    <MenuItem value="REJECTED">
                      Rejected
                    </MenuItem>

                    <MenuItem value="FINALIZED">
                      Finalized
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        {/* Error */}
        {!loading && error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {/* Result Count */}
        {!loading && !error && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Showing {displayedNotesheets.length} of{" "}
            {notesheets.length} notesheets
          </Typography>
        )}

        {/* Empty State */}
        {!loading &&
          !error &&
          displayedNotesheets.length === 0 && (
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                backgroundColor: "#ffffff",
              }}
            >
              <CardContent
                sx={{
                  py: 6,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  No notesheets found
                </Typography>

                <Typography color="text.secondary">
                  Try changing the search or status filter.
                </Typography>
              </CardContent>
            </Card>
          )}

        {/* Notesheet Cards */}
        {!loading &&
          !error &&
          displayedNotesheets.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)",
                },
                gap: 2,
              }}
            >
              {displayedNotesheets.map((notesheet) => {
                const status =
                  statusStyles[notesheet.status] ||
                  statusStyles.DRAFT;

                return (
                  <Card
                    key={notesheet.id}
                    elevation={0}
                    onClick={() =>
                      router.push(
                        `/notesheets/${notesheet.id}`
                      )
                    }
                    sx={{
                      cursor: "pointer",
                      border: `1px solid ${status.border}`,
                      borderLeft: `4px solid ${status.border}`,
                      borderRadius: 2,
                      backgroundColor: "#ffffff",
                      transition: "box-shadow 0.2s ease",
                      "&:hover": {
                        boxShadow:
                          "0 4px 14px rgba(15, 23, 42, 0.08)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Reference + Status */}
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1.5,
                        }}
                      >
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

                        <Chip
                          label={status.label}
                          size="small"
                          sx={{
                            color: status.color,
                            backgroundColor:
                              status.background,
                            border: `1px solid ${status.border}`,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        />
                      </Stack>

                      {/* Title */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 650,
                          color: "#1f2937",
                          mb: 1,
                          lineHeight: 1.35,
                        }}
                      >
                        {notesheet.title}
                      </Typography>

                      {/* Metadata */}
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          flexWrap: "wrap",
                          mb: 1.5,
                        }}
                      >
                        <Chip
                          label={notesheet.category}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: "#d1d5db",
                            color: "#4b5563",
                            fontSize: "0.72rem",
                          }}
                        />

                        <Chip
                          label={notesheet.priority}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: "#d1d5db",
                            color: "#4b5563",
                            fontSize: "0.72rem",
                          }}
                        />
                      </Stack>

                      {/* Body Preview */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.6,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: "3.2em",
                        }}
                      >
                        {notesheet.body}
                      </Typography>

                      {/* Footer */}
                      <Box
                        sx={{
                          mt: 2,
                          pt: 1.5,
                          borderTop: "1px solid #f0f0f0",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Created{" "}
                          {formatDate(notesheet.created_at)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
      </Box>
    </AppShell>
  );
}