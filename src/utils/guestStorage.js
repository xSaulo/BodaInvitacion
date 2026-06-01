const STORAGE_KEY = 'boda-pabloyro-invitados';

export const readGuests = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeGuests = (guests) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
};

export const createGuest = (name) => ({
  id: crypto.randomUUID(),
  name,
  status: 'pending',
  requestedAt: new Date().toISOString(),
  confirmedAt: null,
});

export const normalizeGuestName = (value) => value.trim().replace(/\s+/g, ' ');

export const getGuestNameKey = (value) =>
  normalizeGuestName(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const getGuestFirstSurname = (name) => {
  const parts = normalizeGuestName(name).split(' ').filter(Boolean);

  if (parts.length < 2) {
    return 'Sin apellido';
  }

  return parts[parts.length - 2];
};

export const getGuestSurnameTokens = (name) => {
  const parts = normalizeGuestName(name).split(' ').filter(Boolean);

  if (parts.length < 2) {
    return [];
  }

  const surnameParts = parts.slice(Math.max(1, parts.length - 2));
  return surnameParts.map((part) => getGuestNameKey(part));
};

export const getGuestSurnameParts = (name) => {
  const parts = normalizeGuestName(name).split(' ').filter(Boolean);

  if (parts.length < 2) {
    return { firstSurname: null, secondSurname: null };
  }

  const surnames = parts.slice(Math.max(1, parts.length - 2));

  return {
    firstSurname: surnames[0] ? getGuestNameKey(surnames[0]) : null,
    secondSurname: surnames[1] ? getGuestNameKey(surnames[1]) : null,
  };
};

const buildFamilyLabel = (guests) => {
  const firstSurnameCounts = new Map();
  const secondSurnameCounts = new Map();

  guests.forEach((guest) => {
    const { firstSurname, secondSurname } = getGuestSurnameParts(guest.name);

    if (firstSurname) {
      firstSurnameCounts.set(firstSurname, (firstSurnameCounts.get(firstSurname) || 0) + 1);
    }

    if (secondSurname) {
      secondSurnameCounts.set(secondSurname, (secondSurnameCounts.get(secondSurname) || 0) + 1);
    }
  });

  const getTopSurname = (counts) => [...counts.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0], 'es');
    })
    .at(0)?.[0] || null;

  const firstSurname = getTopSurname(firstSurnameCounts);
  const secondSurname = getTopSurname(secondSurnameCounts);

  const orderedSurnames = [firstSurname, secondSurname]
    .filter(Boolean)
    .filter((surname, index, array) => array.indexOf(surname) === index)
    .map((surname) => surname.charAt(0).toUpperCase() + surname.slice(1));

  return orderedSurnames.length > 0 ? orderedSurnames.join(' / ') : 'Sin apellido';
};

export const buildGuestFamilyGroups = (guests) => {
  const guestNodes = guests.map((guest) => ({
    guest,
    surnameTokens: getGuestSurnameTokens(guest.name),
  }));

  const visited = new Set();
  const groups = [];

  guestNodes.forEach((node, index) => {
    if (visited.has(index)) {
      return;
    }

    const stack = [index];
    const memberIndexes = [];
    visited.add(index);

    while (stack.length > 0) {
      const currentIndex = stack.pop();
      const currentNode = guestNodes[currentIndex];
      memberIndexes.push(currentIndex);

      guestNodes.forEach((candidateNode, candidateIndex) => {
        if (visited.has(candidateIndex)) {
          return;
        }

        const sharesSurname = currentNode.surnameTokens.some((surname) =>
          candidateNode.surnameTokens.includes(surname),
        );

        if (sharesSurname) {
          visited.add(candidateIndex);
          stack.push(candidateIndex);
        }
      });
    }

    const members = memberIndexes.map((memberIndex) => guestNodes[memberIndex].guest);
    groups.push({
      id: `family-${groups.length + 1}`,
      label: buildFamilyLabel(members),
      members,
    });
  });

  return groups.sort((left, right) => left.label.localeCompare(right.label, 'es'));
};

export const formatGuestDate = (value) => {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return 'Fecha no disponible';
  }
};