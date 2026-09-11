const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function toBytes(input) {
  if (input instanceof Uint8Array) {
    return input;
  }
  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }
  throw new TypeError('sha256Hex requires Uint8Array or ArrayBuffer');
}

function hexFromBuffer(buffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function sha256Hex(input) {
  const bytes = toBytes(input);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return hexFromBuffer(digest);
}

export function canonicalize(value) {
  if (value === null) {
    return null;
  }
  const type = typeof value;
  if (type === 'string' || type === 'boolean') {
    return value;
  }
  if (type === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError('canonical JSON rejects non-finite numbers');
    }
    return value;
  }
  if (type === 'undefined') {
    throw new TypeError('canonical JSON rejects undefined');
  }
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }
  if (type === 'object') {
    if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
      throw new TypeError('canonical JSON rejects binary views');
    }
    const output = {};
    for (const key of Object.keys(value).sort()) {
      if (FORBIDDEN_KEYS.has(key)) {
        throw new TypeError(`canonical JSON rejects key ${key}`);
      }
      const item = value[key];
      if (item === undefined) {
        throw new TypeError('canonical JSON rejects undefined');
      }
      output[key] = canonicalize(item);
    }
    return output;
  }
  throw new TypeError(`canonical JSON rejects ${type}`);
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function canonicalEqual(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

export function canonicalInchString(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError('canonical inch string requires a finite number');
  }
  const negative = value < 0 || Object.is(value, -0);
  const absolute = Math.abs(value);
  const [wholeRaw, fractionRaw = ''] = absolute.toFixed(12).split('.');
  const whole = wholeRaw.replace(/^0+(?=\d)/, '');
  const fraction = fractionRaw.replace(/0+$/, '');
  const digits = fraction.length > 0 ? `${whole}.${fraction}` : whole;
  if (/[eE]/.test(digits)) {
    throw new TypeError('canonical inch string rejects exponent form');
  }
  if (digits === '0') {
    return '0';
  }
  return negative ? `-${digits}` : digits;
}
