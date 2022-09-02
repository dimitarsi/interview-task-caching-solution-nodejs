
const now = Date.now()

export function preprocessHtml(htmlAsString) {
    return htmlAsString + `<p>Preprocessed ${now}</p>`;
}
