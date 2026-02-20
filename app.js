const FECHA_APERTURA = new Date(2027, 2, 10, 0, 0, 0);
const KEY_STORAGE = 'capsula_carta_2026_2027';
const URL_ENTREGA_REAL = 'pantalla-entrega.html';

const fechaAperturaTexto = document.getElementById('fechaAperturaTexto');
const contadorBloqueo = document.getElementById('contadorBloqueo');
const estadoCapsula = document.getElementById('estadoCapsula');
const clave = document.getElementById('clave');
const titulo = document.getElementById('titulo');
const contenido = document.getElementById('contenido');
const btnGuardar = document.getElementById('btnGuardar');
const btnAbrir = document.getElementById('btnAbrir');
const btnExportar = document.getElementById('btnExportar');
const btnImportar = document.getElementById('btnImportar');
const btnBorrar = document.getElementById('btnBorrar');
const inputImportar = document.getElementById('inputImportar');
const estado = document.getElementById('estado');

const formatDate = (date) => date.toLocaleDateString('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

fechaAperturaTexto.textContent = formatDate(FECHA_APERTURA);

const toBase64 = (str) => btoa(unescape(encodeURIComponent(str)));

const crypt = (text, secret) => {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    out += String.fromCharCode(text.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
  }
  return out;
};

const encrypt = (plainText, secret) => toBase64(crypt(plainText, secret));

const setStatus = (msg) => {
  estado.textContent = msg;
};

const getRemainingText = () => {
  const now = new Date();
  const diff = FECHA_APERTURA - now;
  if (diff <= 0) return 'La cápsula ya puede abrirse. ✨';

  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = (totalDays % 365) % 30;

  const parts = [];
  if (years) parts.push(`${years} año${years > 1 ? 's' : ''}`);
  if (months) parts.push(`${months} mes${months > 1 ? 'es' : ''}`);
  if (days || parts.length === 0) parts.push(`${days} día${days !== 1 ? 's' : ''}`);

  return `Faltan ${parts.join(', ')} para abrirla.`;
};

const refreshCountdown = () => {
  contadorBloqueo.textContent = getRemainingText();
};

const readStored = () => {
  const raw = localStorage.getItem(KEY_STORAGE);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const refreshEstadoCapsula = () => {
  const saved = readStored();
  if (!saved || !isValidPayload(saved)) {
    estadoCapsula.textContent = 'Estado de cápsula: aún no hay carta guardada.';
    return;
  }

  estadoCapsula.textContent = `Estado de cápsula: carta guardada el ${formatDate(new Date(saved.createdAt))}.`;
};

const isValidPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return false;
  if (typeof payload.createdAt !== 'string') return false;
  if (typeof payload.sealedFor !== 'string') return false;
  if (typeof payload.data !== 'string') return false;
  return true;
};

btnGuardar.addEventListener('click', () => {
  const pass = clave.value.trim();
  const title = titulo.value.trim();
  const body = contenido.value.trim();

  if (!pass || pass.length < 6) {
    setStatus('Usen una clave compartida de al menos 6 caracteres.');
    return;
  }

  if (!title) {
    setStatus('Escribe un título para la carta.');
    return;
  }

  if (!body || body.length < 20) {
    setStatus('La carta debe tener al menos 20 caracteres para guardarse.');
    return;
  }

  const payload = {
    createdAt: new Date().toISOString(),
    sealedFor: FECHA_APERTURA.toISOString(),
    data: encrypt(JSON.stringify({ title, body }), pass)
  };

  localStorage.setItem(KEY_STORAGE, JSON.stringify(payload));
  refreshEstadoCapsula();
  setStatus(`Carta sellada con éxito el ${formatDate(new Date())}.`);
});

btnAbrir.addEventListener('click', () => {
  window.open(URL_ENTREGA_REAL, '_blank');
});

btnExportar.addEventListener('click', () => {
  const saved = readStored();
  if (!saved || !isValidPayload(saved)) {
    setStatus('No hay una carta válida para exportar.');
    return;
  }

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    storageKey: KEY_STORAGE,
    payload: saved
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `respaldo-capsula-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  setStatus('Respaldo exportado correctamente. Guárdalo en un lugar seguro.');
});

btnImportar.addEventListener('click', () => {
  inputImportar.click();
});

inputImportar.addEventListener('change', async () => {
  const file = inputImportar.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const payload = parsed?.payload;

    if (!isValidPayload(payload)) {
      setStatus('El archivo no tiene un respaldo válido de la cápsula.');
      return;
    }

    localStorage.setItem(KEY_STORAGE, JSON.stringify(payload));
    refreshEstadoCapsula();
    setStatus('Respaldo importado con éxito. Ya puedes abrir o previsualizar la carta.');
  } catch {
    setStatus('No se pudo importar el archivo. Revisa que sea un JSON válido.');
  } finally {
    inputImportar.value = '';
  }
});

btnBorrar.addEventListener('click', () => {
  localStorage.removeItem(KEY_STORAGE);
  refreshEstadoCapsula();
  setStatus('Carta eliminada de este navegador.');
});

refreshCountdown();
refreshEstadoCapsula();
setInterval(refreshCountdown, 60_000);
