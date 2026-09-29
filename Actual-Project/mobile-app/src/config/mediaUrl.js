// Preserve local picker URIs; resolve server media through the API host.
export function resolveMediaUrl(value, backendUrl) {
    if (!value || typeof value !== 'string') return null;
    const base = backendUrl.replace(/\/$/, '');
    if (value.startsWith('/')) return `${base}${value}`;
    if (/^https?:\/\//i.test(value)) {
        const url = new URL(value);
        // Repair URLs in assessments saved before images were proxied.
        if (url.port === '8000' && url.pathname.startsWith('/uploads/')) {
            return `${base}/api/images/${url.pathname.slice('/uploads/'.length)}${url.search}`;
        }
        if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
            (url.pathname.startsWith('/uploads/') || url.pathname.startsWith('/api/images/'))) {
            return `${base}${url.pathname}${url.search}`;
        }
    }
    return value;
}
