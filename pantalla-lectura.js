const KEY_LECTURA_TEMP = 'capsula_lectura_temp';

const metaCarta = document.getElementById('metaCarta');
const resultado = document.getElementById('resultado');
const tituloCarta = document.getElementById('tituloCarta');
const textoCarta = document.getElementById('textoCarta');
const estado = document.getElementById('estado');

const formatDate = (date) => date.toLocaleDateString('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const raw = sessionStorage.getItem(KEY_LECTURA_TEMP);
if (!raw) {
  estado.textContent = 'No hay lectura disponible. Abre esta ventana desde la pantalla de entrega.';
} else {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.title || !parsed?.body || !parsed?.createdAt || !parsed?.openedAt) {
      throw new Error('invalid');
    }

    tituloCarta.textContent = parsed.title;
    textoCarta.textContent = parsed.body;
    metaCarta.textContent = `Sellada el ${formatDate(new Date(parsed.createdAt))} · Abierta el ${formatDate(new Date(parsed.openedAt))}`;
    resultado.classList.remove('hidden');
    estado.textContent = parsed.isPreview
      ? 'Vista previa de lectura abierta correctamente. 💖'
      : 'Lectura abierta correctamente. 💖';
  } catch {
    estado.textContent = 'No se pudo cargar la lectura. Vuelve a validar en la pantalla de entrega.';
  }
}
