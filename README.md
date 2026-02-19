# Lightdash for Raycast

A [Raycast](https://raycast.com/) extension to search [Lightdash](https://www.lightdash.com/) dashboards and charts.

## Features

- Search dashboards and charts in a single command
- Switch between projects via dropdown
- Open items in browser or copy URL to clipboard
- Separate sections for dashboards and charts with distinct icons

## Installation

### Prerequisites

- [Raycast](https://raycast.com/) installed
- [Node.js](https://nodejs.org/) 18+ installed
- A Lightdash account with API access

### Install the Extension

1. Clone this repository:
   ```bash
   git clone https://github.com/mr-oliva/raycast-lightdash.git
   cd raycast-lightdash
   ```
2. Install dependencies and start the extension:
   ```bash
   npm install && npm run dev
   ```
3. Raycast will automatically detect the extension. You can now close the terminal.

The extension stays registered in Raycast even after you quit the dev server. Run `npm run dev` again to pick up future updates.

## Configuration

### 1. Get a Lightdash Personal Access Token

1. Open your Lightdash instance in a browser
2. Click your avatar (bottom-left) and go to **Settings**
3. Navigate to **Personal Access Tokens**
4. Click **Create new token**, give it a name, and copy the generated token

### 2. Set Up Preferences

Open the "Search Lightdash" command in Raycast. On first run you will be prompted to fill in:

| Preference | Description |
|---|---|
| **Lightdash URL** | Your instance URL (e.g. `https://mycompany.lightdash.cloud`) |
| **API Key** | The personal access token from step 1 |
| **Default Project UUID** | *(Optional)* UUID of the project to load by default |

> **Tip:** You can find the Project UUID in the browser URL when you open a project:
> `https://mycompany.lightdash.cloud/projects/<uuid>/...`

## Updating

```bash
cd raycast-lightdash
git pull
npm install && npm run dev
```

## Contributing

```bash
npm install
npm run dev          # Start Raycast dev mode
npm run test         # Run tests
npm run lint         # Lint (requires Raycast CLI)
```

## License

MIT
