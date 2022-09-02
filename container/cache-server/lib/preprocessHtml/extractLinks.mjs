export function extractLinks(htmlAsString) {
  const result = htmlAsString.match(/(<link .+\/>)/g);
  return result || [];
}

export function extractHrefAttributes(linkAsHtml) {
  const result = linkAsHtml
    .split(" ")
    .filter(identity)
    .filter((attr) => attr.startsWith("href="))
    .map((attr) => attr.replace(/href=["']/, "").replace(/["']$/, ""));

  return result.length && result[0] ? result[0] : [];
}

function identity(arg) {
  return arg;
}
