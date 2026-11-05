# Old addresses → new (clicksolveguide.com)

Stand: 2.11.2026. The previous site was a single browser checklist (four problems, notes field, report download, four short guides). Its exact paths are unknown, so the standard old addresses are covered. Each exists in `docs/` as a `noindex,follow` page with `canonical` and `meta refresh` to the new page (never to `/`).

| Old URL | New URL |
|---|---|
| /about.html | /about/ |
| /imprint.html | /imprint/ |
| /privacy.html | /privacy/ |
| /advertise.html | /contact/ |
| /contact.html | /contact/ |
| /windows-storage-review.html | /guides/windows-update-stuck/ (Windows storage: free space before updates) |
| /firefox-one-site-data.html | /diagnose/one-website-wont-load/ (clearing one site's data) |

The old checklist's function (one check after another, notes, report download) now lives in the six diagnoses under /diagnose/ (notes field + fix log as .txt/print).

## Subdomains
The concept names no old subdomains. If any DNS records for subdomains of clicksolveguide.com exist from the old site, check them at the registrar and delete unused ones when the domain is pointed to GitHub Pages.

Add newly discovered old paths to `OLD_URLS` in `src/site.mjs` and rebuild.
