import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

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

export default function FinalDecision({
  notesheet,
  disposition,
  isFinalized,
}) {
  if (!isFinalized) {
    return null;
  }

  const isApproved =
    disposition?.decision === "APPROVED";

  const decisionColor = isApproved
    ? "#2e6b3e"
    : "#9a3d3d";

  const decisionBackground = isApproved
    ? "#edf7ef"
    : "#fff1f1";

  const decisionBorder = isApproved
    ? "#9ac7a5"
    : "#d9a0a0";

  const decisionLabel = isApproved
    ? "APPROVED"
    : "REJECTED";

  const DecisionIcon = isApproved
    ? CheckCircleIcon
    : CancelIcon;

  return (
    <>
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${decisionBorder}`,
          borderRadius: 2,
          backgroundColor: decisionBackground,
          mt: 2,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
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
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: decisionColor,
                }}
              >
                Final Decision
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#4b5563",
                  mt: 0.5,
                }}
              >
                This notesheet has been
                finalized and is now read-only.
              </Typography>
            </Box>

            <Chip
              icon={
                <DecisionIcon
                  sx={{
                    color: `${decisionColor} !important`,
                  }}
                />
              }
              label={decisionLabel}
              sx={{
                color: decisionColor,
                backgroundColor: decisionBackground,
                border: `1px solid ${decisionBorder}`,
                fontWeight: 700,
                px: 0.5,
              }}
            />
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Approval Stamp */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 560,
                border: `2px solid ${decisionColor}`,
                borderRadius: 2,
                p: {
                  xs: 2.5,
                  sm: 3.5,
                },
                textAlign: "center",
                backgroundColor: decisionBackground,
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  display: "block",
                  color: decisionColor,
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                }}
              >
                FINAL APPROVAL RECORD
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 800,
                  color: decisionColor,
                  letterSpacing: "0.04em",
                }}
              >
                {decisionLabel}
              </Typography>

              <Divider
                sx={{
                  my: 2,
                  borderColor: decisionBorder,
                }}
              />

              <Stack
                spacing={1.25}
                sx={{
                  textAlign: "left",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Approved / Decided By
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: "#1f2937",
                    }}
                  >
                    {disposition.approver_full_name ||
                      "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Designation
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {disposition.approver_designation ||
                      "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Department
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {disposition.approver_department_code
                      ? `${disposition.approver_department_code} - ${disposition.approver_department_name}`
                      : disposition
                          .approver_department_name ||
                        "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Decision Date & Time
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {formatDateTime(
                      disposition.decided_at
                    )}
                  </Typography>
                </Box>
              </Stack>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 2.5,
                  color: "#6b7280",
                }}
              >
                This visual approval record is
                part of the finalized notesheet
                record.
              </Typography>
            </Box>
          </Box>

          {/* Rejection Justification */}
          {disposition.decision === "REJECTED" &&
            disposition.justification && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #d9a0a0",
                  backgroundColor: "#fffafa",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: "#9a3d3d",
                    mb: 1,
                  }}
                >
                  Rejection Justification
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: "#374151",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {disposition.justification}
                </Typography>
              </Box>
            )}
        </CardContent>
      </Card>

      {/* Finalized Information */}
      {notesheet.status === "FINALIZED" && (
        <Box
          sx={{
            mt: 2,
            px: 1,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Finalized records are read-only.
            Historical workflow actions and
            remarks cannot be modified.
          </Typography>
        </Box>
      )}
    </>
  );
}