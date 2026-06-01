import { list, put } from '@vercel/blob';

const BLOB_PATHNAME = 'guests.json';

const normalizeGuestName = (value) => value.trim().replace(/\s+/g, ' ');

const getGuestNameKey = (value) =>
  normalizeGuestName(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const ensureBlobToken = () => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw createError(
      500,
      'Falta configurar BLOB_READ_WRITE_TOKEN en Vercel para compartir invitados entre dispositivos.',
    );
  }
};

const readGuests = async () => {
  ensureBlobToken();

  const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 10 });
  const blob = blobs.find((entry) => entry.pathname === BLOB_PATHNAME) || blobs.at(0);

  if (!blob) {
    return [];
  }

  const response = await fetch(blob.downloadUrl, { cache: 'no-store' });

  if (!response.ok) {
    throw createError(502, 'No se pudo leer el listado compartido de invitados.');
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
};

const writeGuests = async (guests) => {
  ensureBlobToken();

  await put(BLOB_PATHNAME, JSON.stringify(guests, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    cacheControlMaxAge: 0,
  });
};

const readBody = async (req) => {
  if (typeof req.body === 'object' && req.body !== null) {
    return req.body;
  }

  if (typeof req.body === 'string' && req.body.length > 0) {
    return JSON.parse(req.body);
  }

  return new Promise((resolve, reject) => {
    let rawBody = '';

    req.on('data', (chunk) => {
      rawBody += chunk;
    });

    req.on('end', () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch {
        reject(createError(400, 'El cuerpo de la solicitud no contiene JSON valido.'));
      }
    });

    req.on('error', () => {
      reject(createError(400, 'No se pudo leer la solicitud.'));
    });
  });
};

const sendJson = (res, status, payload) => {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(payload));
};

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const guests = await readGuests();
      sendJson(res, 200, { guests });
      return;
    }

    if (req.method === 'POST') {
      const { guest, guests: incomingGuests, mode } = await readBody(req);
      const currentGuests = await readGuests();

      if (mode === 'merge-local-guests') {
        const guestsToMerge = Array.isArray(incomingGuests) ? incomingGuests : [];
        const knownNames = new Set(currentGuests.map((entry) => getGuestNameKey(entry.name)));
        const mergedGuests = [...currentGuests];

        guestsToMerge.forEach((entry) => {
          if (!entry?.name) {
            return;
          }

          const nameKey = getGuestNameKey(entry.name);

          if (knownNames.has(nameKey)) {
            return;
          }

          knownNames.add(nameKey);
          mergedGuests.push(entry);
        });

        await writeGuests(mergedGuests);
        sendJson(res, 200, { guests: mergedGuests });
        return;
      }

      if (!guest?.id || !guest?.name) {
        throw createError(400, 'Faltan datos del invitado para registrarlo.');
      }

      const duplicate = currentGuests.find(
        (entry) => getGuestNameKey(entry.name) === getGuestNameKey(guest.name),
      );

      if (duplicate) {
        throw createError(
          409,
          duplicate.status === 'confirmed'
            ? 'Tu asistencia ya fue confirmada por el admin.'
            : 'Tu solicitud ya fue enviada y está en espera de confirmación.',
        );
      }

      const nextGuests = [guest, ...currentGuests];
      await writeGuests(nextGuests);
      sendJson(res, 201, { guests: nextGuests });
      return;
    }

    if (req.method === 'PATCH') {
      const { guestId, status } = await readBody(req);

      if (!guestId || !['pending', 'confirmed'].includes(status)) {
        throw createError(400, 'Faltan datos para actualizar el invitado.');
      }

      const currentGuests = await readGuests();
      const nextGuests = currentGuests.map((guest) =>
        guest.id === guestId
          ? {
              ...guest,
              status,
              confirmedAt: status === 'confirmed' ? new Date().toISOString() : null,
            }
          : guest,
      );

      await writeGuests(nextGuests);
      sendJson(res, 200, { guests: nextGuests });
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id || Array.isArray(id)) {
        throw createError(400, 'Falta el identificador del invitado a eliminar.');
      }

      const currentGuests = await readGuests();
      const nextGuests = currentGuests.filter((guest) => guest.id !== id);
      await writeGuests(nextGuests);
      sendJson(res, 200, { guests: nextGuests });
      return;
    }

    sendJson(res, 405, { message: 'Metodo no permitido.' });
  } catch (error) {
    sendJson(res, error.status || 500, {
      message: error.message || 'No se pudo procesar la solicitud de invitados.',
    });
  }
}