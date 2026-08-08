// Shared JSON-fetch helper. Callers wrap this in try...catch so each
// page can decide how to handle a failed load (skeleton -> message, etc).
export async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    return response.json();
}