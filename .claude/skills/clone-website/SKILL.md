---
name: clone-website
description: Skill untuk mengkloning ulang (reverse-engineer) website yang diizinkan menjadi implementasi lokal yang berfungsi. Reverse-engineer an authorized website into a working local implementation by inspecting its rendered UI, assets, responsive behavior, and interactions, then validating the result with visual and functional checks.
license: MIT
metadata:
  source: https://github.com/JCodesMore/ai-website-cloner-template
  version: "1.0"
---

# Website cloning

Use this skill when the user asks to clone, recreate, reverse-engineer, or reproduce a website from one or more URLs. The goal is a functional local implementation with matching structure, visual language, responsive behavior, and key interactions, not a screenshot or a copied page source.

## Safety and authorization

Before inspecting a target, confirm that the user owns it, has permission to reproduce it, or is using it for legitimate study. Do not clone sites for phishing, impersonation, credential collection, fraud, or evading access controls. Do not copy private data, authentication flows, payment flows, proprietary code, logos, original copy, or media without permission. When authorization is unclear, ask before browsing.

Respect robots.txt, terms of service, rate limits, copyright, privacy, and applicable law. Prefer placeholder assets and rewritten copy when the user does not have rights to reuse the originals. Never submit forms, create accounts, make purchases, or trigger destructive actions on the target.

## Input contract

Expected request:

```text
/clone-website <target-url> [optional second URL] [optional local project path]
```

If the URL, authorization, desired output, or destination project is missing, ask for the missing details before browsing. For a multi-page site, start with the supplied pages and ask before expanding the crawl. Record the viewport, URL, timestamp, and any blocked or unavailable resources in the research notes.

## Operating principles

- Inspect the rendered page before writing UI code. Do not infer layout from the URL or page title.
- Preserve the existing project's framework, routes, naming, styling system, and build commands.
- Use semantic HTML and accessible interactions in the clone even when the source is weak.
- Use real extracted dimensions and computed styles where possible; avoid hand-measured guesses.
- Build the smallest useful slice first, then expand section by section.
- Keep target content and local implementation separate so copyrighted text or assets can be replaced easily.
- Validate desktop and mobile behavior, not just the initial viewport.

## Phase 0: Project reconnaissance

1. Inspect the project structure, package scripts, entry route, styling system, asset folders, and existing test setup.
2. Identify the framework and how to start it. Do not replace an existing stack just to match the source template.
3. Check the current git diff before editing and leave unrelated user changes untouched.
4. Decide where research artifacts belong. Use an existing `docs/` or `research/` directory when available; otherwise keep temporary captures outside the repository unless the user asks to retain them.

## Phase 1: Target reconnaissance

Use Playwright or the available browser tooling. Start with a single page and wait for the rendered state before inspecting it.

1. Open the target at desktop and mobile widths, normally 1440x900 and 390x844.
2. Wait for `networkidle` or a clear application-ready signal. Record console errors and failed requests.
3. Capture full-page screenshots and screenshots of major sections.
4. Record page topology from top to bottom: header, navigation, hero, content sections, repeated cards, forms, footer, overlays, and sticky elements.
5. Sweep safe interactions: scroll, hover, tabs, accordions, menus, carousels, and internal links. Do not submit forms or follow external actions without explicit permission.
6. Extract visible text, accessible names, headings, links, image/video URLs, alt text, CSS background images, fonts, and icon sources.

Useful browser extraction:

```javascript
({
  title: document.title,
  headings: [...document.querySelectorAll('h1,h2,h3')].map((el) => el.textContent.trim()),
  links: [...document.querySelectorAll('a[href]')].map((el) => ({
    text: el.textContent.trim(), href: el.href
  })),
  images: [...document.images].map((image) => ({
    src: image.currentSrc || image.src,
    alt: image.alt,
    width: image.naturalWidth,
    height: image.naturalHeight
  }))
})
```

For a component, use `getComputedStyle()` instead of estimating values:

```javascript
(selector) => {
  const element = document.querySelector(selector);
  if (!element) return { error: `Element not found: ${selector}` };
  const style = getComputedStyle(element);
  return {
    selector,
    box: element.getBoundingClientRect().toJSON(),
    styles: Object.fromEntries([
      'display', 'position', 'width', 'height', 'padding', 'margin', 'gap',
      'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color',
      'background', 'border', 'borderRadius', 'boxShadow', 'zIndex',
      'overflow', 'objectFit', 'transition', 'transform'
    ].map((property) => [property, style[property]]))
  };
}
```

For each stateful control, capture state A and state B and record the trigger, changed properties, transition, and content. A clone is incomplete if it only matches the initial screenshot.

## Phase 2: Research artifacts

Create one topology note and one component specification per major section. Keep exact values from the browser in the specs.

Recommended layout:

```text
docs/research/
  topology.md
  assets.md
  components/
    header.spec.md
    hero.spec.md
    content-section.spec.md
docs/design-references/
  target-desktop.png
  target-mobile.png
```

Component specification template:

```markdown
# <Component> Specification

## Overview
- Target implementation: <path>
- Screenshot: <path>
- Interaction model: static | click-driven | scroll-driven | time-driven

## Structure
- <semantic hierarchy and repeated items>

## Exact styles
- Container: <computed layout, spacing, colors, typography, borders, effects>
- Children: <computed styles and relevant selectors>

## States and behavior
- Trigger: <hover, click, scroll threshold, resize, or none>
- Before: <content and styles>
- After: <content and styles>
- Responsive changes: <desktop, tablet, mobile>

## Assets and content
- Assets: <local path or replacement needed>
- Text: <verbatim only when authorized; otherwise describe or replace>
```

Download only authorized assets. Preserve their intrinsic dimensions and aspect ratio. Prefer local, optimized copies over hotlinking. If an asset cannot legally be reused, create a clearly marked replacement with the same role and dimensions.

## Phase 3: Implementation

1. Establish page-level tokens first: fonts, colors, spacing, radii, shadows, container widths, and breakpoints.
2. Implement the route shell and major sections in source order.
3. Use semantic elements, real links, labelled form controls, keyboard-accessible menus, visible focus, and reduced-motion support.
4. Implement responsive changes from observed behavior. Do not merely scale the desktop layout down.
5. Implement interactions with the project's existing conventions. Keep state local unless it is genuinely shared.
6. Use local assets and explicit dimensions to avoid layout shifts. Lazy-load below-the-fold media when appropriate.
7. After each meaningful section, run the narrowest available typecheck, lint, or test command before moving on.

For a complex page, split work by independent section only when the project supports parallel work safely. Every builder must receive the full component spec, target path, screenshot path, asset list, responsive requirements, and the validation command. Merge and validate each result before assembly.

## Phase 4: Functional and visual QA

Start the local app using the project's documented command. If no command exists, inspect `package.json` and use the least invasive available option. Test at the same viewport sizes used during reconnaissance.

Minimum checks:

- Page loads without uncaught console errors.
- Every intended route and internal link resolves locally.
- Header, navigation, tabs, accordions, forms, and other observed controls work with mouse and keyboard.
- Images load, have appropriate alternatives, and do not cause layout shifts.
- Desktop, tablet, and mobile layouts do not overflow or overlap.
- Focus states, headings, labels, and color contrast remain usable.
- Reduced motion is respected for nonessential animation.
- The production build or the project's equivalent check passes.

Compare target and clone screenshots at identical widths, top to bottom. For every mismatch, classify it as content, asset, geometry, typography, color, state, or responsive behavior, then fix the smallest owning component. Re-run the comparison after each correction.

## Completion report

Report:

1. Target URL(s) and authorization assumption.
2. Files and routes created or changed.
3. Interactions and responsive states implemented.
4. Assets reused versus replaced.
5. Validation commands and results.
6. Known differences, blocked resources, and remaining risks.

Do not claim pixel parity when visual comparison was not performed. Do not claim an interaction works when it was not exercised.

## Attribution

The phase-based workflow and `/clone-website` concept were adapted from [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template), which is MIT licensed. This skill is a local, framework-neutral adaptation for the BugHunter workspace.