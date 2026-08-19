# Projektstand (19.08.2026) und offene Punkte

MVP Stufe 1 ist komplett: 700 Knoten (Themenlandkarte bis E3 mit T1, Muster-Äste tiefer) live auf https://ao-prototyp.netlify.app, Supabase (Projekt „Architektur", ygdorhwlautrfekhvlbd) ist führend und deckungsgleich mit data.mjs (Rundlauf pull-data → build verifiziert, 0 Abweichungen). 302 verifizierte src-Einträge an 120 Prozess-Knoten (26 Kernquellen, geprueft 2026-08-19), check-links grün (337 Links). UI: Perspektiven-Einstieg, Themen-Menü, Land/Region-Umschalter (DE/AT/CH plus Bundesland/Kanton, localStorage).

## Offene Punkte

1. **kma1 (K13 Material) hat 8 Kinder**, Spec erlaubt 7; Build warnt. Entscheidung Ben: Gruppen zusammenlegen oder Regel für Wurzelknoten lockern.
2. **31 unverifizierte Quellen-Schlüssel** in `staging/pruefliste-offen.json` (u. a. ABGB, IVöB, SIA 142/143/2051, MuKEn, VKF, BEG/KfW/BAFA, ÖGNI, NPK, UVgO, MBO, ÖNORM A 2063/A 6241/LM.VM): per Websuche verifizieren und an die betroffenen Knoten hängen (Fable-Arbeit).
3. **Querverweis-Backlog**: `staging/lnwunsch.json` (rund 90 Wünsche der Generierungs-Agenten); viele Ziele existieren inzwischen, Kuratierung steht aus.
4. **Landesspezifische Inhalte**: Der Region-Umschalter ist vorbereitet, aber unterhalb der Nationalebene gibt es noch keine Inhalte; dach-Felder können später je Land Objekte statt Strings tragen (Schema jsonb, kein Migrationsbedarf).
5. **Bilder** (SVG-Schemazeichnungen, Wikimedia Commons mit Lizenz ins images-Feld): noch nicht begonnen.
6. **Stufe 2, Tiefe in Wellen** laut Landkarte: Fenster → Flachdach → Abdichtung/Bauphysik → Baurecht (P3) → Trockenbau → Böden → Kosten (P4). Ablauf je Welle: Sonnet generiert T2/T3 gegen Spec mit Musterknoten, Fable verifiziert alle Norm-/Rechtsangaben per Websuche und macht den Stil-Pass, danach DB-Update (Sonnet), pull-data, build, deploy.
7. **Auto-Deploy**: derzeit manuell (`netlify deploy --prod --dir dist`, Konto ben@spacefruit.de, Team Archi-tektur); optional GitHub-Repo anlegen und mit Netlify verknüpfen.

## Arbeitsregeln-Merker

Modellstrategie und Supabase-Zugang: siehe CLAUDE.md. Reihenfolge bei Datenänderungen: erst Supabase aktualisieren, dann `npm run pull-data && npm run build && npm run check-links`, dann deployen. data.mjs nie mehr von Hand als führend behandeln.
