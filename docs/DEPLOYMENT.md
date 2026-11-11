# Operación de Romina XV

Destino confirmado: `samarros/romina-xv`, rama main. Sitio previsto: https://samarros.github.io/romina-xv/ . Esta URL identifica el destino; comprobar el estado de Actions antes de darlo por publicado.

GitHub Pages debe estar habilitado con fuente **GitHub Actions** en Settings → Pages. El workflow `.github/workflows/deploy.yml` usa acciones oficiales fijadas por SHA, Node24/npm11, npm ci, tests, build, integridad de derivados/audio, smoke de subruta y bienvenida/audio en Chrome. Solo después de esas verificaciones sube dist y despliega en el entorno github-pages. Build tiene contents:read/pages:read; deploy tiene pages:write/id-token:write. No se guardan tokens en código ni archivos.

Vite mantiene rutas relativas, comprobadas bajo `/romina-xv/`. Canonical, og:url, og:image y Twitter image apuntan al destino real. Se conserva noindex/nofollow para la invitación; no constituye protección de acceso. El contenido de Pages es público.

`src/assets/audio/celebration.m4a` es la copia autorizada de publicación, con el hash original verificado. Un clon limpio puede compilar sin la carpeta referencias. No copiar originales adicionales a public o dist. El guard `npm run production:verify` impide archivos fuera de su lista, imágenes originales, auditorías, sourcemaps o laboratorio en dist. Las fuentes OFL y aviso GSAP se distribuyen en licenses/.

Autoplay se intenta una vez con sonido y una sola instancia de audio. Si la política del navegador rechaza play con NotAllowedError, se ofrece «Abrir invitación con música» o «Abrir sin música», además de Escape. La reproducción por botón se llama directamente dentro del gesto. Errores de formato/red dejan el contenido accesible y un reintento; no se fuerzan permisos ni se inicia en mute para después desmutear. El volumen sube gradualmente si el navegador permite modificarlo. Al ocultar la pestaña se pausa y no se reanuda automáticamente al volver. Las políticas de navegadores integrados y dispositivos físicos pueden variar.

Verificación después de desplegar: revisar Actions, comprobar HTTPS y version.json (commit del workflow), nueve secciones, siete fotos, fuentes, galería/visor, bienvenida, audio por gesto, anclas, contador, Maps y WhatsApp. Mensaje exacto: «Confirmo asistencia para celebrar los XV de Romina». Inicio: 19 de diciembre de2026 a las19:00 America/Monterrey.

Reversión: identificar el commit estable anterior en Actions, revertir el cambio mediante un nuevo commit en main y esperar el workflow. No forzar ramas ni borrar historial. Si aún no existe una versión previa, retirar temporalmente Pages desde Settings mientras se corrige. Mantener acceso administrativo a la cuenta samarros; el plugin conectado y el inicio de sesión local son credenciales independientes.

La fuente pública se exporta desde el checkout de trabajo con `scripts/export-public-source.mjs` a una carpeta nueva .publish/release-*. Se conserva el historial local y se excluyen originales/evidencias/credenciales. La copia publicada usa su propio repositorio Git; no hacer push del historial de auditoría por error. Los cambios futuros pueden realizarse directamente en el checkout de publicación o mediante otra exportación revisada, conservando el historial remoto y sin force push.
