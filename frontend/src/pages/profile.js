import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from "@mui/material";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

import AppShell from "../components/layout/AppShell";
import api from "../services/api";

function getDepartmentName(department) {
  if (!department) {
    return "Not assigned";
  }

  if (typeof department === "object") {
    return (
      department.name ||
      department.code ||
      "Assigned"
    );
  }

  return `Department ID: ${department}`;
}

function getHierarchyLabel(level) {
  if (level === 1) {
    return "Initiator / Junior";
  }

  if (level === 2) {
    return "Senior Reviewer";
  }

  if (level === 3) {
    return "Head of Department";
  }

  return `Level ${level}`;
}

function getDisplayName(user) {
  if (user?.first_name || user?.last_name) {
    return `${user.first_name || ""} ${
      user.last_name || ""
    }`.trim();
  }

  if (user?.username) {
    return user.username;
  }

  return "—";
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("users/me/");

        setUser(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          setError(
            "Your session has expired. Please sign in again."
          );
        } else {
          setError(
            "Unable to load your profile. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const profileFields = user
    ? [
        {
          label: "Full Name",
          value: getDisplayName(user),
          icon: <PersonOutlineOutlinedIcon />,
        },
        {
          label: "Username",
          value: user.username || "—",
          icon: <AccountCircleOutlinedIcon />,
        },
        {
          label: "Email",
          value: user.email || "—",
          icon: <EmailOutlinedIcon />,
        },
        {
          label: "Designation",
          value: user.designation || "Not specified",
          icon: <BadgeOutlinedIcon />,
        },
        {
          label: "Department",
          value: getDepartmentName(user.department),
          icon: <BusinessOutlinedIcon />,
        },
        {
          label: "Hierarchy",
          value: getHierarchyLabel(user.hierarchy_level),
          icon: <SecurityOutlinedIcon />,
        },
      ]
    : [];

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
            My Profile
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
          >
            View your account and organizational information.
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
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {/* Profile */}
        {!loading && !error && user && (
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              backgroundColor: "#ffffff",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {/* Profile Heading */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#eaf2ff",
                    color: "#1565c0",
                    flexShrink: 0,
                  }}
                >
                  <AccountCircleOutlinedIcon
                    sx={{ fontSize: 34 }}
                  />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#1f2937",
                    }}
                  >
                    {getDisplayName(user)}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {user.role || "User"}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Profile Information */}
              <Grid container spacing={2}>
                {profileFields.map((field) => (
                  <Grid
                    key={field.label}
                    size={{ xs: 12, sm: 6 }}
                  >
                    <Box
                      sx={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 1.5,
                        p: 2,
                        height: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            color: "#1565c0",
                            display: "flex",
                            mt: 0.25,
                          }}
                        >
                          {field.icon}
                        </Box>

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
                            {field.label}
                          </Typography>

                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 500,
                              color: "#1f2937",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {field.value}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Account Status */}
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 1.5,
                  backgroundColor: "#f5f7fa",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 0.5,
                    fontWeight: 600,
                  }}
                >
                  Account Status
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: user.is_active
                      ? "#276438"
                      : "#9a3d3d",
                  }}
                >
                  {user.is_active
                    ? "Active"
                    : "Inactive"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </AppShell>
  );
}