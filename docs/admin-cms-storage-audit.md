# Admin CMS and Storage Audit

Generated: 2026-08-10

## Admin Panel Audit

| Admin page | Purpose | Actually used? | Connected API | Connected table/storage | Decision |
| --- | --- | --- | --- | --- | --- |
| `/admin` | Dashboard stats and quick actions | Yes | `/api/admin/dashboard-stats` | `pyq_exams`, `pyq_questions`, `user_profiles` | Keep |
| `/admin/exams` | Create/list/delete PYQ exams | Yes | `/api/admin/exams` | `pyq_exams` | Keep |
| `/admin/questions` | Paginated PYQ CMS | Yes | `/api/admin/pyq`, `/api/admin/upload-image` | `pyq_questions`, `pyq_exams`, `pyq-images` | Keep |
| `/admin/import` | CSV import into selected exam | Yes, but older/simple workflow | `/api/admin/pyq-upload` | `pyq_questions`, `pyq_exams` | Keep, review later |
| `/admin/imports` | Import package list | Yes | `/api/admin/import-packages` | `pyq_import_packages` | Keep |
| `/admin/imports/[id]` | Import package dashboard/actions | Yes | `/api/admin/import-packages/[id]`, `/api/admin/pyq` | `pyq_import_packages`, `pyq_questions` | Keep |
| `/admin/imports/[id]/review` | Question-by-question import review | Yes | `/api/admin/pyq` | `pyq_questions` | Keep |
| `/admin/images` | Upload missing question/option/explanation images | Yes | `/api/admin/exams`, `/api/admin/pyq`, `/api/admin/upload-image` | `pyq_questions`, `pyq-images` | Keep |
| `/admin/students` | Student directory/XP overview | Yes | `/api/admin/students` | `user_profiles`, `user_xp`, `user_badges`, `test_attempts` | Keep |
| `/admin/notifications` | Send announcements | Yes | `/api/admin/notifications` | `notifications` | Keep |
| `/admin/badges` | Badge CRUD | Yes | `/api/admin/badges` | `badges` | Keep |
| `/admin/goals` | Daily goal CRUD | Yes | `/api/admin/goals` | `daily_goals` | Keep |
| `/admin/community` | Community report moderation | Yes | `/api/admin/community/reports`, `/api/admin/community/moderate` | Community tables | Keep |
| `/admin/settings` | Static settings/reference | Partially | none | none | Keep as System reference |
| `/admin/reviews` | Placeholder global review queue | No | none | none | Hide from sidebar |
| `/admin/analytics` | Placeholder admin analytics | No | none | none | Hide from sidebar |
| `/admin/mock-tests` | Placeholder mock test manager | No | none | none | Hide from sidebar |
| `/admin/solutions` | Placeholder solutions manager | No | none | none | Hide from sidebar |

## Core Sections Kept

- Content: Dashboard, Exams, Questions, Import / Review, Images
- Users: Students, Community Moderation
- Engagement: Notifications, Badges, Daily Goals
- System: Settings

## Duplicate/Dead UI Findings

- `QuestionManager` and `ManagePYQs` overlapped for question editing. `/admin/questions` now uses `ManagePYQs` because it has pagination and richer filters. `QuestionManager` remains for `/admin/import`.
- `/admin/reviews`, `/admin/analytics`, `/admin/mock-tests`, and `/admin/solutions` are placeholders. They were hidden from navigation, not deleted.
- `ManagePYQs` was previously unreferenced but is now the active Questions CMS.

## Storage Audit

| Bucket | Purpose | Code references | Database references | Active? | Decision |
| --- | --- | --- | --- | --- | --- |
| `pyq-images` | PYQ question, option, and explanation images | Admin upload route, PYQ session/results, question admin, import scripts | `pyq_questions.question_image`, option image fields, `explanation_image` | Yes | Keep, dry-run cleanup only |
| `formula-books` | Formula handbook PDFs | `src/lib/formulaBooks.js`, formula book pages/API | `formula_books.file_name` | Yes | Keep |
| `question_images` | Stale label only | Settings text only before cleanup | none found | No bucket exists | Corrected label to `pyq-images` |

## Storage Object Dry Run

Report path: `tmp/storage-cleanup-report.json`

| Bucket | Objects | DB references | Used objects | Orphaned candidates | Missing referenced objects |
| --- | ---: | ---: | ---: | ---: | ---: |
| `pyq-images` | 15,664 | 9,043 | 8,410 | 7,254 | 633 |
| `formula-books` | 5 | 5 | 5 | 0 | 0 |

No storage files were deleted. `pyq-images` orphaned candidates require manual review because many may be legacy uploads, import artifacts, or files referenced outside audited DB columns.

## Security Audit

- `/admin/*` layout uses server-side `isAdmin()` and redirects non-admins.
- Admin APIs now consistently rely on server-side `isAdmin()` for changed routes.
- `supabaseAdmin` is used for server-side admin database/storage mutations in hardened routes.
- Service role key is not imported into client components.
- Import package pages were moved away from browser-side Supabase mutations and now use admin API routes.

## Deferred / Not Deleted

- Placeholder pages were not deleted because routes may be bookmarked and deletion is not required to clean navigation.
- `QuestionManager` was not deleted because `/admin/import` still depends on it.
- No tables, columns, RLS policies, buckets, or storage objects were deleted.
- `pyq-images` orphan candidates were not deleted because manual verification is required.
