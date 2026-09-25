# AdSense & Publisher Policy Requirements

## Core rule
The site is an actual utility product with useful explanatory content. It must not be an ad wrapper around an upload button.

Google's publisher policies prohibit Google-served ads on screens without publisher content or with low-value content. The content supplied to the user should be useful and focal.

## Required public pages

Before AdSense submission, have working pages for:
- About
- Contact
- Privacy Policy
- Terms of Service
- Cookie/consent information as appropriate
- How It Works / File Processing
- Editorial / Quality Policy

## Tool page content

Every indexed page needs enough useful context to stand on its own.

Minimum content model:
- H1.
- 100–250 word original introduction where appropriate.
- Tool interface.
- Supported formats.
- Maximum practical file size guidance.
- How-to steps.
- Technical/quality limitations.
- Privacy explanation.
- Related tools.
- FAQ.

Do not force long essays onto simple conversion pages just to increase word count. The objective is useful content, not arbitrary length.

## Ads

Initial recommendation after approval:
- One responsive ad in the content region after the main tool area.
- One additional placement on genuinely long pages.
- Test before adding more.

Do not:
- Place ads inside the upload target.
- Place ads where they can be mistaken for download buttons.
- Create fake download buttons.
- Place ads on empty/no-result/error screens.
- Make content inaccessible behind ads.

## Consent

Google's current policy requires specific consent handling for personalized advertising in the EEA, UK and Switzerland. Google offers its own CMP through AdSense Privacy & Messaging, and certified third-party CMPs are another route.

The implementation should load ad/consent code in a way that does not block the core converter UI and should respect the configured consent state.

## Privacy architecture

For local tools:
- File bytes stay in the browser.
- Do not send file content to analytics.
- Avoid third-party upload APIs.
- Do not retain user files.

For future tools that must use a remote API:
- label the tool clearly as remote processing;
- explain retention/processing behavior;
- isolate that tool from the local-only badge;
- get explicit consent where required.

## Security

Treat user-uploaded files as untrusted input.
- Never inject converted HTML into the DOM without sanitization.
- Use a sanitizing library if HTML can be produced from documents.
- Avoid `dangerouslySetInnerHTML` unless the content has been sanitized.
- Cap memory-heavy operations.
- Sanitize file names before using them in download paths.
- Avoid eval/new Function for conversion logic.

Mammoth explicitly warns that it does not sanitize source documents, so any DOCX → HTML result must be handled defensively.
