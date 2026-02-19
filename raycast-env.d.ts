/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Lightdash URL - Your Lightdash instance URL (e.g. https://app.lightdash.cloud) */
  "baseUrl": string,
  /** API Key - Your Lightdash Personal Access Token */
  "apiKey": string,
  /** Default Project UUID - UUID of the default project to search in */
  "defaultProjectUuid"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `search` command */
  export type Search = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `search` command */
  export type Search = {}
}

