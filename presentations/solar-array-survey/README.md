# Sizing a Rooftop Solar Array — Beamer deck

A 16-slide LaTeX Beamer presentation of the *Solar Array Rooftop Survey
(advanced version)* group activity: recovering an included angle from two
survey bearings, then finding the area of the resulting oblique triangle with
½·a·b·sin C.

Stock `Madrid` theme, 4:3, Computer Modern serif.

## Before presenting

Fill in the title-page fields at the top of `main.tex` — they ship as
placeholders:

```latex
\author[Group N]{First Member \and Second Member \and Third Member}
\institute[]{Group Activity --- Trigonometry}
\date{\today}
```

## Build

```bash
make            # -> main.pdf
make notes      # -> main-notes.pdf, speaker notes after each slide
make clean
```

Or directly: `pdflatex main.tex` (run it twice).

Needs `beamer`, `tikz`, `amsmath`, `booktabs`, `lmodern` — all in a standard
TeX Live install. On Debian/Ubuntu:

```bash
apt-get install texlive-latex-base texlive-latex-recommended \
                texlive-latex-extra texlive-pictures \
                texlive-fonts-recommended lmodern
```

## Files

| File | Contents |
|---|---|
| `main.tex` | The slides |
| `preamble.tex` | Theme, figure palette, shared TikZ styles |
| `diagrams.tex` | All seven TikZ figures, one macro each |

The figures use only the theme's own two colours — structure blue for survey
data, red for the quantity being derived, greys for everything supporting — so
they sit inside the deck rather than next to it.

## The diagrams

All figures are drawn in TikZ — no external images, so the deck is
self-contained and every label is real text.

1. `\diagRooftop` — plan view of the warehouse roof, with the triangular
   corner shaded between the two structural beams.
2. `\diagBearingConvention` — two compass roses showing what bearings 038° and
   142° actually mean.
3. `\diagBearingSubtraction` — both bearings on one figure, with the 104°
   included angle falling out of the difference.
4. `\diagBearingRule` — the general rule side by side with the case that needs
   the 360° adjustment.
5. `\diagSAS` — the triangle reduced to two sides and the angle between them.
6. `\diagHeight` — where sin C comes from, drawn honestly for an obtuse angle
   so the foot of the perpendicular lands outside the triangle.
7. `\diagPanels` — schematic panel packing for the optional capacity estimate.

Shared convention: a bearing is clockwise from north while TikZ measures
anticlockwise from east, so `tikz angle = 90 − bearing`. Bearings 038° and
142° become 52° and −52°, which is why the beams sit symmetrically about the
east axis in every figure.

## A note on the arithmetic

The source activity gives `sin 104° ≈ 0.9709` and an area of `456.89 m²`. The
actual value is `sin 104° = 0.970296…`, which gives

```
470.56 × 0.970296… = 456.582… ≈ 456.58 m²
```

This deck uses **456.58 m²** throughout, and slide 12 shows the difference
explicitly rather than hiding the correction. The optional capacity estimate
follows from the corrected area: 456.58 × 170 ≈ 77.6 kW.

## Editing notes

Two TikZ gotchas are worked around in `diagrams.tex`, and both will bite again
if the figures are edited:

- Inside a node with `align=left`, a `\\[dim]` nested within a `{...}` group
  breaks TikZ's redefined `\\`. Split the text into separate nodes instead.
- `\amber{}` and `\teal{}` are mode-aware (`\ifmmode`) so they can be used
  inside `align*` bodies as well as in running text.
