const MAX_SAVED_ADDRESSES = 6;

function sanitizeText(value) {
  return String(value || '').trim();
}

function makeAddressId(index = 0) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `addr-${Date.now()}-${index}`;
}

export function normalizeSavedAddresses(addresses = [], { fallbackName = '', fallbackPhone = '' } = {}) {
  const fallbackRecipientName = sanitizeText(fallbackName);
  const fallbackPhoneNumber = sanitizeText(fallbackPhone);

  const cleaned = (Array.isArray(addresses) ? addresses : [])
    .map((entry, index) => ({
      id: sanitizeText(entry?.id) || makeAddressId(index),
      label: sanitizeText(entry?.label) || `Address ${index + 1}`,
      recipientName: sanitizeText(entry?.recipientName) || fallbackRecipientName,
      phone: sanitizeText(entry?.phone) || fallbackPhoneNumber,
      city: sanitizeText(entry?.city),
      address: sanitizeText(entry?.address),
      landmark: sanitizeText(entry?.landmark),
      isDefault: entry?.isDefault === true,
    }))
    .filter((entry) => entry.city || entry.address || entry.landmark || entry.phone)
    .slice(0, MAX_SAVED_ADDRESSES);

  const seenIds = new Set();
  const deduped = cleaned.filter((entry) => {
    if (!entry.id || seenIds.has(entry.id)) return false;
    seenIds.add(entry.id);
    return true;
  });

  if (deduped.length === 0) return [];

  const defaultIndex = deduped.findIndex((entry) => entry.isDefault);
  const resolvedDefaultIndex = defaultIndex >= 0 ? defaultIndex : 0;

  return deduped.map((entry, index) => ({
    ...entry,
    isDefault: index === resolvedDefaultIndex,
  }));
}

export function getDefaultSavedAddress(addresses = []) {
  const normalized = normalizeSavedAddresses(addresses);
  return normalized.find((entry) => entry.isDefault) || normalized[0] || null;
}

export function upsertSavedAddress(addresses = [], entry, options = {}) {
  const normalized = normalizeSavedAddresses(addresses, options);
  const nextEntry = {
    id: sanitizeText(entry?.id),
    label: sanitizeText(entry?.label) || sanitizeText(entry?.city) || 'Saved Address',
    recipientName: sanitizeText(entry?.recipientName) || sanitizeText(options?.fallbackName),
    phone: sanitizeText(entry?.phone) || sanitizeText(options?.fallbackPhone),
    city: sanitizeText(entry?.city),
    address: sanitizeText(entry?.address),
    landmark: sanitizeText(entry?.landmark),
    isDefault: entry?.isDefault !== false,
  };

  if (!nextEntry.city && !nextEntry.address && !nextEntry.landmark && !nextEntry.phone) {
    return normalized;
  }

  const matchIndex = normalized.findIndex((existing) => {
    if (nextEntry.id && existing.id === nextEntry.id) return true;

    return (
      existing.city.toLowerCase() === nextEntry.city.toLowerCase() &&
      existing.address.toLowerCase() === nextEntry.address.toLowerCase() &&
      existing.phone.toLowerCase() === nextEntry.phone.toLowerCase()
    );
  });

  const candidate = {
    ...nextEntry,
    id: nextEntry.id || (matchIndex >= 0 ? normalized[matchIndex].id : makeAddressId(normalized.length)),
  };

  const merged =
    matchIndex >= 0
      ? normalized.map((existing, index) => (index === matchIndex ? { ...existing, ...candidate } : existing))
      : [candidate, ...normalized].slice(0, MAX_SAVED_ADDRESSES);

  return normalizeSavedAddresses(
    merged.map((existing) => ({
      ...existing,
      isDefault: existing.id === candidate.id,
    })),
    options
  );
}

export function addressToCheckoutFields(address) {
  if (!address) {
    return {
      fullName: '',
      phone: '',
      city: '',
      address: '',
      landmark: '',
    };
  }

  return {
    fullName: sanitizeText(address.recipientName),
    phone: sanitizeText(address.phone),
    city: sanitizeText(address.city),
    address: sanitizeText(address.address),
    landmark: sanitizeText(address.landmark),
  };
}
