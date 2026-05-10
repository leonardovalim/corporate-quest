# Security Policy

## Scope

This policy covers vulnerabilities in the Corporate Quest source code and self-hosted deployments. It does **not** cover the public instance at corporatequest.net, which runs on infrastructure managed separately.

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report privately by opening a [GitHub Security Advisory](https://github.com/leonardovalim/corporate-quest/security/advisories/new) on this repository. Include:

- A description of the vulnerability
- Steps to reproduce it
- The potential impact
- Any suggested fix (optional)

You will receive a response within 5 business days. If the issue is confirmed, a fix will be released as soon as possible.

## Self-hosting checklist

If you are running your own instance, make sure to:

- Change the default admin password (`admin`) immediately via `/admin` → **Segurança**
- Use environment variables for all secrets — never commit `.env`
- Enable Supabase's built-in Row Level Security (already enabled by the included migrations)
- Rotate your Supabase anon key if you suspect it has been exposed