# Cabarete Épico

Tema de WordPress (Bootstrap 5.3) para una guía turística de Cabarete, República Dominicana.
Portada con parallax, galería con visor, experiencias, mapa de playas, "un día en Cabarete",
planificador de viaje, calendario de temporadas, dónde dormir y comer, cómo llegar y formulario de contacto.

## Instalar en WordPress

1. Descarga o comprime la carpeta `theme/cabarete-epic` en un zip llamado `cabarete-epic.zip`.
2. En WordPress: Apariencia > Temas > Añadir nuevo > Subir tema.
3. Sube el zip, instala y activa. La portada ya muestra la guía completa.

Más detalles en `theme/cabarete-epic/README.txt`.

## Ver la página sin WordPress

Abre `index.html` en el navegador con doble clic. Es la misma página en un solo archivo.
El formulario de contacto solo envía mensajes dentro de WordPress.

### Publicarla con GitHub Pages

En el repositorio: Settings > Pages > Source: Deploy from a branch > Branch: `main` / `(root)` > Save.
En uno o dos minutos queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.
GitHub Pages sirve HTML estático, así que muestra esta página pero no el tema de WordPress (necesita PHP).

## Estructura

```
src/                    Fuente: main.html, nav.html, footer.html, main.css, main.js
theme/cabarete-epic/    Tema listo para instalar (se genera con build.py)
build.py                Genera el tema y la vista previa a partir de src/
index.html              Página completa en un solo archivo (para GitHub Pages)
```

## Editar y regenerar

Cambia los archivos de `src/` y ejecuta:

```
python3 build.py
```

Esto actualiza `theme/cabarete-epic` y crea `out/cabarete-epic-preview.html`.
Requiere Python 3. Las fotos están en `theme/cabarete-epic/assets/img`.

## Créditos y notas

- Bootstrap 5.3.3 (licencia MIT) va incluido en el tema.
- Tipografías: Bricolage Grotesque e Inter, desde Google Fonts.
- Los datos de la guía provienen de las fuentes citadas al final de la página. Confirma tarifas y horarios antes de viajar.
- Las fotos fueron aportadas por el autor del sitio. Si el repositorio es público, confirma que tienes derechos para publicarlas.
- Este repositorio no incluye licencia propia. Agrega la que prefieras (por ejemplo MIT o GPL v2) antes de compartirlo.
