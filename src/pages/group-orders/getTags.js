// helper: normalize tags into a display string
export function formatTags(tags) {
    if (!tags) {
        return 'No extra info';
    }

    // If backend later sends an array like ["vegan", "gluten-free"]
    if (Array.isArray(tags)) {
        return tags.join(', ');
    }

    // If backend sends a simple string
    if (typeof tags === 'string') {
        return tags;
    }

    // If backend sends an object, try to flatten it
    if (typeof tags === 'object') {
        const parts = [];
        for (const [key, value] of Object.entries(tags)) {
            if (Array.isArray(value)) {
                parts.push(`${key}: ${value.join(', ')}`);
            } else if (typeof value === 'boolean') {
                if (value) parts.push(key);
            } else if (value != null) {
                parts.push(`${key}: ${value}`);
            }
        }
        return parts.length > 0 ? parts.join(' • ') : 'No extra info';
    }

    return 'No extra info';
}
