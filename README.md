# Herramientas Gráficas

Editor web para crear zócalos animados (lower thirds), cierres con logotipo y transiciones stinger. Permite personalizar colores, guardar paletas y exportar desde el navegador.

- [Abrir Herramientas Gráficas](https://herramientasgraficas.web.app/)
- [Plugin de zócalos para OBS Studio](https://github.com/CristSoft/lower-thirds-zocalos)

## Ejecutar en local

Con Node.js instalado, ejecutá `npm start` y abrí [http://127.0.0.1:8772](http://127.0.0.1:8772). Los editores y la exportación funcionan con archivos estáticos. La primera exportación carga FFmpeg WASM, de aproximadamente 32 MB.

## Preparar una publicación

Ejecutá `npm run build:hosting` para generar `public/`. La configuración de Firebase Hosting se encuentra en `firebase.json`. Si tenés acceso al proyecto, podés publicar con `firebase deploy --only hosting`.

Las referencias y licencias de los componentes de exportación están en [vendor/LEEME.txt](vendor/LEEME.txt).
