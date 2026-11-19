// Explicitly select the files published to Hosting. Local scripts and logs stay private.
const fs = require('fs');
const path = require('path');
const root = __dirname;
const output = path.join(root, 'public');
const files = [
  'index.html', 'site.css', 'editor-layout.css', 'palettes.js', 'palettes.css', 'browser-export.js', 'browser-export-ui.js',
  ...['index.html','overlay.html','styles.css','variants.js','hymn-3d.js','hymn-3d.webp','logo-symbols.js','logo.js','animation.js','simbolo-circular-oficial.svg','isotipo-iglesia.svg'].map(x => 'lower/' + x),
  ...['index.html','overlay.html','styles.css','motion.css','geometry.css','animation.js','sound.js','Logo-JCP-Sur-Vertical.svg','NotoSans-Regular.ttf'].map(x => 'cierre/' + x),
  ...['index.html','overlay.html','styles.css','symbol.js','flame.js','orbit.js','motion.js','editor.js','assets/simbolo-circular-oficial.svg'].map(x => 'stingers/' + x),
  ...['ffmpeg/ffmpeg.js','ffmpeg/814.ffmpeg.js','core/ffmpeg-core.js','core/ffmpeg-core.wasm','LICENSE-MIT.txt','COPYING.GPLv2.txt','LEEME.txt'].map(x => 'vendor/' + x)
];
fs.mkdirSync(output, {recursive:true});
for (const file of files) {
  const source = path.join(root, file), target = path.join(output, file);
  if (!fs.existsSync(source)) throw new Error('Falta un archivo de publicación: ' + file);
  fs.mkdirSync(path.dirname(target), {recursive:true});
  fs.copyFileSync(source, target);
}
function checkFiles(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) checkFiles(absolute);
    else if (!files.includes(path.relative(output, absolute).split(path.sep).join('/'))) {
      throw new Error('Hay un archivo no previsto en la carpeta de publicación: ' + absolute);
    }
  }
}
checkFiles(output);
console.log(`Hosting preparado: ${files.length} archivos, ${(files.reduce((n,f) => n+fs.statSync(path.join(output,f)).size,0)/1024/1024).toFixed(1)} MB.`);
