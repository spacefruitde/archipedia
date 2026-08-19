# Stilvorlage Schemazeichnungen (verbindlich)

Wiedererkennungsstil nach dem Vorbild klassischer Fachheft-Strichzeichnungen: reduziert, präzise, ohne Dekor. Jede Zeichnung erklärt genau EIN Prinzip.

## Technik

- Reines Inline-SVG, `viewBox="0 0 480 320"`, keine externen Referenzen, keine Skripte, keine Filter.
- Hintergrund transparent (die Seite liefert das Papier).
- Genau zwei Strichstärken: 2.2 für Schnittkanten und Primärkonturen, 1.1 für Sekundärlinien, Maßlinien und Ausweisungen. Farbe der Linien: `#1c1a17`.
- Genau EINE Akzentfarbe: `#b05c3a` (Flächenfüllung mit `fill-opacity="0.18"` oder Akzentlinie), nur für das eine Element, um das es geht.
- Geschnittenes Material als Schraffur: `<pattern>` mit 45-Grad-Linien, Abstand 6, Strichstärke 0.7. Dämmstoff als lockere Wellen- oder Kreuzschraffur, Beton als Punkt-Dreieck-Andeutung sparsam.
- Beschriftung: `font-family="-apple-system,sans-serif"` `font-size="11"`, Fülle `#1c1a17`; Hinweislinien 1.1 mit kleinem Endpunkt (`circle r="1.6"`). Maximal 6 Beschriftungen pro Zeichnung.
- Keine Verläufe, keine Schatten, keine Isometrie-Spielereien; Schnitt oder einfache Axonometrie mit zwei Fluchten.

## Inhalt

- Nur zeichnen, was das Prinzip trägt; Nachbarbauteile als stumme Kontur.
- Maße nur, wenn sie im Knotentext vorkommen; keine erfundenen Zahlen.
- Bildunterschrift (caption) ein Satz, benennt das Prinzip, nicht die Teile.
- credit: "Eigene Schemazeichnung", lizenz: "CC BY 4.0".

## Muster

`muster-nullschwelle.svg` ist der verbindliche Qualitätsanker: Schnitt durch eine Nullschwelle mit Entwässerungsrinne, Akzent auf der Rinne, Schraffur im Estrich, vier Beschriftungen.
