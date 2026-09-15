export function highlightSearchTerms(node, regex) {
          if (node.nodeType === 3) { // Text node
            var match = node.nodeValue.match(regex);
            if (match) {
              var span = document.createElement('span');
              span.innerHTML = node.nodeValue.replace(regex, '<mark class="highlight">$1</mark>');
              node.replaceWith.apply(node, span.childNodes);
            }
          } 
          else if (node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'FORM') {
            node.childNodes.forEach(function(child) {
              highlightSearchTerms(child, regex);
            });
          }
        }

export function clearSearchHighlights(root) {

    root.querySelectorAll('.highlight').forEach(function(el) {
        var parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
  })
}

export function buildRegex(str) {
     
    let escapedStr = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters in the search field

    let regex = new RegExp('(' + escapedStr + ')', 'gi'); // Create a case-insensitive regex

    return regex;
}

