# Backend API Contract — RSVP & Wishes

Handoff for the Go backend. The frontend (this repo, React + Vite) currently stores RSVPs in
`localStorage` via `createLocalRsvpService()` in [`src/services/rsvp.ts`](../src/services/rsvp.ts).
The backend replaces that with shared storage so the couple can see every guest and all guests see
each other's wishes.

## Frontend status

- UI talks only to the `RsvpService` interface (`submit`, `getOwn`, `listWishes`).
- To switch: add `createHttpRsvpService(baseUrl)` in `src/services/rsvp.ts` and export it as `rsvpService`
  when `VITE_API_URL` is set, otherwise keep the local mock.
- `getOwn()` is **synchronous** today, and `RsvpSection.tsx` reads it during render. With HTTP it becomes
  `Promise<RsvpRecord | null>`, so `RsvpSection` needs a small loading state.

## Guest identity (no login)

Guests never log in. On first visit the frontend generates a random UUID `guestToken`, keeps it in
`localStorage`, and sends it as the header `X-Guest-Token` on every request. One token has at most one
RSVP, so a guest who submits again **updates** their RSVP (the UI has an "Ubah Konfirmasi" button).
The `?to=Nama` URL param is only a display name. It is not an identity and not a secret.

## Types (JSON, camelCase)

```ts
type Attendance = "attend" | "absent";

interface RsvpInput {        // request body
  name: string;              // trimmed, 2–60 chars
  attendance: Attendance;
  guests: number;            // 1..MAX_GUESTS (4) when attend; server forces 0 when absent
  message: string;           // trimmed, 0–280 chars (optional)
}

interface RsvpRecord extends RsvpInput {
  id: string;                // UUID
  createdAt: string;         // RFC 3339 UTC, e.g. "2026-09-28T09:52:00Z"
  updatedAt: string;
}

interface Wish {             // public view — never expose guestToken
  id: string;
  name: string;
  attendance: Attendance;
  message: string;
  createdAt: string;
}

interface ApiError { error: { code: string; message: string } } // message in Bahasa Indonesia, shown to the guest
```

## Public endpoints (base: `/api/v1`)

| Method | Path | Header | Body | Success |
|---|---|---|---|---|
| `PUT` | `/rsvp` | `X-Guest-Token` (required) | `RsvpInput` | `200 RsvpRecord` (upsert by token; `201` on create) |
| `GET` | `/rsvp/me` | `X-Guest-Token` | — | `200 RsvpRecord`, or `404` if none |
| `GET` | `/wishes?limit=20&cursor=<opaque>` | — | — | `200 { items: Wish[], nextCursor: string \| null }`, newest first, only wishes with a non-empty message |
| `GET` | `/healthz` | — | — | `200 {"status":"ok"}` |

Error codes: `400 invalid_input` (validation, see the rules above; the message must be user-facing, e.g.
"Mohon isi nama Anda."), `400 missing_token`, `413` for a body larger than 4 KB, `429 rate_limited`,
`500 internal`.

## Admin endpoints (for the couple)

Protected with `Authorization: Bearer <ADMIN_TOKEN>` (from env).

| Method | Path | Result |
|---|---|---|
| `GET` | `/admin/rsvps` | all RSVPs + totals `{ items, totals: { attend, absent, guests } }` |
| `GET` | `/admin/rsvps.csv` | CSV export (name, attendance, guests, message, createdAt) |
| `DELETE` | `/admin/wishes/{id}` | hide an inappropriate wish (soft delete) |

## Non-functional requirements

- **CORS:** allow the invitation origin(s) from env (`ALLOWED_ORIGINS`); allow the header `X-Guest-Token`.
- **Rate limiting:** by IP plus token, roughly 10 writes per minute, because the link is public on WhatsApp.
- **Validation and sanitisation:** mirror `validateRsvp()` in `src/services/rsvp.ts`. Store plain text and
  strip control chars. The frontend renders text through React escaping, so HTML is not interpreted.
- **Storage:** any SQL. Suggested table `rsvps(id uuid pk, guest_token_hash text unique, name, attendance,
  guests int, message text, hidden bool default false, created_at, updated_at)`. Store only a **hash**
  of the guest token.
- **Config via env:** `PORT`, `DATABASE_URL`, `ALLOWED_ORIGINS`, `ADMIN_TOKEN`, `MAX_GUESTS=4`.
- The frontend already simulates ~650 ms latency and shows "Mengirim…". Any normal API latency is fine.
