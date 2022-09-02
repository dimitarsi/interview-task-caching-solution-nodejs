import { preprocessHtml } from "../preprocessHtml.mjs";


describe("Preprocessing HTML", () => {
    test("Add a preprocess paragraph", () => {
        expect(preprocessHtml('')).toEqual('<p>Preprocessed</p>')
    })
})