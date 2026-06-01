import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../local-data');
const dataFile = path.join(dataDir, 'guests.json');
const port = Number(process.env.LOCAL_API_PORT || 3001);

const normalizeGuestName = (value) => value.trim().replace(/\s+/g, ' ');

const getGuestNameKey = (value) =>
  normalizeGuestName(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const sendJson = (res, status, payload) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const ensureStore = async () => {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(dataFile, 'utf8');
  } catch {
    await writeFile(dataFile, '[]', 'utf8');
  }
};

const readGuests = async () => {
  await ensureStore();
  const raw = await readFile(dataFile, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeGuests = async (guests) => {
  await ensureStore();
  await writeFile(dataFile, JSON.stringify(guests, null, 2), 'utf8');
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
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
        reject(new Error('El cuerpo de la solicitud no contiene JSON valido.'));
      }
    });

    req.on('error', () => reject(new Error('No se pudo leer la solicitud.')));
  });

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname !== '/api/guests') {
    sendJson(res, 404, { message: 'Ruta no encontrada.' });
    return;
  }

  try {
    if (req.method === 'GET') {
      sendJson(res, 200, { guests: await readGuests() });
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
        sendJson(res, 400, { message: 'Faltan datos del invitado para registrarlo.' });
        return;
      }

      const duplicate = currentGuests.find(
        (entry) => getGuestNameKey(entry.name) === getGuestNameKey(guest.name),
      );

      if (duplicate) {
        sendJson(res, 409, {
          message:
            duplicate.status === 'confirmed'
              ? 'Tu asistencia ya fue confirmada por el admin.'
              : 'Tu solicitud ya fue enviada y está en espera de confirmación.',
        });
        return;
      }

      const nextGuests = [guest, ...currentGuests];
      await writeGuests(nextGuests);
      sendJson(res, 201, { guests: nextGuests });
      return;
    }

    if (req.method === 'PATCH') {
      const { guestId, status } = await readBody(req);

      if (!guestId || !['pending', 'confirmed'].includes(status)) {
        sendJson(res, 400, { message: 'Faltan datos para actualizar el invitado.' });
        return;
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
      const guestId = url.searchParams.get('id');

      if (!guestId) {
        sendJson(res, 400, { message: 'Falta el identificador del invitado a eliminar.' });
        return;
      }

      const currentGuests = await readGuests();
      const nextGuests = currentGuests.filter((guest) => guest.id !== guestId);
      await writeGuests(nextGuests);
      sendJson(res, 200, { guests: nextGuests });
      return;
    }

    sendJson(res, 405, { message: 'Metodo no permitido.' });
  } catch (error) {
    sendJson(res, 500, {
      message: error.message || 'No se pudo procesar la solicitud local de invitados.',
    });
  }
});

server.listen(port, () => {
  console.log(`Local guest API running on http://localhost:${port}`);
});