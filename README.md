# Lightdash for Raycast

Search Lightdash dashboards and charts directly from Raycast.

## Features

- Search dashboards and charts in a single command
- Switch between projects via dropdown
- Open items in browser or copy URL to clipboard
- Separate sections for dashboards and charts with distinct icons

## Setup

### 1. Get a Lightdash Personal Access Token

1. Open your Lightdash instance in a browser
2. Click your avatar (bottom-left) and go to **Settings**
3. Navigate to **Personal Access Tokens**
4. Click **Create new token**, give it a name, and copy the generated token

### 2. Configure the Extension

Open the "Search Lightdash" command in Raycast. On first run you will be prompted to fill in:

| Preference | Description |
|---|---|
| **Lightdash URL** | Your instance URL (e.g. `https://mycompany.lightdash.cloud`) |
| **API Key** | The personal access token from step 1 |
| **Default Project UUID** | *(Optional)* UUID of the project to load by default. You can find it in the URL when you open a project: `https://.../projects/<uuid>/...` |

## Development

```bash
bun install
bun run dev          # Start Raycast dev mode
bun run test         # Run tests
bun run lint         # Lint (requires Raycast CLI)
```

## License

MIT
