# Handoff an Claude (Fable 5) – Claude Code Terminal-Session

Du übernimmst das Projekt „ArchiPedia" (Arbeitsname, wird umbenannt) von einer Cowork-Session vom 15.08.2026. Ben ist Architekt und dein Sparringspartner: Er will Widerspruch, wenn etwas wackelt, keine Füllfloskeln, deutsch, keine Gedankenstriche in Inhaltstexten. Lies zuerst `CLAUDE.md`, dann `docs/autoren-spezifikation.md` vollständig, dann die Enden von `docs/themenlandkarte.md` (MVP-Fahrplan). Erst danach handeln.

## Kontext in drei Sätzen

Wir bauen eine Wissensplattform für Architekten im DACH-Raum: vier Perspektiven (Konstruktion, Entwurf, Kontext, Prozess), Hierarchie-Ebenen E1–E7, drei Lesetiefen (T1 Überblick / T2 Vertiefung / T3 Spezifikation), kuratierte Querverweise zwischen den Perspektiven. Der Kern-Moat ist die von Hand entworfene Ontologie plus geprüfte Spezifikationsebene mit Rechtsstand, nicht der Renderer. 97 Knoten existieren (Türen als Muster-Ast, Treppen als Reproduzierbarkeits-Test, Margarethenhöhe als Fallstudie); der statische Prototyp baut mit `npm run build` nach `dist/index.html`.

## Deine Aufgaben, in dieser Reihenfolge

**1. Supabase produktiv machen (MCP ist in dieser Session verbunden).**
Organisation Spacefruit, Ben hat ein frisches Projekt angelegt (dort läuft auch bugsnap; nicht verwechseln, nichts an bugsnap anfassen). `schema.sql` als Migration anwenden, `seed_all.sql` einspielen, mit list_tables und einer Stichproben-Query verifizieren, get_advisors ausführen und Findings beheben. Danach ein Sync-Skript `pull-data.mjs` schreiben (Supabase → data.mjs), damit der Build aus der Datenbank gespeist werden kann; ab dann ist Supabase führend, data.mjs ist Artefakt.

**2. Verifikations-Welle über die bestehenden 97 Knoten.**
Die vorhandenen src-Einträge haben noch keine stand/geprueft-Angaben und teils keine Links. Für jeden Knoten mit src oder dach: per Websuche die Quelle verifizieren (existiert die Norm/das Gesetz, aktuelle Fassung, korrekter amtlicher Link nach der Linkpolitik in der Spec, Regel 6), `stand` und `geprueft` setzen, fachliche Abweichungen an Ben melden statt still zu korrigieren. Nichts aus dem Gedächtnis behaupten; was du nicht verifizieren kannst, bleibt ohne Stand und der Knoten auf Status `generiert`. `npm run check-links` muss am Ende grün sein.

**3. MVP Stufe 1: das begehbare Gerüst.**
Gegen die (von Ben redigierte!) `docs/themenlandkarte.md` alle Äste bis Ebene 3 mit T1-Texten anlegen, inklusive der neuen Prozess-Perspektive (`p`). Vorgehen pro Ast strikt nach Spec Abschnitt 6: erst Strukturvorschlag E1–E4 als kompakte Liste an Ben zur Redaktion, erst nach seinem Go die Texte. Querverweis-Kandidaten vorschlagen, aber als Vorschlag kennzeichnen. Modell-Ökonomie: T1-Masse und Strukturentwürfe darfst du an Subagenten mit günstigerem Modell (Sonnet) delegieren, Spec und Musterknoten vollständig in deren Prompt; alles mit Norm-/Rechtsbezug, alle DACH-Felder und die finale Stilkontrolle machst du selbst. Nach jeder Welle `npm run build` (Konsistenzprüfung) und Datenbank aktualisieren.

**4. Danach, mit Ben abstimmen:** Netlify-Deployment (Build `npm run build && npm run check-links`, Publish `dist`), SVG-Schemazeichnungs-Pipeline für Bilder (nur eigene Zeichnungen oder Wikimedia Commons mit Lizenzvermerk ins `images`-Feld), Review-UI für den Status-Workflow.

## Rote Linien

Keine erfundenen Links oder Normstände, niemals. Status `fachgeprüft` vergibt nur ein Mensch. Deutsche Rechtslage nie als DACH-universell ausgeben. Struktur-Änderungen an der Themenlandkarte nur mit Ben. Der Projektname fällt bald; Wortmarke nur in build.mjs anfassen. Bei allem, was die Spec nicht abdeckt: fragen statt raten.

Starte mit einer kurzen Bestandsaufnahme (Build laufen lassen, Supabase-Projekt identifizieren) und einem Vorschlag, welcher Ast nach dem Gerüst als erster in die Tiefe geht.
