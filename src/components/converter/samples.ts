import type { FormatId } from '~/lib/catalog/types';

/** Small, realistic examples for "Try an example" in paste mode. */
export const SAMPLES: Partial<Record<FormatId, string>> = {
  csv: `id,name,email,city,zip,active\n1,Ana Souza,ana@example.com,São Paulo,01310-100,true\n2,"Lee, Min-jun",minjun@example.com,Seoul,04524,false\n3,Zoë Müller,zoe@example.com,Berlin,10115,true\n`,
  tsv: `sku\tproduct\tprice\tstock\nA-001\tDesk lamp\t39.90\t12\nA-002\tNotebook, dotted\t4.50\t240\nB-117\tStanding desk\t489.00\t3\n`,
  json: `[\n  { "id": 1, "name": "Ana Souza", "tags": ["admin", "editor"], "address": { "city": "São Paulo", "zip": "01310-100" } },\n  { "id": 2, "name": "Lee Min-jun", "tags": [], "address": { "city": "Seoul", "zip": "04524" } }\n]\n`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>\n<catalog>\n  <book id="bk101" lang="en">\n    <title>XML Developer's Guide</title>\n    <price currency="USD">44.95</price>\n  </book>\n  <book id="bk102" lang="fr">\n    <title>Le Petit Prince</title>\n    <price currency="EUR">9.50</price>\n  </book>\n</catalog>\n`,
  yaml: `# Service configuration\nservice:\n  name: checkout\n  replicas: 3\n  ports:\n    - 8080\n    - 8443\n  env:\n    LOG_LEVEL: info\n    FEATURE_FLAGS: "new-cart,fast-pay"\ndefaults: &defaults\n  timeout: 30\nworker:\n  <<: *defaults\n  queue: orders\n`,
  markdown: `# Release notes\n\nVersion **2.4** adds _offline mode_ and fixes several bugs.\n\n## Highlights\n\n- Works without a connection\n- [x] Faster start-up\n- [ ] Dark mode (next release)\n\n| Platform | Status |\n|----------|--------|\n| Web      | ✅     |\n| iOS      | Beta   |\n\n\`\`\`js\nconsole.log('hello');\n\`\`\`\n\nRead more on [our blog](https://example.com/blog).\n`,
  html: `<article>\n  <h1>Welcome to the <em>new</em> site</h1>\n  <p>We rebuilt everything. Read the <a href="https://example.com/changelog">changelog</a> &amp; tell us what you think.</p>\n  <ul>\n    <li>Faster pages</li>\n    <li>Better search</li>\n  </ul>\n  <table>\n    <tr><th>Plan</th><th>Price</th></tr>\n    <tr><td>Free</td><td>$0</td></tr>\n  </table>\n  <script>trackVisit()</script>\n</article>\n`,
  txt: `Hello, world! Grüße aus München — 你好 👋\nspecial chars: & = ? / #`,
  base64: `SGVsbG8sIHdvcmxkISBHcsO8w59lIGF1cyBNw7xuY2hlbiDigJQg5L2g5aW9IPCfkYs=`,
  urlencoded: `https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dcaf%C3%A9%20au%20lait%26lang%3Dfr`,
  srt: `1\n00:00:01,000 --> 00:00:03,500\n<i>Previously on the show…</i>\n\n2\n00:00:04,000 --> 00:00:06,250\nWe need to talk.\n- About what?\n\n3\n00:00:07,100 --> 00:00:09,000\nYou know exactly what.\n`,
  vtt: `WEBVTT\n\n00:00:01.000 --> 00:00:03.500 line:0 position:50% align:center\n<v Narrator>Previously on the show…\n\nNOTE This cue is positioned at the top\n\n00:00:04.000 --> 00:00:06.250\n<v Sam>We need to talk.\n\n00:00:07.100 --> 00:00:09.000\n<v Alex>About <i>what</i>?\n`,
  ass: `[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,56,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,96,96,43,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:01.00,0:00:03.50,Default,,0,0,0,,{\\i1}Previously on the show…{\\i0}\nDialogue: 0,0:00:04.00,0:00:06.25,Default,,0,0,0,,{\\an8}We need to talk.\\NAbout what?\n`,
  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">\n  <rect width="64" height="64" rx="14" fill="#171717"/>\n  <path d="M20 18h24M20 32h15M20 18v28" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>\n  <path d="M37 25l7 7-7 7" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>\n</svg>\n`,
};

export function sampleFor(from: FormatId, to: FormatId): string | undefined {
  if (from === 'json' && to === 'base64') return `{"user":"ana","roles":["admin"],"exp":1767225600}`;
  if (from === 'base64' && to === 'json') return 'eyJ1c2VyIjoiYW5hIiwicm9sZXMiOlsiYWRtaW4iXSwiZXhwIjoxNzY3MjI1NjAwfQ==';
  if (from === 'txt' && to === 'urlencoded') return 'https://example.com/search?q=café au lait&lang=fr';
  return SAMPLES[from];
}
