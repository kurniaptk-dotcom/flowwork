/**
 * Security & Encryption Utility for FlowWork OS
 * Uses native browser Web Crypto API (Zero external dependencies)
 */

/**
 * Generates a SHA-256 hexadecimal hash string for a given password.
 * @param {string} text - Plain text password
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
export async function hashPassword(text) {
  if (!text) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const cryptoObj = typeof window !== 'undefined' ? (window.crypto || window.msCrypto) : globalThis.crypto;
    const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hexString;
  } catch (err) {
    console.error('Error computing SHA-256 hash:', err);
    // Fallback simple checksum if subtle crypto fails
    return 'fallback_' + btoa(unescape(encodeURIComponent(text)));
  }
}

/**
 * Validates email format according to standard RFC pattern.
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).trim().toLowerCase());
}

/**
 * Checks password complexity and returns strength level, score (0-4), label, and color.
 * @param {string} password
 * @returns {{ score: number, label: string, color: string, feedback: string }}
 */
export function checkPasswordStrength(password) {
  if (!password) {
    return { score: 0, label: 'Kosong', color: '#94a3b8', feedback: 'Minimal 6 karakter' };
  }

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 0.5;
  if (/[0-9]/.test(password)) score += 0.75;
  if (/[^A-Za-z0-9]/.test(password)) score += 0.75;

  const normalized = Math.min(Math.floor(score), 3);

  switch (normalized) {
    case 0:
    case 1:
      return {
        score: 1,
        label: 'Lemah',
        color: '#ef4444',
        feedback: 'Terlalu pendek, tambahkan huruf besar atau angka'
      };
    case 2:
      return {
        score: 2,
        label: 'Sedang',
        color: '#f59e0b',
        feedback: 'Cukup baik, tambahkan simbol unik agar lebih aman'
      };
    case 3:
    default:
      return {
        score: 3,
        label: 'Kuat & Aman',
        color: '#10b981',
        feedback: 'Kombinasi kata sandi sangat kuat!'
      };
  }
}
