# E-Office Notesheet Processing System

A secure role-based e-Office system for creating, reviewing, forwarding, approving, and maintaining official notesheets through a controlled digital workflow.

## Overview

The system digitizes the lifecycle of an official notesheet, from creation and dispatch to review, clarification, approval, and finalization. Access and workflow actions are enforced on the backend according to the user's role, department, hierarchy, and current workflow assignment.

The application is designed around controlled workflow progression, object-level access control, immutable records after dispatch/finalization, append-only comments, and an auditable history of important actions.

## Key Features

- Role-based authentication and authorization
- Department-based employee management
- Notesheet creation, editing, dispatch, and tracking
- Server-generated unique notesheet reference numbers
- Predefined review and approval workflow
- Reviewer assignment and controlled forwarding
- Comments and clarification requests
- Threaded responses to clarification requests
- Mandatory justification for rejection
- Approval and rejection with final decision records
- Automatic notesheet finalization after approval or rejection
- Read-only finalized notesheets
- Approver identity and department snapshots
- Business-level audit trail
- Object-level access control for notesheets and workflow actions
- JWT-based authentication
- Input validation and server-side authorization
- Responsive Material UI frontend

## Workflow

```text
Draft
  |
  v
Dispatch
  |
  v
Under Review
  |
  +---- Clarification Request
  |          |
  |          v
  |   Waiting for Response
  |          |
  |          v
  |     Under Review
  |
  v
Approval
  |
  +---- Approved
  |
  +---- Rejected
             |
             v
         Finalized
```

Once a notesheet is finalized, its workflow record becomes read-only.

## Technology Stack

### Frontend

- Next.js
- React
- Material UI (MUI)
- Axios
- JavaScript

### Backend

- Django
- Django REST Framework
- SimpleJWT
- django-cors-headers

### Database

- SQLite for development

### Development and Version Control

- Python
- Node.js
- Git
- GitHub
- Visual Studio Code

## Project Structure

```text
e-office-notesheet/
├── backend/
│   ├── accounts/
│   ├── departments/
│   ├── notesheets/
│   ├── workflow/
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Security

Security is enforced primarily at the backend rather than relying on frontend restrictions.

The system includes:

- JWT authentication
- Role and permission checks
- Department-aware access control
- Object-level authorization
- Controlled workflow transitions
- Validation of workflow actors and assignments
- Protection against unauthorized notesheet access
- Immutable comments after creation
- Immutable notesheet content after dispatch
- Read-only finalized records
- Mandatory rejection justification
- Audit events for important workflow actions
- Database constraints for active workflow assignments and approval authorities

## Getting Started

### Backend

```bash
cd backend

# Activate the virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Start the development server
python manage.py runserver
```

The backend runs by default at:

```text
http://127.0.0.1:8000/
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend runs by default at:

```text
http://localhost:3000/
```

## Notesheet Lifecycle

```text
Employee
   |
   v
Create Notesheet
   |
   v
Dispatch
   |
   v
Review
   |
   +---- Clarification <----> Response
   |
   v
Forward
   |
   v
Approval
   |
   +---- Approve
   |
   +---- Reject with justification
   |
   v
Finalized Record
```

The original notesheet body becomes immutable after dispatch. Comments are append-only, and responses to clarification requests are added as new child comments rather than modifying previous comments.

Only one active workflow assignment can exist for a notesheet at a time.

## Access Control

The system separates technical system administration from business approval authority.

### Administrator

- Creates employee accounts
- Manages departments
- Grants approval authority to eligible HODs
- Revokes approval authority
- Manages workflow reviewer assignments
- Has administrative access to system records

### Initiator / Employee

- Creates notesheets
- Saves and edits drafts
- Dispatches notesheets
- Responds to clarification requests
- Views notesheets they are authorized to access

### Senior Reviewer

- Receives assigned notesheets for review
- Adds review remarks
- Requests clarification
- Reviews responses
- Forwards notesheets to the approval stage

### Approval Authority

- Receives notesheets forwarded for approval
- Reviews the final record
- Approves or rejects the notesheet
- Provides mandatory justification when rejecting
- Finalizes the notesheet through the approval decision

A user's designation as HOD does not automatically grant approval authority. Approval authority is explicitly assigned and managed separately.

## Comments and Clarifications

Comments are designed as an append-only record.

A reviewer can:

1. Add a review remark.
2. Request clarification from the creator.
3. Place the notesheet into `WAITING_FOR_RESPONSE`.

The creator can then submit a response as a new child comment.

```text
Reviewer Comment
      |
      +---- Clarification Request
                 |
                 v
          Creator Response
```

Existing comments cannot be edited or deleted through the normal application workflow.

## Approval and Finalization

An approval authority can either approve or reject a notesheet.

For rejection:

```text
Reject
  |
  v
Justification Required
  |
  v
Rejected
  |
  v
Finalized
```

For approval:

```text
Approve
  |
  v
Approved
  |
  v
Finalized
```

The final approval record stores the approver's name, designation, department, decision, justification where applicable, and decision timestamp.

The interface displays this information as a visual final approval record.

The project does not implement cryptographic signing or digital signature verification. The visual approval record is a presentation and record-keeping mechanism rather than a cryptographic security mechanism.

## Audit Trail

Important business actions are recorded as audit events, including:

- Notesheet creation
- Notesheet dispatch
- Reviewer assignment
- Comments
- Clarification requests
- Responses
- Review forwarding
- Approval
- Rejection
- Finalization

Audit records preserve relevant actor and workflow information to provide a history of the notesheet lifecycle.

## Testing

The application has been tested across the core workflow and security boundaries, including:

- Notesheet creation and editing
- Notesheet dispatch
- Reviewer assignment
- Review comments
- Clarification requests
- Creator responses
- Workflow forwarding
- Approval
- Rejection with mandatory justification
- Automatic finalization
- Finalized record read-only behavior
- Object-level access control
- Unauthorized notesheet access
- Approval authority assignment and revocation
- Active workflow assignment constraints
- Frontend production build
- Frontend workflow integration

The frontend production build completes successfully, and the core end-to-end notesheet lifecycle has been verified through the application.

## Current Scope

The current implementation focuses on the secure digital processing of official notesheets through a controlled organizational workflow.

The implemented lifecycle is:

```text
Draft
  |
  v
Dispatch
  |
  v
Review
  |
  +---- Clarification / Response
  |
  v
Forward
  |
  v
Approval
  |
  +---- Approved
  |
  +---- Rejected
  |
  v
Finalized
```

## Project Status

The core notesheet workflow is implemented and tested across the frontend and backend, including authentication, notesheet creation, dispatch, review, clarification, response, forwarding, approval, rejection, finalization, access control, and audit history.

The project is currently configured for local development using SQLite.

## Future Enhancements

Possible future improvements include:

- Production database configuration
- Production deployment
- Automated CI/CD
- Expanded automated API and end-to-end test coverage
- Email and application notifications
- Advanced administrative dashboards
- Document attachment support
- Configurable organizational workflows
- Additional reporting and analytics