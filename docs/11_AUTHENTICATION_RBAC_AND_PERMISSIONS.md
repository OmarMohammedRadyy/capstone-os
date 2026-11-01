# Authentication, RBAC & Permissions

## Authentication
Cookie-based secure sessions preferred for web app. Cookies: HttpOnly, Secure in production, SameSite=Lax/Strict according to flow. Rotate session on sensitive auth events.

## Authorization Model
Global role + project role + entity policy.

## Matrix (summary)
| Action | Student | Leader | Supervisor | Dept Admin |
|---|---:|---:|---:|---:|
| View project | ✓ | ✓ | ✓ | ✓ |
| Create/edit own task update | ✓ | ✓ | comment | ✓ |
| Assign team tasks | limited | ✓ | suggest | ✓ |
| Manage members | ✗ | ✓ | ✗ | ✓ |
| Add supervisor feedback | ✗ | ✗ | ✓ | ✓ |
| Resolve feedback | ✓ | ✓ | verify | ✓ |
| Approve milestone | ✗ | request | ✓ | ✓ |
| Freeze submission | ✗ | ✓ | optional | ✓ |
| Project settings | ✗ | ✓ | limited | ✓ |

## Policies
- `canViewProject(user, project)`
- `canManageTask(actor, task)`
- `canApproveMilestone(actor, milestone)`
- `canAccessDocument(actor, document)`
- `canManageMembers(actor, project)`

## Invite Security
Random high-entropy token; store only hash; expiration; max use; revoke; rate limit.

## Sensitive Actions
Role change, member removal, project archive, submission freeze require confirmation and audit log.
