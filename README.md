# Den Desktop

Den Desktop is the local operator UI for Den. It lives in this standalone repository after the physical split from `den-mcp`.

This repo contains:

- `src/DenMcp.Desktop/` — React/TypeScript/Electron desktop UI.
- `src/DenMcp.Desktop.Sidecar/` — .NET sidecar/app-core used by Electron over the typed Den bridge.
- `tests/DenMcp.Desktop.Sidecar.Tests/` — sidecar tests.
- `external/den-bridge/` — generic typed app bridge source dependency.
- `testdata/den-desktop-sidecar/` and `testdata/bridge-contract/` — wire/schema fixtures used by tests and release packaging.

Den Core, Den MCP tools, server HTTP APIs, tasks, messages, docs, reviews, and Pi worker state remain in the `den-mcp` repo/service. Den Desktop talks to that service over HTTP; it does not require a sibling `den-mcp` checkout for normal builds.

## Configure Den server

Default Den URL: `http://localhost:5199`.

To point the app at den-srv, use the in-app settings UI or sidecar settings and set:

```text
http://192.168.1.10:5199
```

Settings are stored in the Electron app user-data sidecar path and in the standalone `~/.config/den-desktop` conventions used by the sidecar.

## Build and test

From repo root:

```bash
git submodule update --init --recursive
dotnet restore den-desktop.slnx
dotnet build den-desktop.slnx
dotnet test tests/DenMcp.Desktop.Sidecar.Tests/DenMcp.Desktop.Sidecar.Tests.csproj
npm --prefix src/DenMcp.Desktop ci
npm --prefix src/DenMcp.Desktop run test:helpers
npm --prefix src/DenMcp.Desktop run ui:build
npm --prefix src/DenMcp.Desktop run electron:build
```

Run the development Electron app:

```bash
scripts/rundesktop.sh
# or
npm --prefix src/DenMcp.Desktop run electron:dev
```

Hot renderer mode:

```bash
npm --prefix src/DenMcp.Desktop run ui:dev
npm --prefix src/DenMcp.Desktop run electron:dev:hot
```

## Local release/update workflow

Install/update a local release under `~/.local/opt/den-desktop` and launcher under `~/.local/bin/den-desktop`:

```bash
scripts/update-den-desktop
```

Useful overrides:

```bash
DEN_DESKTOP_REPO_DIR="$HOME/dev/den-desktop" \
DEN_DESKTOP_INSTALL_DIR="$HOME/.local/opt/den-desktop" \
DEN_DESKTOP_BIN_DIR="$HOME/.local/bin" \
scripts/update-den-desktop
```

Rollback remains symlink-based: the update script retains previous release directories and prints a rollback command for the `current` symlink.

## Repository split notes

The sidecar intentionally has no normal project reference to `DenMcp.Core`. Small collaboration response compiler/contracts needed by Desktop are local to this repo; Den server API DTOs are HTTP contracts. If those contracts stabilize, extract a formal package instead of reintroducing a cross-repo source reference.

Historical split plan: Den document `den-desktop/den-desktop-physical-repo-extraction-plan`.
