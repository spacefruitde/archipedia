# MVP Stufe 1 – Anleitung für Generierungs-Agenten

Du erzeugst für ArchiPedia (Wissensplattform für Architekten im DACH-Raum) einen oder mehrere Äste als „begehbares Gerüst": Ebenen 1 bis 3, nur T1-Überblickstexte.

## Pflichtlektüre, in dieser Reihenfolge (vollständig lesen)

1. `/Users/ben/Documents/AO/docs/autoren-spezifikation.md` – das maßgebliche Dokument: Schema, 7 Regeln, Tonlage.
2. `/Users/ben/Documents/AO/docs/themenlandkarte.md` – dort NUR den Abschnitt zu deinen Ästen: Die E2-Zeilen der Landkarte sind VERBINDLICH (exakt diese Hauptgruppen, nicht mehr, nicht weniger; Titel dürfen sprachlich geglättet werden).
3. Musterknoten als Stilreferenz aus `/Users/ben/Documents/AO/data.mjs`: grep nach `k5spiegel:`, `e3zaesur:`, `x4bogen:`, `k3kombi:` und lies die vollständigen Einträge. Deine T1-Texte müssen exakt diese Tonlage treffen.
4. `/private/tmp/claude-501/-Users-ben-Documents-AO/49e3b261-a7fc-45ae-b39b-3d2ef2109005/scratchpad/bestand-ids.txt` – alle 97 bestehenden Knoten (id · Perspektive+Ebene · Titel) als erlaubte Querverweis-Ziele.

## Was du erzeugst

Pro Ast: genau EIN Wurzelknoten (lv 1), darunter die E2-Hauptgruppen exakt nach Landkarte (lv 2), darunter je E2-Gruppe 3 bis 5 Kindknoten (lv 3), nur wo der Schnitt fachlich trägt. Ziel je Ast: 15 bis 25 Knoten. Maximal 7 Kinder pro Knoten, immer.

Jeder Knoten hat NUR diese Felder:
- `id`: Ast-Präfix + Ebene + deutsches Kurzwort, klein, nur [a-z0-9], z. B. `kfe1`, `kfe2glas`, `kfe3sonnen`. Das Präfix bekommst du zugeteilt. IDs müssen dateiweit eindeutig sein und dürfen mit KEINER ID aus bestand-ids.txt identisch sein.
- `p`: Perspektiven-Buchstabe laut Zuteilung (`k`, `e`, `x` oder `p`).
- `lv`: 1, 2 oder 3.
- `pa`: Eltern-ID (fehlt nur beim Wurzelknoten).
- `t`: Titel, maximal 45 Zeichen.
- `t1`: Überblick, 2–4 Sätze, Tonlage nach Spec Abschnitt 3: was ist es, warum relevant, wo hängt es; mit einer Einordnung, die ein Studierender behält. KEINE Normzitate, KEINE Paragraphen, KEINE Maße außer zur Anschauung, KEINE Weblinks.
- `ln` (optional): Querverweis-IDs. Erlaubt sind NUR IDs aus bestand-ids.txt oder aus deiner eigenen Ausgabe. Bevorzugt perspektivwechselnd, nur echte Anschlussfragen, maximal 3 pro Knoten. Wenn es kein gutes Ziel gibt: Feld weglassen (kein erzwungener Verweis).
- `lnwunsch` (optional): Freitext-Liste künftiger Querverweis-Ziele, die es noch nicht gibt (z. B. "Fenster: Baukörperanschluss"). Wird später kuratiert.
- Prozess-Agenten zusätzlich: siehe deine Sonderregeln im Auftrag.

KEINE weiteren Felder. Kein `src`, kein `t2`, kein `t3`, kein `dach` (Ausnahme: Prozess-Agenten laut Auftrag), kein `status`.

## Sprachregeln (hart)

Deutsch. KEINE Gedankenstriche (kein „–", kein „—") in `t` und `t1`; Kommas, Doppelpunkte oder Klammern verwenden. Keine Aufzählungen im Fließtext. Keine Herstellernamen, keine Marketing-Adjektive. Fachbegriffe beim ersten Auftreten in einem Halbsatz erklärt. Es darf eine Haltung erkennbar sein: ArchiPedia berät, es referiert nicht.

## Ausgabe

Schreibe eine einzige JSON-Datei (UTF-8) an den dir zugeteilten Pfad: ein Array von Knoten-Objekten in Anzeige-Reihenfolge (Wurzel zuerst, dann je E2-Gruppe die Gruppe gefolgt von ihren E3-Kindern; die Reihenfolge der E2-Gruppen wie in der Landkarte).

Validiere vor der Abgabe selbst mit Node: JSON parsebar, IDs eindeutig, jedes `pa` zeigt auf eine ID der Datei, jedes `ln`-Ziel existiert (Datei oder bestand-ids.txt), kein Titel über 45 Zeichen, kein „–"/„—" in t/t1, maximal 7 Kinder pro Knoten. Gib im Abschlussbericht zurück: Knotenzahl je Ast, Anzahl Querverweise, drei Beispiel-t1 (Wurzel plus zwei E3), sowie deine lnwunsch-Sammlung.
