export function highlightSearchTerms(node: Node, regex: RegExp): void {
          if (node instanceof Text) { // Text node
            const text = node.data;

            if (text.match(regex)) {
              const span = document.createElement('span');
              span.innerHTML = text.replace(regex, '<mark class="highlight">$1</mark>');
              node.replaceWith(...span.childNodes);
            }
          } 
          else if (
            node instanceof Element && 
            node.tagName !== 'SCRIPT' && 
            node.tagName !== 'STYLE' && 
            node.tagName !== 'FORM'
          ) {
            node.childNodes.forEach(function(child) {
              highlightSearchTerms(child, regex);
            });
          }
        }

export function clearSearchHighlights(root: HTMLElement) {

    root.querySelectorAll('.highlight').forEach(function(el) {
        const parent = el.parentNode;

        if (!parent){
          return
        }
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
  })
}

export function buildRegex(str: string) {
     
    let escapedStr = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters in the search field

    let regex = new RegExp('(' + escapedStr + ')', 'gi'); // Create a case-insensitive regex

    return regex;
}

