import {
  createInspectionDocument,
  revisionIdentityInvariant,
  type WebRevRevision
} from "@webrev/core";

declare const __WEBREV_REVISION__: string;
declare const __WEBREV_BUILT_AT__: string;

export const prerender = true;

export function GET() {
  const revision: WebRevRevision = {
    id: __WEBREV_REVISION__,
    createdAt: __WEBREV_BUILT_AT__,
    configuration: { host: "astro", output: "static" }
  };
  const inspection = createInspectionDocument(revision, [revisionIdentityInvariant]);

  return new Response(JSON.stringify(inspection, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
