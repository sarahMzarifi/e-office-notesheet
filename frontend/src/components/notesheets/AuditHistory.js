import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

const actionLabels = {
  NOTESHEET_CREATED: "Notesheet Created",
  NOTESHEET_DISPATCHED: "Notesheet Dispatched",
  REVIEWER_ASSIGNED: "Reviewer Assigned",
  COMMENT_ADDED: "Review Remark Added",
  CLARIFICATION_REQUESTED:
    "Clarification Requested",
  RESPONSE_SUBMITTED: "Response Submitted",
  REVIEW_FORWARDED: "Forwarded for Approval",
  APPROVAL_GRANTED: "Approval Granted",
  APPROVAL_REJECTED: "Approval Rejected",
  NOTESHEET_FINALIZED: "Notesheet Finalized",
};

const statusLabels = {
  DRAFT: "Draft",
  UNDER_REVIEW: "Under Review",
  WAITING_FOR_RESPONSE: "Waiting for Response",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  FINALIZED: "Finalized",
};

const formatActionLabel = (actionType) => {
  if (actionLabels[actionType]) {
    return actionLabels[actionType];
  }

  return actionType
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const formatStatus = (status) => {
  if (!status) {
    return "";
  }

  return statusLabels[status] || status;
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const getActorName = (event) => {
  if (event.actor_full_name?.trim()) {
    return event.actor_full_name;
  }

  if (event.actor_username?.trim()) {
    return event.actor_username;
  }

  return "System";
};

const getActionChipColor = (actionType) => {
  if (actionType === "APPROVAL_GRANTED") {
    return "success";
  }

  if (actionType === "APPROVAL_REJECTED") {
    return "error";
  }

  if (actionType === "NOTESHEET_FINALIZED") {
    return "success";
  }

  if (
    actionType === "CLARIFICATION_REQUESTED"
  ) {
    return "warning";
  }

  return "default";
};

export default function AuditHistory({
  auditEvents = [],
}) {
  const events = [...auditEvents].sort(
    (first, second) => {
      const firstDate = new Date(
        first.created_at
      ).getTime();

      const secondDate = new Date(
        second.created_at
      ).getTime();

      return firstDate - secondDate;
    }
  );

  return (
    <Card
      elevation={0}
      sx={{
        mt: 2,
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        backgroundColor: "#ffffff",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#1f2937",
            mb: 0.75,
          }}
        >
          Audit History
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2.5 }}
        >
          Chronological record of actions performed
          on this notesheet.
        </Typography>

        <Divider sx={{ mb: 2.5 }} />

        {events.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            No audit events have been recorded.
          </Typography>
        ) : (
          <Stack spacing={0}>
            {events.map((event, index) => {
              const actionLabel =
                formatActionLabel(
                  event.action_type
                );

              const actorName =
                getActorName(event);

              const actorDesignation =
                event.actor_designation?.trim();

              const fromStatus = formatStatus(
                event.from_status
              );

              const toStatus = formatStatus(
                event.to_status
              );

              return (
                <Box key={event.id}>
                  <Box
                    sx={{
                      py: 2,
                      display: "flex",
                      flexDirection: {
                        xs: "column",
                        sm: "row",
                      },
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: "#1565c0",
                        flexShrink: 0,
                        mt: 0.75,
                      }}
                    />

                    <Box sx={{ flex: 1 }}>
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
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: "#1f2937",
                          }}
                        >
                          {actionLabel}
                        </Typography>

                        <Chip
                          label={actionLabel}
                          size="small"
                          color={getActionChipColor(
                            event.action_type
                          )}
                          variant="outlined"
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.75,
                          color: "#374151",
                        }}
                      >
                        {actorName}
                      </Typography>

                      {actorDesignation && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {actorDesignation}
                        </Typography>
                      )}

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          mt: 0.75,
                        }}
                      >
                        {formatDateTime(
                          event.created_at
                        )}
                      </Typography>

                      {(fromStatus ||
                        toStatus) && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {fromStatus
                            ? fromStatus
                            : "—"}{" "}
                          →{" "}
                          {toStatus
                            ? toStatus
                            : "—"}
                        </Typography>
                      )}

                      {event.details &&
                        Object.keys(
                          event.details
                        ).length > 0 && (
                          <Box
                            sx={{
                              mt: 1,
                              p: 1.25,
                              borderRadius: 1,
                              backgroundColor:
                                "#f8fafc",
                            }}
                          >
                            {Object.entries(
                              event.details
                            ).map(
                              ([
                                key,
                                value,
                              ]) => (
                                <Typography
                                  key={key}
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display:
                                      "block",
                                  }}
                                >
                                  <strong>
                                    {key
                                      .replaceAll(
                                        "_",
                                        " "
                                      )
                                      .replace(
                                        /\b\w/g,
                                        (
                                          letter
                                        ) =>
                                          letter.toUpperCase()
                                      )}
                                    :
                                  </strong>{" "}
                                  {String(
                                    value
                                  )}
                                </Typography>
                              )
                            )}
                          </Box>
                        )}
                    </Box>
                  </Box>

                  {index <
                    events.length - 1 && (
                    <Divider />
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}