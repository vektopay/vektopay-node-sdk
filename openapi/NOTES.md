# OpenAPI Curation Notes

The aggregated OpenAPI coming from the app stack is not suitable as an SDK contract.
This repository keeps a curated spec at `sdks/openapi/vektopay-sdk.openapi.json` that:

- Excludes internal/admin/dashboard-only endpoints (ex: `/v1/admin/*`, `/v1/users`, `/v1/settings`, `/v1/session`, email/ledger internals).
- Removes "catch-all" paths that show every HTTP method with empty responses (typically artifacts of proxy/wildcard routing).
- Avoids duplicated paths like `/v1/admin` and `/v1/admin/` and duplicated/unstable `operationId`s.
- Focuses on the **merchant/public** surface that the server-side SDKs should expose.

Important: the monorepo currently marks `/v1/charges` and `/v1/transactions` as deprecated (410) on the Payments service.
SDKs therefore use `/v1/payments` as the supported creation endpoint and provide legacy aliases for backwards compatibility.

