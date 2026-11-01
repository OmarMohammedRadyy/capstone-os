# Stakeholders, Roles & Personas

## Stakeholders
Students, team leader, academic supervisor, department coordinator, jury (read-only export only), system administrator.

## Student
يرى المشروع، ينفذ المهام، يضيف updates/files/comments، يسجل الاجتماعات المسموحة، ويراجع feedback.

## Team Leader
كل صلاحيات Student + إدارة team members، assignments، milestones، sprint planning، submissions، project settings، role changes داخل الحدود.

## Supervisor
قراءة تقدم المشروع، إضافة feedback، approve/reject milestones أو submissions، comments، meeting notes. لا يعدل إنجاز الطالب مباشرة إلا بوضوح وصلاحية صريحة.

## Department Admin — Phase 2
إدارة cohorts، supervisors، templates، deadlines العامة، portfolio analytics.

## System Admin
Tenant/system operations، لا يتدخل في المحتوى الأكاديمي إلا support/audit وفق policy.

## Permission Philosophy
- Deny by default.
- Least privilege.
- Project-scoped authorization لكل request.
- Frontend hiding ليس authorization؛ enforcement دائمًا backend/server.
- Sensitive actions require explicit confirmation + audit event.
