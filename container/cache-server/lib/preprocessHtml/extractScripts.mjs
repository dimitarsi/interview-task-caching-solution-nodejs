export function extractScripts(htmlAsString) {
  const result = htmlAsString.match(/(<script .+?>)/g);
  return result || [];
}

export function extractSrcAttributes(scriptAsHtml) {
  const result = scriptAsHtml
    .replace(/[<>]/g, "")
    .split(" ")
    .filter(identity)
    .filter((attr) => attr.startsWith("src="))
    .map((attr) => attr.replace(/src=["']/, "").replace(/["']$/, ""));

  return result.length && result[0] ? result[0] : [];
}

function identity(arg) {
  return arg;
}
