# Hero video — "One Partner. Multiple Solutions."

Un monitor de signos vitales de hospital que **se arma de izquierda a derecha** y
queda montado en el tercio derecho. Fondo **100 % transparente** (alfa real).

## Qué entregar al sitio

| Archivo | Qué es | Cuándo usarlo |
|---|---|---|
| **`hero-assembly-loop.webm`** | **Recomendado.** 10 s, ping-pong (se arma y se desarma), VP9 + **alfa real**. 4,3 MB | Es el que va en el hero. El loop no tiene corte visible. |
| `hero-assembly.webm` | 5 s, solo el armado, VP9 + alfa real. 2,2 MB | Si lo querés como animación de entrada, sin loop. |
| `hero-assembly-loop.mp4` / `hero-assembly.mp4` | H.264, **sin alfa**, compuesto sobre `#f7fbff` | Fallback para navegadores sin VP9-alfa. |
| `hero-assembly-poster.png` | Último frame con alfa, 1920×1080 | `poster` del `<video>`. |

Todos 1920×1080 · 24 fps.

```html
<div class="hero-visual">
  <video autoplay muted loop playsinline preload="metadata"
         poster="hero-assembly-poster.png" aria-hidden="true">
    <source src="hero-assembly-loop.webm" type="video/webm">
    <source src="hero-assembly-loop.mp4"  type="video/mp4">
  </video>
</div>
```
```css
.hero-visual{position:relative;aspect-ratio:16/9}
.hero-visual video{width:100%;height:100%;display:block;object-fit:contain}
@media (prefers-reduced-motion:reduce){.hero-visual video{display:none}}
```

El `<video>` va en la **columna derecha** del `.hero-grid` (hoy `1.05fr .95fr`,
texto a la izquierda). La máquina ocupa de 72 % a 91 % del ancho, así que los dos
tercios izquierdos quedan libres para el copy. No hace falta `mix-blend-mode`:
el alfa es real, se compone sobre cualquier fondo.

## Por qué esta escena

El copy del sitio repite una sola idea con distintas palabras:

> "One Partner. Multiple Solutions." · "From Assessment to Measurable Improvement."
> (Assess → Identify → Plan → Implement → Measure → Optimize) ·
> "Your Revenue Cycle, **Connected**." · "Turn Plans Into Operating **Discipline**."

Todo es lo mismo: **piezas sueltas que se vuelven un sistema que funciona.** El
video es esa frase, actuada con equipo médico real, y avanza de izquierda a
derecha igual que el proceso de 6 pasos de la página.

El objeto elegido es un monitor de signos vitales sobre pedestal rodante porque
contiene las tres líneas de negocio en un solo aparato:

| Parte | Línea de Assist Point |
|---|---|
| La pantalla | Analytics & Reporting · Revenue Visibility · "Measure" |
| Brazalete, sensor de dedo, cables de ECG | CCM · RPM · PCM — *"connected devices bring physiologic data into the care team's workflow"* |
| Poste, brazo y base con ruedas | Operations & Consulting — lo que sostiene todo |

## Comportamiento

| Tiempo | Qué pasa |
|---|---|
| 0,0 – 0,8 s | Las piezas flotan separadas a la izquierda, deriva mínima. |
| 0,8 – 2,2 s | Viajan hacia la derecha. La base con ruedas y el poste van adelante y se enderezan. |
| 2,2 – 3,6 s | Carcasa, placa, batería, panel y bisel se cierran en un solo cuerpo; el brazo se acopla al poste y el monitor se monta. |
| 3,6 – 4,4 s | Brazalete, sensor de dedo y cables de ECG se enchufan y se asientan con peso. |
| 4,4 – 5,0 s | Reposo en el tercio derecho. La pantalla enciende con la onda de ECG. |
| 5,0 – 10,0 s | *(solo en `-loop`)* el mismo movimiento al revés: se desarma y vuelve al inicio. |

## Verificación

- Movimiento medido frame a frame: el centroide va de 0,44 a 0,82 de forma
  **monótona**, sin un solo salto (> 0,025 de ancho) en los 121 frames.
- Variación de alfa entre frames consecutivos: máx. 0,008 → sin parpadeo.
- El verde de fondo derivaba entre frames (96–102 de "greenness"), que es la causa
  típica de parpadeo al recortar. Se normalizó **por frame** con un umbral
  adaptativo antes de extraer el alfa, no con un umbral fijo.
- Probado en Chrome sobre damero, magenta y navy: **cero halo verde**, cero fondo
  opaco.

## Frames fuente

`frame-A-exploded*` y `frame-B-assembled*` — los dos frames aprobados.
`-key` = croma plano (lo que consume Kling), `-alpha` = con alfa, `preview-on-hero-*`
= compuestos sobre el degradado real del hero.

Generado con Nano Banana Pro (frames) + **Kling 3.0** (`kling-3.0/video`, modo pro,
5 s, 16:9, first/last frame).
