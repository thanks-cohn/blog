import type { AstroIntegration } from "astro";

export interface WebRevAstroOptions {
  revision?: string;
  inspect?: boolean;
}

export default function webrev(options: WebRevAstroOptions = {}): AstroIntegration {
  const revision = options.revision ?? process.env.WEBREV_REVISION ?? "dev";
  const builtAt = new Date().toISOString();
  const inspectionEntrypoint = new URL("./revision-endpoint.ts", import.meta.url).pathname;

  return {
    name: "@webrev/astro",
    hooks: {
      "astro:config:setup": ({ injectRoute, updateConfig }) => {
        updateConfig({
          vite: {
            define: {
              __WEBREV_REVISION__: JSON.stringify(revision),
              __WEBREV_BUILT_AT__: JSON.stringify(builtAt)
            }
          }
        });

        if (options.inspect !== false) {
          injectRoute({
            pattern: "/__webrev/revision",
            entrypoint: inspectionEntrypoint
          });
          injectRoute({
            pattern: "/.well-known/webrev.json",
            entrypoint: inspectionEntrypoint
          });
        }
      },
      "astro:build:done": ({ logger }) => {
        logger.info(`WebRev revision: ${revision}`);
      }
    }
  };
}
