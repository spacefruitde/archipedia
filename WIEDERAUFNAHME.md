# Wiederaufnahme (Stand 21.08.2026, Laptop zugeklappt mitten in Welle 2)

## Wo wir stehen
- Live: https://ao-prototyp.pages.dev, 790 Knoten. Fenster-Welle inkl. Opus-Gegenlesung ist komplett eingespielt und deployt (docs/gegenlesung-fenster-2026-08-21.md).
- Welle 2 (Abdichtung/Bauphysik `kab` 42 neue Knoten + 15 Bestands-T3, Licht `eli` 27 neue Knoten) läuft: Struktur in docs/struktur-bauphysik-licht.md (Freigabe pauschal durch Ben), Sonnet-Texte 5 von 6 Gruppen fertig, Gruppe b5x (Nassraum + 15 Bestands-T3) war beim Zuklappen noch nicht fertig.
- 10 neue Schemazeichnungen für Welle 2 liegen in images/ (kab4luftdurch, kab4feuchtevar, kab4balkon, kab4ecke, kab4anschlussunten, kab4fugenmasse, kab4wandboden, eli4raumtiefe, eli4eckfenster, eli4sonnenstand), sichtgeprüft, noch nicht mit Knoten verknüpft (passiert beim Merge über IMAGES in struct-kab-eli.mjs).
- Landkarte: Stufe-2-Reihenfolge auf Netzdichte umgestellt (docs/themenlandkarte.md).

## Arbeitsdateien (ins Repo gesichert, Original im Session-Scratchpad)
staging/welle2/
- struct-kab-eli.mjs: Struktur + IMAGES (Single Source)
- gen-prep2.mjs: erzeugt gen2/shared.md, ids.txt, task-*.json (benötigt Pfad zum Scratchpad; beim Wiederaufnehmen Pfade auf staging/welle2 umbiegen)
- gen2/: shared.md (Vorgaben inkl. Negativliste), ids.txt, task-b1/b2/b34/b5x/l1/l2.json, out-b1/b2/b34/l1/l2.json (fertig); out-b5x.json FEHLT ggf.
- merge2.mjs: Merge + Validierung (`node merge2.mjs` Trockenlauf, `--write` schreibt data.mjs, legt docs/pruefliste-bauphysik-licht-2026-08-21.md an)
- apply-review.mjs, manual.mjs: Einspielen von Opus-Befunden (satzgenau), Beispiel aus Welle 1
- gen1/: review-anleitung.md (Opus-Gegenlesung), ergebnis-r1..r4.json der Fenster-Welle

## Nächste Schritte, in dieser Reihenfolge
1. Prüfen, ob gen2/out-b5x.json existiert und 22 Einträge hat. Sonst Sonnet-Agent für task-b5x.json neu starten (Prompt wie die anderen: shared.md lesen, task lesen, out-b5x.json schreiben; bestandT3-Einträge nur {id,t3,pruefen}).
2. `node staging/welle2/merge2.mjs` (Pfade DIR/STRUCT auf staging/welle2 anpassen), Befunde lesen, dann `--write`; `npm run build`; Querverweis-Kuration (eingehende Links auf neue Knoten prüfen).
3. Opus-Gegenlesung: review-Pakete aus data.mjs + pruefen bauen (wie in Welle 1: review-rX.json mit id, t, eltern, t1, t2, t3, dach, pruefen), 4 bis 5 Opus-Agenten mit review-anleitung.md, Ergebnisse ergebnis-rX.json.
4. Befunde satzgenau einspielen (apply-review.mjs, Pfade anpassen), Anomalie-Scan (Doppelpunkt, Punkt-Komma, Gedankenstriche, Marker-Sätze), manuelle Reste, Build, Deploy (`npx wrangler pages deploy dist --project-name ao-prototyp --branch master --commit-dirty=true`), Protokoll docs/gegenlesung-bauphysik-licht-<datum>.md, CLAUDE.md-Status aktualisieren.
5. Offen aus früheren Runden: Sidebar-Dubletten (UI), archipedia.eu aufschalten (Cloudflare Pages Custom Domain, sobald Ben die Domain aktiviert hat).

## Regeln, die sich bewährt haben
- Sonnet schreibt, Opus liest gegen (mit Websuche, nur amtliche Portale), Fable macht Struktur, Kuration, Zeichnungen, Stil-Pass.
- Befunde immer satzgenau ersetzen (ganzer Satz, wenn der Ersatz ein ganzer Satz ist).
- Jede Zeichnung: viewBox 480x320, Stilvorlage images/STIL.md, Sichtprüfung (QuickLook: `qlmanage -t -s 960 -o <dir> <svg>` als Ersatz, wenn Chrome nicht verbunden ist).
