/**
 * Rehype plugin: makes wide Markdown content usable on small screens and by
 * keyboard. Tables are wrapped in a horizontally scrollable, focusable region;
 * <pre> blocks (which scroll horizontally) become focusable too (WCAG 2.1.1).
 */
export default function rehypeScrollable() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type === 'element' && child.tagName === 'table') {
          return {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['table-scroll'],
              tabIndex: 0,
              role: 'region',
              ariaLabel: 'Table (scrolls horizontally)',
            },
            children: [child],
          };
        }
        if (child.type === 'element' && child.tagName === 'pre') {
          child.properties = { ...child.properties, tabIndex: 0 };
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}
