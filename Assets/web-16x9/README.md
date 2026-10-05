# Assist Point — Imágenes 16:9 (desktop)

Generadas con **Nano Banana Pro** a partir de las imágenes que el sitio usa hoy.
Mismo encuadre y mismo contenido; se subió calidad, realismo y resolución, y se
quitaron textos, marcas y logos de todos los objetos.

- `*.png` — master 2752×1536 (2K), sin comprimir.
- `web/*.webp` — lo que debe ir al sitio (1920 px, 58–127 KB).
- `web/*.jpg` — fallback.

## Dónde va cada una

| Archivo | Reemplaza | Dónde aparece | Contenedor |
|---|---|---|---|
| `hero-clinician-mobile` | `unsplash photo-1576091160399` | Home → hero | `.hero-photo` (470 px alto) |
| `rpm-home-monitoring` | `transtekcorp.com/.../home-blood-pressure-monitors.jpg` | Home → "Keep Patients Connected Between Appointments" | `.visual-split` (420 px alto) |
| `infusion-center` | `lifetreehub.com/images/infusion-center.jpg` | Home → "Infusion & Specialty RCM" · Home → "Infusion Centers" · RCM → "From Order to Payment" | `.photo-tile.tall`, `.photo-tile`, `.visual-split` |
| `hospital-rural-ward` | `unsplash photo-1538108149393` | Home → "Hospital & Rural Health" · Home → "Hospitals & Rural Health" · Hospital → hero | `.photo-tile`, `.landing-hero` |
| `physician-practice-team` | `unsplash photo-1516841273335` | Home → "Physician Practices" (×2) | `.photo-tile` |
| `leadership-meeting` | `s.research.com/uploads/...webp` | Hospital → "Turn Plans Into Operating Discipline" | `.visual-split` (420 px alto) |

## Zonas seguras

Todos los contenedores usan `object-fit:cover`, así que un 16:9 se recorta:

- `.photo-tile` lleva el caption abajo sobre un degradado oscuro → **el tercio
  inferior no debe tener nada crítico**. Ya está compuesto así.
- `.landing-hero` y `.photo-band` llevan el texto a la izquierda → en
  `infusion-center` y `hospital-rural-ward` el tercio izquierdo se dejó limpio.
- `.hero-photo` es casi cuadrado (≈570×470) → recorta fuerte a los lados. El
  sujeto de `hero-clinician-mobile` está centrado para sobrevivir el recorte.

## Notas

- `hospital-rural-ward`: la original era un pabellón con cortinas rosadas que leía
  como instalación antigua. Se mantuvo encuadre y perspectiva, y se llevó a un
  hospital rural estadounidense real y en uso (tomas de oxígeno, llamados de
  enfermería, dispensador, guardián de cortopunzantes). Si lo querés más nuevo y
  pulido, se regenera.
- `leadership-meeting`: se quitaron los monitores de signos vitales que estaban
  dentro de la sala de juntas y el dashboard pasó a geometría limpia sin texto.
- `rpm-home-monitoring`: la lectura del tensiómetro (118/76) se compuso aparte en
  siete segmentos; el modelo no la resolvía bien.
