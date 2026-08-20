# Fachliche Gegenlesung der Fenster-Welle (Opus, 21.08.2026)

Geprüft: 66 Einträge der Sonnet-Welle vom 20.08. (48 neue Knoten, 18 Bestands-T3), in vier Paketen durch Opus-Agenten mit Websuche, Belege nur von amtlichen Portalen und Herausgebern (dinmedia, austrian-standards, sia.ch, oib.or.at, gesetze-im-internet, verwaltungsvorschriften-im-internet, ift, BF). Anleitung: `scratchpad/gen/review-anleitung.md` (Session), Ergebnisse `ergebnis-r1..r4.json`.

## Bilanz
- Urteile: 4 ok, 53 korrigieren, 9 unsicher (nur unbelegte Zahlen). 170 Befunde, davon 155 automatisch satzgenau eingespielt, 15 von Hand.
- 112 Quellen mit Ausgabe/Stand und Prüfdatum 21.08.2026 in `src` ergänzt (46 Knoten). Zwei Quellen verworfen (GAEB-PDF, BMWET-Seite: nicht in der zugelassenen Portalliste).
- Status bleibt generiert; die Gegenlesung ersetzt keine Fachprüfung durch Ben/Partnerin, sie räumt die grobe Fehlerklasse ab.

## Schwerste korrigierte Fehler (Auswahl)
- Absturzsicherung: Kategorie C nach DIN 18008-4:2024-12 falsch als „Zwischenabstützung" beschrieben (richtig: Ausfachung in tragender Konstruktion); erfundene Maßregel für Aufstiegshilfen (OIB-Richtlinie 4 2023: Kletterelemente 15 bis 60 cm, Brüstungstiefe ab 20 cm mindert die Höhe).
- Sommerlicher Wärmeschutz AT: OIB-Richtlinie 3 statt 6; CH „Kühlleistungsgrenze" in SIA 180 erfunden.
- Raffstore: Windwiderstandsklasse in EN 13561 (Markisen) statt DIN EN 13659; Rollladenkasten im GEG als Fensterbauteil statt Außenwand-Einbau bewertet; punktförmige Wärmebrücke „nach DIN 4108 Beiblatt 2" statt DIN EN ISO 10211.
- Psi als „punktueller" Koeffizient (richtig: längenbezogen, punktbezogen ist Chi); Fixfeld-Uw falsch begründet; „bauaufsichtliche Zulassung" statt Europäischer Technischer Bewertung/CE bei Dübeln und Fenstern.
- Fenster-LV DACH: VOB/C-ATV-Zuordnung fehlte (DIN 18355/18360/18361/18358), NPK und eBKP-H als ein System, ÖNORM A 2063 jetzt A 2063-1.
- Entwurf: bündige Lage „erzeugt Tiefe" (Umkehrung), Fensterband „ohne Aussteifung", Lochfassade „ohne Sturz", „Verklotzung" als Eckverbindung, zweiter Rettungsweg bei Festverglasung vergessen, Brüstungshöhe als „zulässig" statt erforderlich und ohne Länderbezug.

## Unsicher (unbelegte Zahlen, Sätze entschärft, zur Fachprüfung)
kfe4schallfuge, kfe4gelinnen, kfe5rollkasten, kfe5holzaluschale, kfe4bankholz, pbl3bemuster, kfe4rahmholzalu, kfe4rahmkunst, kfe4rahmalu.

## Neue Normstände, die in älteren Knoten nachzuziehen sind
DIN 4108-2:2026-05, DIN 4108-7:2026-04, DIN 18008-4:2024-12, DIN 18516-1:2024-10, DIN 18361:2023-09, DIN EN ISO 10077-2:2025-06.

## Lehren für die nächste Welle
1. Sonnet ohne Gegenlesung produziert pro Knoten etwa zwei bis drei fachliche Befunde, davon einer hart; Opus-Gegenlesung mit Websuche ist Pflichtschritt vor Livegang, Kosten etwa 100 bis 200k Tokens je 15 bis 20 Knoten.
2. Befunde werden satzgenau eingespielt (ganzer Satz ersetzt, wenn der Ersatz ein ganzer Satz ist); Teilzitat plus Vollsatz ergibt sonst Textschrott.
3. Sonnet-Prompts der nächsten Welle bekommen die Fehlerklassen dieser Liste als Negativbeispiele mit.
