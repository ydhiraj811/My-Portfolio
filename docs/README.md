# Portfolio Engineering Docs

This documentation describes the current portfolio implementation and its operational boundaries. It is intended for maintainers and deployment owners.

## Documents

- [Architecture and system design](architecture.md)
- [Scalability assessment and roadmap](scalability.md)
- [API reference](api.md)
- [Data model](data-model.md)
- [Security and privacy](security.md)
- [Deployment and configuration](deployment.md)
- [Operations and troubleshooting](operations.md)

## Current Assessment

The architecture is a reasonable, low-complexity fit for a personal portfolio and moderate traffic: the static frontend is deployed separately from the Express API, MongoDB owns editable content, and external integrations are isolated behind backend services.

It is not yet a high-scale or enterprise platform. In-process caching and rate limits, a single embedded portfolio document, limited operational health checks, and a small unit-test suite without route-level integration or load tests are the main constraints. See the [scalability roadmap](scalability.md).

Unpublished blogs are filtered from public reads. The admin dashboard uses a separate authenticated endpoint to load drafts. Admin credentials are not written to startup logs.

## Source of Truth

These documents are based on the checked-in source. Confirm environment values and provider dashboards before operational changes; secrets and production account state are intentionally not documented here.
