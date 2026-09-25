---
intro: >-
  YAML's indentation-based syntax is pleasant to write and easy to get subtly wrong: a tab instead of spaces, one
  space too few, an unquoted colon. Converting YAML to JSON is both a practical need — APIs, validators and many
  libraries want JSON — and the quickest way to see what a YAML file really means. This converter parses YAML and shows
  the resulting JSON, or the exact line and column of the first syntax error.


  Anchors and aliases are resolved, merge keys (<<) are supported, and multi-document files are combined into an array.
  Paste YAML or drop .yaml/.yml files — nothing leaves your browser.
useCases:
  - title: "Validating config files"
    text: >-
      Catch indentation and syntax errors in Kubernetes, Compose or CI files before they fail in a pipeline.
  - title: "Feeding JSON-only tools"
    text: >-
      JSON Schema validators, jq and many APIs need JSON input.
  - title: "Understanding anchors and merges"
    text: >-
      See the fully expanded result of &anchors, *aliases and << merge keys.
  - title: "Frontmatter and data files"
    text: >-
      Convert static-site YAML data into JSON for JavaScript tooling.
limitations:
  - >-
    Comments are discarded — JSON has no place for them.
  - >-
    YAML 1.2 core rules are used: yes/no/on/off stay strings, and dates stay strings rather than becoming timestamps.
    YAML 1.1 parsers (like older PyYAML) may interpret such values differently.
  - >-
    Custom tags (!Ref, !Sub, !include) aren't supported; files using them — like CloudFormation templates — report an
    error.
  - >-
    Multi-document files (separated by ---) are combined into one JSON array.
faq:
  - q: "Why does it say my YAML is invalid?"
    a: >-
      The message includes the line and column. Common causes are tab indentation, inconsistent spacing within a list,
      or an unquoted value containing “: ”.
  - q: "Are anchors and aliases supported?"
    a: >-
      Yes. Aliases (*name) are replaced by the anchored value (&name), and merge keys (<<: *defaults) are expanded. For
      safety, very large numbers of aliases are refused.
  - q: "What happens to comments?"
    a: >-
      They are dropped because JSON doesn't support comments.
  - q: "Is yes converted to true?"
    a: >-
      No. Under YAML 1.2, only true and false are booleans; yes, no, on and off are strings.
---

## YAML 1.1 versus 1.2

Many YAML surprises come from the older 1.1 specification, where `yes`, `no`, `on`, `off`, `y` and `n` are booleans,
`010` is octal and `1:30` can be a sexagesimal number. YAML 1.2 (2009) aligned the core schema with JSON: only `true`
and `false` are booleans and numbers look like JSON numbers. This converter uses the YAML 1.2 core schema plus merge
keys, the behaviour of most modern tooling. If a tool in your pipeline still uses YAML 1.1, quote ambiguous values.

## Safety with untrusted YAML

Some YAML libraries can construct arbitrary objects from tags, and alias expansion can blow up a small file into an
enormous structure. The parser used here only creates plain data (maps, lists, strings, numbers, booleans, null),
limits nesting depth, and caps the number of aliases, so malicious YAML can't hang your browser.
