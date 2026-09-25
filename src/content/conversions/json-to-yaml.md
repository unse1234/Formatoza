---
intro: >-
  YAML is the configuration language of Kubernetes, Docker Compose, GitHub Actions, Ansible and most static-site
  generators, while tools, APIs and generators often emit JSON. Converting JSON to YAML gives you the same data in a form
  that's easier to read, review and edit — no braces, no trailing-comma errors, and room for comments.


  The output is clean block-style YAML with your choice of 2- or 4-space indentation, key order preserved, and strings
  quoted only when they would otherwise be misread (such as "yes", "08" or "1.0"). Paste JSON or drop files; the
  conversion happens in your browser.
useCases:
  - title: "Kubernetes manifests"
    text: >-
      Turn kubectl -o json output or generated JSON into readable YAML manifests.
  - title: "CI/CD configuration"
    text: >-
      Convert JSON snippets into GitHub Actions, GitLab CI or CircleCI YAML.
  - title: "Docker Compose and Helm values"
    text: >-
      Author compose files and Helm values from JSON produced by scripts.
  - title: "Readable config reviews"
    text: >-
      YAML diffs in pull requests are easier to review than dense JSON.
limitations:
  - >-
    JSON has no comments, so the YAML has none either; add them afterwards.
  - >-
    Very long strings are written on one line (no automatic folding) to keep values byte-identical.
  - >-
    Invalid JSON (trailing commas, comments, single quotes) is rejected with the position of the error; fix it first.
faq:
  - q: "Is JSON valid YAML already?"
    a: >-
      Yes — YAML 1.2 is a superset of JSON, so any JSON document is technically valid YAML. Converting produces the
      idiomatic block style that people actually write.
  - q: "Why are some strings quoted in the YAML?"
    a: >-
      Values like yes, no, on, null, 08 or 1.0 could be read as booleans, null or numbers by some YAML parsers, so they
      are quoted to guarantee they stay strings.
  - q: "Does it keep key order?"
    a: >-
      Yes. Keys appear in the same order as in the JSON.
  - q: "Can I choose the indentation?"
    a: >-
      Yes, 2 or 4 spaces. Two spaces is the convention for Kubernetes and most CI systems.
---

## Quoting: the part that matters

YAML's readability comes from unquoted values, but that same feature makes it ambiguous. In YAML 1.1 — still used by
many tools — `yes`, `no`, `on` and `off` are booleans, which is how Norway's country code `NO` famously became `false`.
Values like `010` may be read as octal, and `1.0` as a float that loses its trailing zero. The serializer used here
quotes any string that a YAML parser could interpret as something else, so the YAML means exactly what your JSON meant.

## Structure mapping

JSON objects become YAML mappings, arrays become sequences (`- item`), strings, numbers, booleans and null keep their
types. Empty objects and arrays are written in flow style as `{}` and `[]`. Nothing is sorted or reordered.
