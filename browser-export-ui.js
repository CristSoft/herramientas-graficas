(() => {
  'use strict';
  const kind = document.querySelector('#render-mp4') ? 'lower' : 'cierre';
  const lower = kind === 'lower';
  const button = document.querySelector(lower ? '#render-mp4' : '#render-video');
  const download = document.querySelector(lower ? '#download-mp4' : '#download-video');
  const container = document.querySelector('#export-container');
  const duration = document.querySelector('#export-duration');
  const feedback = document.querySelector('.render-feedback');
  const status = document.querySelector('#render-status');
  const progress = document.querySelector('#render-progress');
  const background = document.querySelector('#export-background');
  const cancel = document.createElement('button');
  cancel.id = 'cancel-export'; cancel.type = 'button'; cancel.textContent = 'Cancelar'; cancel.hidden = true;
  cancel.style.marginLeft = '10px'; button.after(cancel);
  let controller, downloadURL;
  function update() {
    const png = container.value === 'png';
    const alpha = container.value !== 'mp4';
    if (lower) {
      const note = document.querySelector('#export-note');
      if (note) note.textContent = png ? 'La imagen se genera en tu navegador, con el zócalo completo.' : 'El video se genera en tu navegador. Mantené esta página abierta hasta que termine.';
      document.querySelector('#background-label').hidden = alpha;
      document.querySelector('#custom-background-label').hidden = alpha || background.value !== 'custom';
      document.querySelector('#mp4-hint').hidden = alpha;
      document.querySelector('#mov-hint').hidden = container.value !== 'mov';
      document.querySelector('#png-hint').hidden = !png;
      document.querySelector('.video-hint').hidden = png;
    } else {
      document.querySelector('#format-hint').textContent = alpha ? 'MOV ProRes 4444 con transparencia, para superponerlo en tu editor de video.' : 'Incluye el color de fondo elegido. Listo para usar como cierre.';
    }
    if (!button.disabled) button.textContent = 'Generar ' + container.value.toUpperCase();
  }
  button.addEventListener('click', async () => {
    const png = container.value === 'png';
    if (lower && !png && !window.lowerThird.commitTiming(true)) return;
    if (!lower && (!duration.reportValidity() || !document.querySelector('#entrance-duration').reportValidity())) return;
    controller = new AbortController();
    feedback.hidden = false; feedback.classList.remove('error'); download.hidden = true; progress.value = 0;
    button.disabled = true; button.textContent = 'Generando…'; cancel.hidden = false;
    if (downloadURL) { URL.revokeObjectURL(downloadURL); downloadURL = null; }
    const config = lower ? {...window.lowerThird.getConfig(),format:document.querySelector('#export-format').value,background:background.value === 'green' ? '#00ff00' : background.value === 'black' ? '#000000' : document.querySelector('#export-background-color').value} : window.closingCard.getConfig();
    if (!lower) config.duration = Number(duration.value);
    config.container = container.value;
    try {
      const result = await window.BrowserExporter.render(kind, config, (value,message) => { progress.value = value; status.textContent = message; }, controller.signal);
      downloadURL = URL.createObjectURL(result.blob);
      download.href = downloadURL; download.download = result.filename; download.textContent = 'Descargar ' + config.container.toUpperCase(); download.hidden = false;
      // Useful for checking performance without retaining the video in memory twice.
      button.dataset.lastSeconds = result.seconds.toFixed(2);
      button.dataset.lastBytes = String(result.blob.size);
    } catch (error) {
      if (error.name === 'AbortError') status.textContent = 'Exportación cancelada. Podés volver a intentarlo.';
      else { feedback.classList.add('error'); status.textContent = error.message || 'No se pudo generar el video.'; }
    } finally {
      controller = null; button.disabled = false; cancel.hidden = true; update();
    }
  });
  cancel.addEventListener('click', () => { controller?.abort(); cancel.disabled = true; status.textContent = 'Cancelando…'; setTimeout(() => { cancel.disabled = false; }, 0); });
  container.addEventListener('change', update); background?.addEventListener('change', update);
  update();
})();
