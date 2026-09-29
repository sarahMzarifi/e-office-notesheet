import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import AppShell from "../../components/layout/AppShell";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ApprovalDecisionForm from "../../components/notesheets/ApprovalDecisionForm";
import AuditHistory from "../../components/notesheets/AuditHistory";
import CommentForm from "../../components/notesheets/CommentForm";
import FinalDecision from "../../components/notesheets/FinalDecision";
import NotesheetBody from "../../components/notesheets/NotesheetBody";
import NotesheetHeader from "../../components/notesheets/NotesheetHeader";
import NotesheetMetadata from "../../components/notesheets/NotesheetMetadata";
import ResponseForm from "../../components/notesheets/ResponseForm";
import ReviewRemarks from "../../components/notesheets/ReviewRemarks";
import WorkflowSection from "../../components/notesheets/WorkflowSection";

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

export default function NotesheetDetail() {
  const router = useRouter();
  const { user } = useAuth();

  const [notesheet, setNotesheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentSuccess, setCommentSuccess] = useState("");
  const [submittingComment, setSubmittingComment] =
    useState(false);

  const [responseText, setResponseText] = useState("");
  const [responseError, setResponseError] = useState("");
  const [responseSuccess, setResponseSuccess] = useState("");
  const [submittingResponse, setSubmittingResponse] =
    useState(false);

  const [forwardError, setForwardError] = useState("");
  const [forwardSuccess, setForwardSuccess] = useState("");
  const [forwarding, setForwarding] = useState(false);

  const [dispatchError, setDispatchError] = useState("");
  const [dispatching, setDispatching] = useState(false);

  const [justification, setJustification] =
    useState("");
  const [decisionError, setDecisionError] =
    useState("");
  const [decisionSuccess, setDecisionSuccess] =
    useState("");
  const [submittingDecision, setSubmittingDecision] =
    useState(false);

  const fetchNotesheet = async () => {
    if (!router.isReady) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `notesheets/${router.query.id}/`
      );

      setNotesheet(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please sign in again."
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

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    fetchNotesheet();
  }, [router.isReady, router.query.id]);

  const status =
    statusStyles[notesheet?.status] ||
    statusStyles.DRAFT;

  const disposition = notesheet?.disposition;

  const isFinalized =
    notesheet?.status === "FINALIZED" &&
    Boolean(disposition);

  const isDraftCreator =
    notesheet?.status === "DRAFT" &&
    notesheet?.creator === user?.id;

  const activeAssignment =
    notesheet?.workflow_assignments?.find(
      (assignment) =>
        assignment.status === "ACTIVE" &&
        assignment.assigned_to === user?.id
    );

  const activeApprovalAssignment =
    notesheet?.workflow_assignments?.find(
      (assignment) =>
        assignment.status === "ACTIVE" &&
        assignment.stage === "APPROVAL" &&
        assignment.assigned_to === user?.id
    );

  const canAddComment =
    notesheet?.status === "UNDER_REVIEW" &&
    activeAssignment?.stage === "REVIEW" &&
    Boolean(activeAssignment);

  const clarificationComment =
    notesheet?.comments?.find(
      (comment) =>
        comment.action_type ===
          "CLARIFICATION_REQUEST" &&
        comment.response_required === true
    );

  const canRespond =
    notesheet?.status === "WAITING_FOR_RESPONSE" &&
    notesheet?.creator === user?.id &&
    Boolean(clarificationComment);

  const canForward =
    notesheet?.status === "UNDER_REVIEW" &&
    activeAssignment?.stage === "REVIEW" &&
    Boolean(activeAssignment);

  const canDecide =
    notesheet?.status === "UNDER_REVIEW" &&
    Boolean(activeApprovalAssignment);

  const handleEditDraft = () => {
    router.push(
      `/notesheets/edit/${router.query.id}`
    );
  };

  const handleDispatch = async () => {
    if (!isDraftCreator) {
      setDispatchError(
        "Only the notesheet creator can dispatch this draft."
      );
      return;
    }

    try {
      setDispatching(true);
      setDispatchError("");

      await api.post(
        `notesheets/${router.query.id}/dispatch/`
      );

      await fetchNotesheet();
    } catch (error) {
      const responseDetail =
        error.response?.data?.detail;

      if (responseDetail) {
        setDispatchError(responseDetail);
      } else if (error.response?.status === 401) {
        setDispatchError(
          "Your session has expired. Please sign in again."
        );
      } else if (error.response?.status === 403) {
        setDispatchError(
          "You are not authorized to dispatch this notesheet."
        );
      } else if (error.response?.status === 404) {
        setDispatchError(
          "The notesheet could not be found."
        );
      } else {
        setDispatchError(
          "Unable to dispatch the notesheet. Please try again."
        );
      }
    } finally {
      setDispatching(false);
    }
  };

  const handleCommentSubmit = async (
    event,
    actionType
  ) => {
    event.preventDefault();

    const content = commentText.trim();

    if (!content) {
      setCommentError(
        actionType === "CLARIFICATION_REQUEST"
          ? "Please enter the clarification request."
          : "Please enter a comment."
      );

      return;
    }

    try {
      setSubmittingComment(true);
      setCommentError("");
      setCommentSuccess("");

      await api.post(
        `workflow/notesheets/${router.query.id}/comments/`,
        {
          content,
          action_type: actionType,
        }
      );

      setCommentText("");

      setCommentSuccess(
        actionType === "CLARIFICATION_REQUEST"
          ? "Clarification request submitted successfully."
          : "Comment added successfully."
      );

      await fetchNotesheet();
    } catch (error) {
      const responseDetail =
        error.response?.data?.detail;

      const contentError =
        error.response?.data?.content;

      if (typeof contentError === "string") {
        setCommentError(contentError);
      } else if (Array.isArray(contentError)) {
        setCommentError(contentError[0]);
      } else if (responseDetail) {
        setCommentError(responseDetail);
      } else {
        setCommentError(
          actionType === "CLARIFICATION_REQUEST"
            ? "Unable to submit the clarification request. Please try again."
            : "Unable to add the comment. Please try again."
        );
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleResponseSubmit = async (event) => {
    event.preventDefault();

    const content = responseText.trim();

    if (!content) {
      setResponseError("Please enter your response.");
      return;
    }

    if (!clarificationComment) {
      setResponseError(
        "The clarification request could not be found."
      );
      return;
    }

    try {
      setSubmittingResponse(true);
      setResponseError("");
      setResponseSuccess("");

      await api.post(
        `workflow/notesheets/${router.query.id}/comments/`,
        {
          content,
          action_type: "RESPONSE",
          parent_comment:
            clarificationComment.id,
        }
      );

      setResponseText("");

      setResponseSuccess(
        "Response submitted successfully."
      );

      await fetchNotesheet();
    } catch (error) {
      const responseDetail =
        error.response?.data?.detail;

      const contentError =
        error.response?.data?.content;

      const parentCommentError =
        error.response?.data?.parent_comment;

      if (typeof contentError === "string") {
        setResponseError(contentError);
      } else if (Array.isArray(contentError)) {
        setResponseError(contentError[0]);
      } else if (
        typeof parentCommentError === "string"
      ) {
        setResponseError(parentCommentError);
      } else if (
        Array.isArray(parentCommentError)
      ) {
        setResponseError(parentCommentError[0]);
      } else if (responseDetail) {
        setResponseError(responseDetail);
      } else {
        setResponseError(
          "Unable to submit the response. Please try again."
        );
      }
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleForward = async () => {
    if (!activeAssignment) {
      setForwardError(
        "No active review assignment is available."
      );
      return;
    }

    try {
      setForwarding(true);
      setForwardError("");
      setForwardSuccess("");

      await api.post(
        `workflow/assignments/${activeAssignment.id}/forward/`
      );

      setForwardSuccess(
        "Notesheet forwarded to the approval authority successfully."
      );

      await fetchNotesheet();
    } catch (error) {
      const responseDetail =
        error.response?.data?.detail;

      if (responseDetail) {
        setForwardError(responseDetail);
      } else {
        setForwardError(
          "Unable to forward the notesheet. Please try again."
        );
      }
    } finally {
      setForwarding(false);
    }
  };

  const handleDecision = async (decision) => {
    if (!activeApprovalAssignment) {
      setDecisionError(
        "No active approval assignment is available."
      );
      return;
    }

    const trimmedJustification =
      justification.trim();

    if (
      decision === "REJECTED" &&
      !trimmedJustification
    ) {
      setDecisionError(
        "Rejection justification is required."
      );
      return;
    }

    try {
      setSubmittingDecision(true);
      setDecisionError("");
      setDecisionSuccess("");

      await api.post(
        `workflow/assignments/${activeApprovalAssignment.id}/decide/`,
        {
          decision,
          justification:
            decision === "REJECTED"
              ? trimmedJustification
              : "",
        }
      );

      setDecisionSuccess(
        decision === "APPROVED"
          ? "Notesheet approved successfully."
          : "Notesheet rejected successfully."
      );

      setJustification("");

      await fetchNotesheet();
    } catch (error) {
      const responseDetail =
        error.response?.data?.detail;

      const justificationError =
        error.response?.data?.justification;

      const decisionFieldError =
        error.response?.data?.decision;

      if (
        typeof justificationError === "string"
      ) {
        setDecisionError(justificationError);
      } else if (
        Array.isArray(justificationError)
      ) {
        setDecisionError(
          justificationError[0]
        );
      } else if (
        typeof decisionFieldError === "string"
      ) {
        setDecisionError(decisionFieldError);
      } else if (
        Array.isArray(decisionFieldError)
      ) {
        setDecisionError(
          decisionFieldError[0]
        );
      } else if (responseDetail) {
        setDecisionError(responseDetail);
      } else {
        setDecisionError(
          "Unable to process the decision. Please try again."
        );
      }
    } finally {
      setSubmittingDecision(false);
    }
  };

  return (
    <AppShell>
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{
            mb: 2.5,
            color: "#4b5563",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Back to Notesheets
        </Button>

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

        {!loading && error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {!loading &&
          !error &&
          notesheet && (
            <Box>
              <NotesheetHeader
                notesheet={notesheet}
                status={status}
              />

              {isDraftCreator && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1.5,
                    mt: 2,
                    mb: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleEditDraft}
                    disabled={dispatching}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Edit Draft
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleDispatch}
                    disabled={dispatching}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    {dispatching
                      ? "Dispatching..."
                      : "Dispatch"}
                  </Button>
                </Box>
              )}

              {dispatchError && (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                >
                  {dispatchError}
                </Alert>
              )}

              <NotesheetMetadata
                notesheet={notesheet}
              />

              <NotesheetBody
                notesheet={notesheet}
              />

              <WorkflowSection
                notesheet={notesheet}
                canForward={canForward}
                forwarding={forwarding}
                forwardError={forwardError}
                forwardSuccess={forwardSuccess}
                onForward={handleForward}
              />

              <ReviewRemarks
                notesheet={notesheet}
                clarificationComment={
                  clarificationComment
                }
                canRespond={canRespond}
                responseText={responseText}
                responseError={responseError}
                responseSuccess={
                  responseSuccess
                }
                submittingResponse={
                  submittingResponse
                }
                onResponseChange={(event) => {
                  setResponseText(
                    event.target.value
                  );
                  setResponseError("");
                  setResponseSuccess("");
                }}
                onResponseSubmit={
                  handleResponseSubmit
                }
              />

              {canAddComment && (
                <CommentForm
                  commentText={commentText}
                  commentError={commentError}
                  commentSuccess={commentSuccess}
                  submittingComment={
                    submittingComment
                  }
                  onCommentChange={(event) => {
                    setCommentText(
                      event.target.value
                    );
                    setCommentError("");
                    setCommentSuccess("");
                  }}
                  onCommentSubmit={(event) =>
                    handleCommentSubmit(
                      event,
                      "COMMENT"
                    )
                  }
                  onClarificationRequest={(event) =>
                    handleCommentSubmit(
                      event,
                      "CLARIFICATION_REQUEST"
                    )
                  }
                />
              )}

              {canDecide && (
                <ApprovalDecisionForm
                  justification={justification}
                  decisionError={decisionError}
                  decisionSuccess={decisionSuccess}
                  submittingDecision={
                    submittingDecision
                  }
                  onJustificationChange={(event) => {
                    setJustification(
                      event.target.value
                    );
                    setDecisionError("");
                    setDecisionSuccess("");
                  }}
                  onApprove={() =>
                    handleDecision("APPROVED")
                  }
                  onReject={() =>
                    handleDecision("REJECTED")
                  }
                />
              )}

              <FinalDecision
                notesheet={notesheet}
                disposition={disposition}
                isFinalized={isFinalized}
              />

              <AuditHistory
                auditEvents={notesheet.audit_events}
              />
            </Box>
          )}
      </Box>
    </AppShell>
  );
}