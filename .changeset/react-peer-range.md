---
'@anil-labs/lightbox-gallery-react': patch
---

Clarify the `react` peer dependency range to `^17.0.0 || ^18.0.0 || ^19.0.0`, replacing the open-ended `>=17`. React 18 and 19 compatibility has been explicitly verified (typecheck + build against both); the new range documents that instead of implicitly promising support for untested future majors.
