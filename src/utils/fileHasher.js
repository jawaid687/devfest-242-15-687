/**
 * Calculates SHA-256 cryptographic hash of a File or ArrayBuffer using Web Crypto API.
 * @param {File | ArrayBuffer} input - File object or ArrayBuffer to hash
 * @returns {Promise<{ hash: string, arrayBuffer: ArrayBuffer }>} Hash in hex format and raw arrayBuffer
 */
export async function calculateFileHash(input) {
    const arrayBuffer = input instanceof ArrayBuffer ? input : await input.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return { hash: hashHex, arrayBuffer };
}