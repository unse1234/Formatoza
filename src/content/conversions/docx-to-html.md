---
intro: >-
  Word documents often need to become web pages: a policy for the intranet, an article for the CMS, documentation for
  a help centre. Copy-pasting from Word drags along inline styles, spans and proprietary markup; exporting as “Web Page”
  from Word is even worse. This converter reads the .docx structure instead and produces clean, semantic HTML: Word
  heading styles become <h1>–<h6>, lists become <ul>/<ol>, tables become <table>, and bold, italic and links are kept.


  Images can be embedded in the HTML or left out, and the result can be a fragment for pasting or a complete HTML page.
  The output is sanitised, and the whole conversion runs in your browser.
useCases:
  - title: "Publishing Word content to a CMS"
    text: >-
      Paste clean HTML into WordPress, Drupal, Contentful or any HTML field without Word's formatting clutter.
  - title: "Help centres and knowledge bases"
    text: >-
      Move documentation written in Word to Zendesk, Intercom or Confluence.
  - title: "Email templates"
    text: >-
      Start an HTML email from content drafted in Word.
  - title: "Accessible web versions of documents"
    text: >-
      Semantic headings and lists make the web version easier to navigate with a screen reader.
limitations:
  - >-
    Visual formatting is intentionally not reproduced: fonts, sizes, colors, spacing, columns and page layout are ignored.
    Only structure and basic emphasis are kept.
  - >-
    Headings are recognised from Word's built-in heading styles; text that merely looks like a heading (big and bold) is
    output as a paragraph. Custom styles are reported.
  - >-
    Headers, footers and comments are not included; shapes, equations and SmartArt are lost.
  - >-
    Only .docx is supported. Legacy .doc files must be re-saved as .docx first.
faq:
  - q: "Why doesn't the HTML look like my Word document?"
    a: >-
      By design. The converter maps the document's structure to clean HTML so your website's CSS controls the look.
      Pixel-perfect reproduction would require the inline styling that makes Word HTML so messy.
  - q: "How are images handled?"
    a: >-
      By default they're embedded as data URIs inside the HTML, so the file is self-contained. Choose “Leave images out”
      for text-only HTML.
  - q: "Are my headings kept?"
    a: >-
      Yes, when they use Word's Heading 1–6 styles. Apply those styles in Word for the best result.
  - q: "Is the HTML safe?"
    a: >-
      Yes. The output is sanitised: scripts, event handlers and javascript: links that a malicious document could carry
      are removed.
---

## Structure over appearance

A .docx file is a ZIP archive of XML. Paragraphs carry a *style* (Normal, Heading 1, List Paragraph…) plus optional
direct formatting (this word 14 pt, that line blue). The converter, built on the open-source Mammoth library, reads the
styles and maps them to semantic HTML elements while ignoring direct visual formatting. That's what produces clean
markup: `<h2>Refund policy</h2><p>…</p>` instead of `<p class="MsoNormal"><span style="font-size:14.0pt;…">`.

## Security of converted documents

Word documents can contain hyperlinks with `javascript:` URLs and other content that becomes dangerous once it's HTML.
Mammoth itself doesn't sanitise its output, so every result here is passed through DOMPurify, which strips scripts,
event handlers, dangerous URLs and embedded frames before you download or preview it.
