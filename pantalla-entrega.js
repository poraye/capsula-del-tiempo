const FECHA_APERTURA = new Date(2027, 2, 10, 0, 0, 0);
const KEY_STORAGE = 'capsula_carta_2026_2027';
const KEY_LECTURA_TEMP = 'capsula_lectura_temp';
const URL_LECTURA = 'pantalla-lectura.html';

const params = new URLSearchParams(window.location.search);
const isPreview = params.get('preview') === '1';

const subtitulo = document.getElementById('subtitulo');
const claveLectura = document.getElementById('claveLectura');
const btnLeer = document.getElementById('btnLeer');
const estado = document.getElementById('estado');

const formatDate = (date) => date.toLocaleDateString('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

if (isPreview) {
  subtitulo.textContent = 'Modo vista previa: validas aquí y la lectura se abre en otra ventana.';
}

const fromBase64 = (str) => decodeURIComponent(escape(atob(str)));

const crypt = (text, secret) => {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    out += String.fromCharCode(text.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
  }
  return out;
};

const decrypt = (cipherText, secret) => crypt(fromBase64(cipherText), secret);

const readStored = () => {
  const raw = localStorage.getItem(KEY_STORAGE);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const isValidPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return false;
  if (typeof payload.createdAt !== 'string') return false;
  if (typeof payload.sealedFor !== 'string') return false;
  if (typeof payload.data !== 'string') return false;
  return true;
};

btnLeer.addEventListener('click', () => {
  const saved = readStored();
  const pass = claveLectura.value.trim();
  const now = new Date();

  if (!saved || !isValidPayload(saved)) {
    estado.textContent = 'No hay carta guardada en este navegador.';
    return;
  }

  if (!pass) {
    estado.textContent = 'Ingresa la clave compartida.';
    return;
  }

  if (!isPreview && now < FECHA_APERTURA) {
    estado.textContent = `Aún bloqueada: se abre desde el ${formatDate(FECHA_APERTURA)}.`;
    return;
  }

  try {
    const decoded = decrypt(saved.data, pass);
    const parsed = JSON.parse(decoded);

    const lecturaPayload = {
      title: parsed.title,
      body: parsed.body,
      createdAt: saved.createdAt,
      openedAt: now.toISOString(),
      isPreview
    };

    sessionStorage.setItem(KEY_LECTURA_TEMP, JSON.stringify(lecturaPayload));
    const opened = window.open(URL_LECTURA, '_blank');
    if (!opened) {
      estado.textContent = 'El navegador bloqueó la ventana. Permite pop-ups e inténtalo de nuevo.';
      return;
    }

    estado.textContent = isPreview
      ? 'Validación correcta. Lectura abierta en otra ventana (preview).'
      : 'Validación correcta. Lectura abierta en otra ventana.';
  } catch {
    estado.textContent = 'Clave incorrecta o datos dañados.';
  }
});
