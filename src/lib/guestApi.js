const API_ENDPOINT = '/api/guests';

const isHtmlResponse = (contentType, text) => {
  if (contentType?.includes('text/html')) {
    return true;
  }

  return /^\s*<!doctype html>|^\s*<html/i.test(text);
};

const readJsonPayload = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const rawText = await response.text();

  if (!rawText) {
    return {};
  }

  if (isHtmlResponse(contentType, rawText)) {
    throw new Error(
      'La API compartida no está disponible en este entorno local. Para probar invitados compartidos usa Vercel desplegado o ejecuta `vercel dev`.',
    );
  }

  try {
    return JSON.parse(rawText);
  } catch {
    throw new Error('La respuesta de invitados no llegó como JSON válido.');
  }
};

const getErrorMessage = async (response) => {
  try {
    const payload = await readJsonPayload(response);
    return payload.message || 'No se pudo completar la operación con invitados.';
  } catch {
    return 'No se pudo completar la operación con invitados.';
  }
};

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const payload = await readJsonPayload(response);
  return Array.isArray(payload.guests) ? payload.guests : [];
};

export const fetchGuests = async () => {
  const response = await fetch(API_ENDPOINT, {
    method: 'GET',
    cache: 'no-store',
  });

  return handleResponse(response);
};

export const createGuestRequest = async (guest) => {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ guest }),
  });

  return handleResponse(response);
};

export const updateGuestStatusRequest = async (guestId, status) => {
  const response = await fetch(API_ENDPOINT, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ guestId, status }),
  });

  return handleResponse(response);
};

export const deleteGuestRequest = async (guestId) => {
  const response = await fetch(`${API_ENDPOINT}?id=${encodeURIComponent(guestId)}`, {
    method: 'DELETE',
  });

  return handleResponse(response);
};

export const mergeLocalGuestsRequest = async (guests) => {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mode: 'merge-local-guests', guests }),
  });

  return handleResponse(response);
};