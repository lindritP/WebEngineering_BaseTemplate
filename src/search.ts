export function buildRegex(str: string): RegExp {
  const escapedStr = str.replace(/[.*+?^$\{\}\(\)\|\[\]\\]/gv, '\\$&'); // Escape special characters in the search field
  const regex = new RegExp(`(${escapedStr})`, 'giv'); // Create a case-insensitive regex (as in Playground 1)

  return regex;
}
