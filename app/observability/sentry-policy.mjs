const PRIVATE_KEY_PATTERN = /(?:authorization|cookie|set-cookie|password|secret|token|api[-_]?key|contact|email|phone|address|job[-_ ]?description|prompt|transcript|message|response|evidence|visitor|user|form|body|payload)/i;
const LOCAL_PATH_PATTERN = /(?:\/Users\/|\/home\/|[A-Z]:\\Users\\)[^\s"']+/gi;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const IPV4_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const IPV6_PATTERN = /\b(?:[A-F0-9]{1,4}:){2,7}[A-F0-9]{0,4}\b/gi;
const URL_PATTERN = /https?:\/\/[^\s"']+/gi;
const MAX_STRING_LENGTH = 512;
const MAX_DEPTH = 8;

function scrubUrl(candidate) {
  try {
    const url = new URL(candidate);
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return candidate;
  }
}

export function scrubTechnicalString(value) {
  return value
    .slice(0, MAX_STRING_LENGTH)
    .replace(LOCAL_PATH_PATTERN, '[redacted-local-path]')
    .replace(EMAIL_PATTERN, '[redacted-email]')
    .replace(IPV4_PATTERN, '[redacted-ip]')
    .replace(IPV6_PATTERN, '[redacted-ip]')
    .replace(URL_PATTERN, (url) => scrubUrl(url));
}

export function scrubUnknown(value, depth = 0) {
  if (depth > MAX_DEPTH) return '[redacted-depth]';
  if (typeof value === 'string') return scrubTechnicalString(value);
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.slice(0, 50).map((entry) => scrubUnknown(entry, depth + 1));

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !PRIVATE_KEY_PATTERN.test(key))
      .slice(0, 100)
      .map(([key, entry]) => [key, scrubUnknown(entry, depth + 1)]),
  );
}

export function scrubSentryEvent(event) {
  const scrubbed = scrubUnknown(event);
  if (!scrubbed || typeof scrubbed !== 'object' || Array.isArray(scrubbed)) return null;

  delete scrubbed.user;
  delete scrubbed.message;

  if (scrubbed.exception && typeof scrubbed.exception === 'object' && Array.isArray(scrubbed.exception.values)) {
    scrubbed.exception.values = scrubbed.exception.values.map((exception) => {
      if (!exception || typeof exception !== 'object' || Array.isArray(exception)) return exception;
      const type = typeof exception.type === 'string' ? exception.type : 'Error';
      return { ...exception, value: `[${type}] message redacted by portfolio privacy policy` };
    });
  }

  if (scrubbed.request && typeof scrubbed.request === 'object' && !Array.isArray(scrubbed.request)) {
    const request = scrubbed.request;
    scrubbed.request = {
      method: typeof request.method === 'string' ? request.method : undefined,
      url: typeof request.url === 'string' ? scrubUrl(request.url) : undefined,
    };
  }

  return scrubbed;
}

export function scrubSentryBreadcrumb(breadcrumb) {
  if (!breadcrumb || typeof breadcrumb !== 'object') return null;
  if (/^(?:ui\.|console$)/i.test(String(breadcrumb.category ?? ''))) return null;
  return scrubUnknown(breadcrumb);
}
