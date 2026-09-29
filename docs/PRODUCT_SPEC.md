# WebRev product specification

## One-line definition

WebRev is a reversible, inspectable web application framework layer designed for both human programmers and coding agents.

## Problem

Large web applications become difficult to change because source code, deployment state, runtime configuration, assets, browser behavior, and rollback safety are fragmented across unrelated systems.

Humans reconstruct those relationships manually. Agents are often forced to do the same through search, logs, and guesswork.

WebRev preserves those relationships as structured application knowledge.

## Primitive

The central primitive is the **revision**.

A revision is not just a Git commit. It is the identity of a runnable application state and may describe:

- source commit
- dependency lock state
- build configuration
- runtime configuration
- artifact identities
- WASM identities
- route/component/system revisions
- compatibility declarations
- deployment information
- health/test results

## Primary user experiences

### Developer
A developer can build, inspect, compare, test, deploy, freeze, and rewind known revisions.

### Agent
An agent can discover the application's semantic structure and ask precise questions instead of reverse engineering everything from rendered output and logs.

### End user
The end user receives a fast, cache-friendly site. Experimental features can degrade or fail without taking down the main experience.

## Long-term command vocabulary

These are product-direction names, not all required for the initial milestone:

- `webrev dev`
- `webrev build`
- `webrev inspect`
- `webrev test`
- `webrev diff`
- `webrev matrix`
- `webrev deploy`
- `webrev promote`
- `webrev freeze`
- `webrev rewind`

## Inspection model

A WebRev site should eventually make it possible to answer:

- What revision is live?
- What source/build produced it?
- What routes and important systems exist?
- What dependencies produced this component?
- What configuration is active?
- Which WASM/module/artifact is in use?
- What is unhealthy?
- When did the failure begin?
- What was the last known-good revision?
- Is rollback compatible?
- Which deployment provider is serving this revision?

## Safety model

Read-only inspection may be exposed broadly when it contains no secrets.

Sensitive diagnostics require authorization.

Write operations such as:
- rollback
- promotion
- traffic changes
- destructive migration approval
- restart

must be authenticated and auditable.

## Non-goals for the first milestone

Do not:
- write a custom rendering engine
- fork Astro
- replace Vite
- invent a custom CDN
- build a full observability backend
- build a Kubernetes controller
- build a universal database rollback engine
- promise safe partial rollback before compatibility modeling exists

Prove the revision + inspection + invariant + provider-boundary model first.
