export async function getBody(url) {
    try {
        const result = await fetch(url)
        return await result.text()
    } catch(error) {
        return '';
    }
}
export default { getBody }