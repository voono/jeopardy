# Deployment templates

This app is a static SPA (Vite + React) that calls the Gemini API directly
from the browser — there is no backend to run. The recommended deployment
is **nginx serving the prebuilt files**; no systemd unit is required beyond
nginx itself.

## Files

- `nginx.conf.example` — nginx vhost that serves `dist/` as static files.
  **Use this.**
- `jeopardy.service.example` — optional systemd unit for running
  `vite preview` as a proxied Node process instead. Only use this if you
  specifically want a live process rather than static files (e.g. you're
  not comfortable copying build output into `/var/www`). Skip it otherwise.

Both files use `__PLACEHOLDER__` tokens — replace them before copying into
`/etc/`.

## Recommended path (static files + nginx)

```bash
# 1. Build (requires .env with VITE_GEMINI_API_KEY — baked in at build time)
npm ci
npm run build

# 2. Deploy the build output
sudo mkdir -p /var/www/jeopardy
sudo cp -r dist/* /var/www/jeopardy/

# 3. Install the nginx config (replace placeholders first)
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/jeopardy
sudo ln -s /etc/nginx/sites-available/jeopardy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

Re-running `npm run build` + `cp -r dist/* /var/www/jeopardy/` is the entire
redeploy process — there's no process to restart.

## Alternative path (Node process via systemd)

Only if you chose not to serve static files directly:

```bash
sudo cp deploy/jeopardy.service.example /etc/systemd/system/jeopardy.service
# edit placeholders in the file, then:
sudo systemctl daemon-reload
sudo systemctl enable --now jeopardy
```

Then point nginx's `location` block at `proxy_pass http://127.0.0.1:__PORT__;`
instead of serving `dist/` via `alias`.
