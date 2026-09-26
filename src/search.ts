export function highlightSearchTerms(node: Node, regex: RegExp): void {
  if (node instanceof Text) {
    // Text node
    const text = node.data;

    if (text.match(regex) !== null) {
      const span = document.createElement('span');
      span.innerHTML = text.replace(regex, '<mark class="highlight">$1</mark>');
      node.replaceWith(...span.childNodes);
    }
  } else if (
    node instanceof Element &&
    node.tagName !== 'SCRIPT' &&
    node.tagName !== 'STYLE' &&
    node.tagName !== 'FORM'
  ) {
    node.childNodes.forEach(function (child) {
      highlightSearchTerms(child, regex);
    });
  }
}

export function clearSearchHighlights(root: HTMLElement): void {
  root.querySelectorAll('.highlight').forEach(function (el) {
    const parent = el.parentNode;

    if (parent === null) {
      return;
    }
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });
}

export function buildRegex(str: string): RegExp {
  const escapedStr = str.replace(/[.*+?^$\{\}\(\)\|\[\]\\]/gv, '\\$&'); // Escape special characters in the search field
  const regex = new RegExp(`(${escapedStr})`, 'gv'); // Create a case-insensitive regex

  return regex;
}
