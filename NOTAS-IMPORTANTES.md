# Notas importantes - Cápsula del tiempo

## Flujo actual (2 ventanas)
1. **Pantalla principal**: `carta-para-tu-yo-del-futuro.html`
   - Crear/guardar carta
   - Exportar e importar respaldo
   - Abrir entrega real o preview
2. **Ventana de checking**: `pantalla-entrega.html`
   - Validación de clave y fecha
3. **Ventana de lectura**: `pantalla-lectura.html`
   - Muestra la carta solo después de validar en la ventana anterior

## Dónde se guarda
- La carta se guarda en `localStorage` con la llave:
  - `capsula_carta_2026_2027`
- La lectura temporal entre ventanas usa `sessionStorage` con la llave:
  - `capsula_lectura_temp`

## Respaldo (muy recomendado)
- Usa **Exportar respaldo** para guardar un `.json`.
- Guarda ese archivo en nube/drive/correo para no perderlo.
- Si cambias de navegador o dispositivo, usa **Importar respaldo**.

## Riesgos y límites
- Si se borran datos del navegador, se pierde la carta local.
- Si el navegador bloquea pop-ups, la lectura en segunda ventana no abrirá.
- El cifrado usado es ligero (XOR) para privacidad básica, no seguridad de nivel bancario.

## Recomendaciones de entrega
- Probar una vez completa (guardar -> checking -> lectura) antes de entregarlo.
- Confirmar que la fecha del dispositivo esté correcta.
- Activar pop-ups para este sitio/archivo si no abre la ventana de lectura.
