import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

import AppShell from "../../../components/layout/AppShell";
import api from "../../../services/api";

const categories = [
  {
    value: "GENERAL",
    label: "General",
  },
  {
    value: "FINANCE",
    label: "Finance",
  },
  {
    value: "HR",
    label: "Human Resources",
  },
  {
    value: "PROCUREMENT",
    label: "Procurement",
  },
  {
    value: "ADMINISTRATION",
    label: "Administration",
  },
  {
    value: "TECHNICAL",
    label: "Technical",
  },
];

const priorities = [
  {
    value: "NORMAL",
    label: "Normal",
  },
  {
    value: "URGENT",
    label: "Urgent",
  },
  {
    value: "IMMEDIATE",
    label: "Immediate",
  },
];

export default function EditNotesheet() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [priority, setPriority] = useState("NORMAL");
  const [body, setBody] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const fetchNotesheet = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `notesheets/${router.query.id}/`
        );

        const notesheet = response.data;

        if (notesheet.status !== "DRAFT") {
          setError(
            "Only draft notesheets can be edited."
          );
          return;
        }

        setTitle(notesheet.title || "");
        setCategory(notesheet.category || "GENERAL");
        setPriority(notesheet.priority || "NORMAL");
        setBody(notesheet.body || "");
      } catch (error) {
        if (error.response?.status === 401) {
          setError(
            "Your session has expired. Please sign in again."
          );
        } else if (error.response?.status === 403) {
          setError(
            "You are not authorized to edit this notesheet."
          );
        } else if (error.response?.status === 404) {
          setError("Notesheet not found.");
        } else {
          setError("Unable to load the notesheet.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotesheet();
  }, [router.isReady, router.query.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle) {
      setError("Please enter a notesheet title.");
      return;
    }

    if (!trimmedBody) {
      setError("Please enter the notesheet content.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.patch(
        `notesheets/${router.query.id}/edit/`,
        {
          title: trimmedTitle,
          category,
          priority,
          body: trimmedBody,
        }
      );

      setSuccess("Notesheet updated successfully.");

      setTimeout(() => {
        router.push(
          `/notesheets/${router.query.id}`
        );
      }, 500);
    } catch (error) {
      if (error.response?.status === 400) {
        const data = error.response.data;

        if (typeof data?.detail === "string") {
          setError(data.detail);
        } else {
          setError(
            "Please check the entered information."
          );
        }
      } else if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please sign in again."
        );
      } else if (error.response?.status === 403) {
        setError(
          "You are not authorized to edit this notesheet."
        );
      } else if (error.response?.status === 404) {
        setError("Notesheet not found.");
      } else {
        setError(
          "Unable to update the notesheet. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <Box>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              router.push(
                `/notesheets/${router.query.id}`
              )
            }
            sx={{
              mb: 1.5,
              textTransform: "none",
              color: "#4b5563",
            }}
          >
            Back to Notesheet
          </Button>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1f2937",
              mb: 0.75,
            }}
          >
            Edit Draft
          </Typography>

          <Typography color="text.secondary">
            Update the notesheet before dispatching it
            for review.
          </Typography>
        </Box>

        {loading && (
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              backgroundColor: "#ffffff",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography color="text.secondary">
                Loading notesheet...
              </Typography>
            </CardContent>
          </Card>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              backgroundColor: "#ffffff",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box
                component="form"
                onSubmit={handleSubmit}
              >
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="Enter notesheet title"
                    required
                    disabled={saving}
                  />

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={2}
                  >
                    <FormControl
                      fullWidth
                      disabled={saving}
                    >
                      <InputLabel>
                        Category
                      </InputLabel>

                      <Select
                        value={category}
                        label="Category"
                        onChange={(event) =>
                          setCategory(
                            event.target.value
                          )
                        }
                      >
                        {categories.map((item) => (
                          <MenuItem
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl
                      fullWidth
                      disabled={saving}
                    >
                      <InputLabel>
                        Priority
                      </InputLabel>

                      <Select
                        value={priority}
                        label="Priority"
                        onChange={(event) =>
                          setPriority(
                            event.target.value
                          )
                        }
                      >
                        {priorities.map((item) => (
                          <MenuItem
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  <TextField
                    fullWidth
                    label="Notesheet Content"
                    value={body}
                    onChange={(event) =>
                      setBody(event.target.value)
                    }
                    placeholder="Enter the details of the notesheet..."
                    multiline
                    minRows={10}
                    maxRows={20}
                    required
                    disabled={saving}
                  />

                  {success && (
                    <Alert severity="success">
                      {success}
                    </Alert>
                  )}

                  {error && (
                    <Alert severity="error">
                      {error}
                    </Alert>
                  )}

                  <Stack
                    direction={{
                      xs: "column-reverse",
                      sm: "row",
                    }}
                    spacing={1.5}
                    sx={{
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() =>
                        router.push(
                          `/notesheets/${router.query.id}`
                        )
                      }
                      disabled={saving}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={saving}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </AppShell>
  );
}