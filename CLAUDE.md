# ArchiPedia (Arbeitsname – wird umbenannt, Name nirgends hart verdrahten außer im Build)

Wissensplattform für Architekten im DACH-Raum: alle Themen des architektonischen Prozesses in verschachtelten Detaillierungsstufen, drei Lesetiefen, vier Perspektiven, kuratierte Querverweise. Positionierung: tiefer als Baunetzwissen, strukturierter als Wikipedia, weniger bildlastig als ArchDaily.

## Projektstruktur

- `data.mjs` – die gesamte Datenbasis (Single Source of Truth, solange Supabase nicht führend ist). Ein Knoten pro Eintrag, Schema siehe `docs/autoren-spezifikation.md` Abschnitt 1.
- `build.mjs` – erzeugt `dist/index.html` (statischer, JS-freier Prototyp) und führt Konsistenzprüfungen aus (tote Verweise, >7 Kinder, T3 ohne „Ab hier"-Absprung).
- `check-links.mjs` – prüft alle Quellen-URLs; tote Links = Exit 1 (für CI/Netlify-Build).
- `gen-seed.mjs` – erzeugt Seed-SQL aus `data.mjs`.
- `schema.sql` / `seed_all.sql` – Supabase-Schema (public.nodes) und Seed der aktuellen 97 Knoten.
- `docs/themenlandkarte.md` – kuratierte Karte aller Äste (E1–E2), 4 Perspektiven. Wird von Ben/Partnerin redigiert, ist Vorgabe für jede Generierung.
- `docs/autoren-spezifikation.md` – **das wichtigste Dokument**: Knoten-Schema, 7 Regeln, Tonlage pro Lesetiefe, Musterknoten, Generierungs-Prompt, Review-Checkliste. Jeder generierte Inhalt MUSS dieser Spec folgen.
- `docs/tueren-hierarchie.md` – Konzeptdokument des Muster-Asts.

## Kommandos

- `npm run build` – Prototyp bauen + Konsistenzprüfung (nach JEDER Datenänderung ausführen)
- `npm run check-links` – Quellen-Links prüfen
- `npm run gen-seed` – Seed-SQL neu erzeugen

## Arbeitsregeln (nicht verhandelbar)

1. Inhalte entstehen NUR gegen `docs/autoren-spezifikation.md`; Stilreferenz sind die Musterknoten (k5spiegel, e3zaesur, x4bogen, k3kombi).
2. Struktur vor Text: neuer Ast = erst Strukturvorschlag (E1–E4) zur Redaktion an Ben, dann Texte.
3. Jede Norm-/Rechtsangabe braucht `src` mit `stand` (Fassung/Ausgabe mit Datum), echtem Link auf amtliche Portale bzw. Herausgeber (gesetze-im-internet.de, recht.nrw.de, ris.bka.gv.at, fedlex.admin.ch, dinmedia.de, oib.or.at, sia.ch, vkf.ch) und `geprueft`-Datum. Links und Stände per Websuche verifizieren, NIE aus dem Gedächtnis behaupten.
4. Länderabhängige Werte (Baurecht, Barrierefreiheit, Brand-, Schallschutz, Prozess) bekommen ein `dach`-Feld (de/at/ch). Deutsche Werte nie als universell ausgeben.
5. T3-Inhalte tragen Status `generiert`, bis ein Mensch sie fachgeprüft hat. Status nie eigenmächtig hochstufen.
6. Keine Gedankenstriche in Inhaltstexten, deutsch, keine Herstellernamen, keine Marketing-Adjektive.
7. Bilder: nur eigene SVG-Schemazeichnungen oder Wikimedia Commons mit Lizenzvermerk (Feld `images`). Keine Fotos von ArchDaily/Detail/Herstellern.

## Modellstrategie (Token-Ökonomie)

- **Fable 5** nur, wo es haftet oder denkt: Struktur-Redaktion, alle T3- und DACH-Inhalte, Quellen-Verifikation per Websuche (Rechtsstand!), Querverweis-Kuration, finaler Stil-Pass.
- **Sonnet** für die Masse: T1/T2-Texte und Strukturvorschläge, immer mit vollständiger Spec und Musterknoten im Prompt.
- **Haiku** für Mechanik: Schema-Validierung, Bildunterschriften, Umformatierungen, Dublettenprüfung.
- Parallele Wellen (mehrere Äste gleichzeitig, gegenseitige Querverweis-Prüfung) nur per Multi-Agenten-Workflow und nur auf explizites Opt-in von Ben („nutze einen Workflow").
- Das Nadelöhr ist Bens Review, nicht das Kontingent: erst das begehbare Gerüst (Stufe 1), dann Tiefe in Wellen.

## Supabase

Organisation: **Spacefruit** (dort läuft auch bugsnap). Ben hat ein neues Projekt angelegt. Achtung: Der claude.ai-Connector kann auf eine andere Organisation gescoped sein (Stand 16.08.2026: zeigt nur „Studio Schönenstein"); vor Arbeitsbeginn mit `list_organizations` prüfen. Fallback, falls der Zugang fehlt: Ben spielt `schema.sql` und `seed_all.sql` von Hand im SQL-Editor ein; für Sync-Skript und weitere Wellen braucht die Session aber trotzdem API-Zugriff (Connector auf Spacefruit oder lokaler MCP mit Personal Access Token wie im Matchbox-Projekt). Erststart: `schema.sql` als Migration anwenden, dann `seed_all.sql` einspielen, mit `list_tables`/`execute_sql` verifizieren, `get_advisors` laufen lassen. Danach ist Supabase führend für Inhalte mit Review-Status; `data.mjs` wird zum Export/Build-Artefakt (Sync-Skript schreiben: Supabase → data.mjs → build).

## Deployment

Ziel: Netlify. Build-Command `npm run build && npm run check-links`, Publish-Verzeichnis `dist`. Der Wortmarken-Text steckt nur in `build.mjs` (Header + Titel), Umbenennung ist eine Zeile.

## Status (15.08.2026)

97 Knoten live: Türen (Muster-Ast, K+E), Treppen (Testlauf nach Spec, K+E), Margarethenhöhe (Kontext). Prozess-Perspektive (`p`) in Landkarte und DB-Schema angelegt, noch ohne Knoten. Bestehende Knoten haben noch KEINE stand/geprueft-Angaben in src – das ist die offene Verifikations-Welle. MVP-Fahrplan siehe Ende der Themenlandkarte (Stufe 1: alle Äste bis E3 mit T1, ~400 Knoten; Stufe 2: Tiefe in Wellen).
