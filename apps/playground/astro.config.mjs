import { defineConfig } from "astro/config";
import webrev from "@webrev/astro";

const githubProjectBase =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}`
    : "/";

export default defineConfig({
  base: process.env.WEBREV_BASE_PATH ?? githubProjectBase,
  output: "static",
  integrations: [
    webrev({
      revision: process.env.WEBREV_REVISION ?? "playground-dev",
      inspect: true
    })
  ]
});
