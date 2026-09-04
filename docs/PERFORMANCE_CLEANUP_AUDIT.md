# Chronivs Cleanup & Performance Audit

Date: 2026-07-25  
Scope: Frontend (`apps/frontend`) + Backend (`backend`)  
Constraint: **No UI / layout / animation / typography / color / flow changes**

---

## Summary

Completed a high-confidence production cleanup pass focused on dead code removal, bundle splitting, memory leak fixes, and API surface trimming. Visual appearance and user flows are unchanged.

---

## Files removed (dead / temporary)

### Frontend
- Unused performance helpers: `utils/performance/*`
- Unused responsive/image helpers: `utils/responsive/*`, `utils/image/image-props.ts`
- Unused hooks: `use-mounted.ts`, `use-theme.ts`
- Unused animation wrappers: `fade`, `scale`, `blur`, `slide`, `hero-reveal`, `scene-transition`, `text-reveal`, `floating-animation`, `parallax-wrapper`
- Unused `FinalCelebration` ×3 (girlfriend / mother / father)
- Dead re-export: `birthday-girlfriend/hooks/useSceneManager.ts`
- Empty stubs: `components/navigation`, `experience-engine/utils`, `experience-engine/transitions`
- Deprecated shims: `lib/api-client.ts`, `services/experiences.ts`
- No-op bootstrap: `experience-engine/register.ts`
- Deprecated unused `resolvePhotos` helper

### Backend
- `_tmp_pay_test.py` (debug probe)
- Entire unused `app/crud/` scaffolding
- `app/services/autosave.py` (never wired)
- `app/common/pagination.py` (unused stub)
- `app/auth/providers/` (unused protocol package)
- Temporary `POST /media/test-upload` route

---

## Files optimized

| Area | Change |
|------|--------|
| `templateRenderers.tsx` | Removed eager import of **all** template CSS; CSS now loads with each template chunk |
| Birthday girlfriend / mother / father | Scene-level `lazy()` + prefetch (matches anniversary/proposal) |
| `use-audio-recorder.ts` | `URL.revokeObjectURL` on replace / clear / unmount |
| `CinematicEnding.tsx` | Restart timeout cleared on unmount |
| `CheckoutSheet.tsx` | Clears session media after payment success |
| `useEndingActions.ts` | Clears session media on Back to Home |
| `experience-data-adapter.ts` | Restored gallery URLs now applied to ExperienceData (was built then dropped) |
| Barrels (`features`, `services`, `hooks`, `animations`, `components`, `experience-engine`) | Trimmed dead re-exports that forced heavy modules |

---

## Duplicate code merged / reduced

- Removed three identical unused `FinalCelebration` copies (delete > merge)
- Collapsed experience-engine public barrel so templates are only reached via lazy `TEMPLATE_RENDERERS`
- Left per-template `SoundToggle` / `SceneProgress` alone (CSS class coupling) — **remaining recommendation** below

---

## Bundle improvements

- Template CSS no longer loads for unused templates on first paint
- Birthday template scenes code-split (first scene eager, rest lazy + prefetch)
- Removed unused animation/utils modules from the graph
- Avoided barrel foot-guns that re-exported all 5 template experiences

---

## Memory improvements

- Blob audio URLs revoked on replace/clear/unmount
- Session media cleared after successful payment and when leaving preview via Home
- Ending restart timer cleaned up on unmount

---

## API improvements

- Removed temporary `/media/test-upload`
- Removed dead CRUD layer (routes already use repositories/services)
- Backend still boots cleanly after cleanup

---

## Verification

- `npm run typecheck` (frontend) — **pass**
- `npm run lint` (frontend) — **pass** after unused-var fix
- Backend `from app.main import app` — **pass**

---

## Remaining recommendations (not done — higher risk / larger scope)

1. **Timer cleanup** across interactive template scenes (`ForeverScene`, `EndingScene`, `VinylScene`, etc.) — keep timer IDs in refs and clear on unmount/`isActive=false`
2. **Deduplicate** `SoundToggle` / `SceneProgress` / typewriter helpers into shared components (requires careful CSS token alignment)
3. **Repository selectinload** — make payment/user/media loading opt-in to reduce over-fetch on public/list paths
4. **Composite DB indexes** for email-log latest-by-type and experience list filters (measure first)
5. **Auth-gate** `GET /media/health` and remove placeholder `GET /users` stubs before production
6. **Unify** `/e` vs `/public` runtime helpers without changing response contracts
7. **Cloudinary orphan cleanup** job when draft checkout is abandoned
8. **next/image** audit on landing/studio tiles where still using `<img>`
9. **AbortController** on abandoned autosave/upload requests
10. Full `npm run build` size comparison before/after in CI

---

## Explicitly unchanged

UI, typography, spacing, colors, animations, layouts, responsive behavior, and user flows were not modified.
