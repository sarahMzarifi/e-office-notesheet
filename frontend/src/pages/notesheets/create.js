import { useState } from "react";

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

import AppShell from "../../components/layout/AppShell";
import api from "../../services/api";

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

export default function CreateNotesheet() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [priority, setPriority] = useState("NORMAL");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

      const response = await api.post("notesheets/", {
        title: trimmedTitle,
        category,
        priority,
        body: trimmedBody,
      });

      router.push(`/notesheets/${response.data.id}`);
    } catch (error) {
      if (error.response?.status === 400) {
        const data = error.response.data;

        if (typeof data?.detail === "string") {
          setError(data.detail);
        } else {
          setError("Please check the entered information.");
        }
      } else if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please sign in again."
        );
      } else {
        setError("Unable to create the notesheet.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <Box>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/notesheets")}
            sx={{
              mb: 1.5,
              textTransform: "none",
              color: "#4b5563",
            }}
          >
            Back to Notesheets
          </Button>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1f2937",
              mb: 0.75,
            }}
          >
            Create Notesheet
          </Typography>

          <Typography color="text.secondary">
            Prepare a new notesheet and save it as a draft.
          </Typography>
        </Box>

        {/* Form */}
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
                {/* Title */}
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

                {/* Category + Priority */}
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
                    <InputLabel>Category</InputLabel>

                    <Select
                      value={category}
                      label="Category"
                      onChange={(event) =>
                        setCategory(event.target.value)
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
                    <InputLabel>Priority</InputLabel>

                    <Select
                      value={priority}
                      label="Priority"
                      onChange={(event) =>
                        setPriority(event.target.value)
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

                {/* Body */}
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

                {error && (
                  <Alert severity="error">
                    {error}
                  </Alert>
                )}

                {/* Actions */}
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
                      router.push("/notesheets")
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
                      : "Save as Draft"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AppShell>
  );
}