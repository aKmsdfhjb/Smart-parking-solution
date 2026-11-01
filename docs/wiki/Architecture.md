# Smart Parking Nepal — Architecture

## System flow

```mermaid
flowchart TD
 A[User or parking owner] --> B[React PWA]
 B --> C[Authentication]
 B --> D[Map and parking search]
 D --> E[Parking availability]
 E --> F[Booking and price calculation]
 F --> G[Payment provider]
 G --> H[Booking confirmation]
 H --> I[QR entry validation]
 B --> J[Owner dashboard and analytics]
 C --> K[Firebase services]
 E --> K
 H --> K
```

## Design notes

- Keep user-interface responsibilities separate from model, API and data-service responsibilities.
- Validate inputs at the application boundary and return clear error messages.
- Keep secrets and privileged credentials on the server side.
- Document the versions of data, dependencies and model artifacts used for reproducible results.
- Test the full user journey after deployment, not only the build step.

## Deployment boundary

GitHub Pages can host static HTML, CSS, JavaScript and prebuilt frontend assets. It cannot execute Python/Flask services, server-side React Router actions, private environment variables or database operations. Those parts require a separate backend or application host.
