# Gemeinsame Vorgaben für die Textgenerierung (ArchiPedia, Fenster-Welle 20.08.2026)

Lies zuerst die Autoren-Spezifikation unten vollständig. Sie ist verbindlich: Schema, sieben Regeln, Tonlage pro Lesetiefe, Abschnitt 8 (Qualitäts-Gate).

## Ausgabeformat
Schreibe GENAU EINE Datei (Pfad steht in deiner Aufgabe) mit einem JSON-Array. Jedes Element:
{ "id": "...", "t1": "...", "t2": "...", "t3": "..." (nur wenn in der Aufgabe t3:true), "ln": ["id", ...] (Querverweis-Kandidaten aus der Aufgabe, ergänzt um maximal einen eigenen Vorschlag aus der ID-Liste), "pruefen": ["jede Zahl/Norm/Klasse aus t3 als Kurzstring"], "dach": {"de":"...","at":"...","ch":"..."} (nur wenn dach:true) }
Für Aufgaben mit "bestandT3": true nur { "id", "t3", "pruefen" } liefern; t1/t2 existieren schon und stehen im Kontext, t3 setzt sie voraus und wiederholt nichts.
Kein Markdown, keine Kommentare, valides JSON, deutsche Anführungszeichen im Text sind erlaubt, aber im JSON korrekt escapen.

## Harte Sprachregeln (Build prüft)
- Keine Gedankenstriche (– —), keine Bindestrich-Kaskaden. Komposita-Bindestriche sind Pflicht.
- Keine Aufzählungen, keine Listen, Fließtext.
- Keine Herstellernamen, keine Marken, keine Marketing-Adjektive, keine Leerformeln („sorgfältige Planung", „hochwertig", „beliebt").
- Deutsch, präzise, Haltung erkennbar. Fachbegriff beim ersten Auftreten im Halbsatz erklärt.
- Kein Abkürzungspunkt gefolgt von Leerzeichen mitten im Satz (also „zum Beispiel", nicht „z. B."), weil der Build Sätze am ". " trennt.
- t2 enthält genau einen Satz, der mit „Häufigster Fehler" beginnt, und genau einen Satz, der mit „Kostenlogik:" beginnt (beide werden als Randspalten-Boxen extrahiert; jeder ist ein vollständiger, allein lesbarer Satz).
- t3 endet zwingend mit „Ab hier: …".
- Jeder t1 endet mit einem befolgbaren Satz. Varianten brauchen Auswahlkriterium und Regelfall-Gewinner.
- Kind wiederholt Eltern nicht: Eltern- und Geschwistertexte stehen im Kontext; beginne bei der Frage, die der Elternknoten offenlässt.
- Länderabhängige Werte nie als universell ausgeben; bei dach:true Leitwerte mit „siehe DACH-Kasten", DACH-Einträge nur bei echtem Unterschied und ohne „vergleichbar/ähnlich/entsprechend" als Prädikat. Alles trägt Status generiert; Normnennungen ohne Link sind erlaubt, aber in "pruefen" aufzuführen.


## Negativliste aus der fachlichen Gegenlesung der Fenster-Welle (verbindlich)
Diese Fehlerklassen sind in der letzten Welle aufgetreten und werden von der Gegenlesung markiert. Vermeide sie aktiv:
1. Falsche Normzuordnung: Nenne eine Norm nur, wenn du sicher bist, dass sie genau das regelt (Beispiele aus der letzten Welle: Windwiderstandsklasse von Raffstoren steht in EN 13659, nicht EN 13561; punktförmige Wärmebrücken rechnet DIN EN ISO 10211, nicht DIN 4108 Beiblatt 2; sommerlicher Wärmeschutz in Österreich ist OIB-Richtlinie 6, nicht 3). Im Zweifel „nach der einschlägigen Norm" schreiben und die vermutete Norm in "pruefen" nennen.
2. Begriffe: Psi ist längenbezogen, Chi punktbezogen. Verklotzung ist die Lastübertragung der Scheibe im Falz, keine Eckverbindung. Fenster tragen CE-Kennzeichnung mit Leistungserklärung nach DIN EN 14351-1, keine „bauaufsichtliche Zulassung"; Dübel haben eine Europäische Technische Bewertung oder eine allgemeine Bauartgenehmigung.
3. Keine erfundenen Zahlenregeln: keine Maß-, Prozent- oder Kennwerte, die du nicht einer Norm oder einem Regelwerk zuordnen kannst. Lieber die Größe benennen, an der sich etwas entscheidet, und sagen, wer sie festlegt (Systemnachweis, Norm, Fachplaner).
4. DACH: deutsche Regel nie als allgemein. Wenn DE, AT, CH sich unterscheiden (Absturzsicherung, Barrierefreiheit, Schallschutz, Wärmeschutz, Brandschutz, Abdichtungsnormen, LV-Systematik, Denkmalrecht), entweder dach-Feld (wenn in der Aufgabe vorgesehen) oder im Text „je nach Land: in Deutschland …, in Österreich …, in der Schweiz …" mit den jeweiligen Regelwerken (DIN, OIB-Richtlinien und ÖNORM, SIA und VKF).
5. Bautechnische Logik prüfen, bevor du den Satz schreibst: Fensterband nimmt Aussteifung weg und ersetzt sie nicht, jede Öffnung in einer tragenden Wand braucht einen Sturz, fassadenbündig meint die Bekleidungsebene und nicht die Dämmebene, Festverglasung scheidet aus, wenn der zweite Rettungsweg über das Fenster führt, Rollladenkästen zählen im GEG zur Außenwand.
6. Innere Widersprüche zwischen Eltern, Kind und Geschwistern vermeiden: Der Kontext steht in der Aufgabe, lies ihn, bevor du schreibst.

## Längen
t1: 2 bis 4 Sätze. t2: 4 bis 6 Sätze. t3: 4 bis 6 Sätze, konkret (Werte, Klassen, Normbezug), mit „Ab hier". Entwurfsknoten (p:"e") haben kein t3.

## Musterknoten (Stilreferenz, exakt zu treffen)
[
 {
  "id": "k5spiegel",
  "p": "k",
  "lv": 5,
  "pa": "k4umf",
  "t": "Zargenspiegel",
  "t1": "Der Zargenspiegel ist der sichtbare, flächige Teil der Umfassungszarge, der die Wandöffnung rahmt. Er bestimmt maßgeblich, wie schwer oder leicht eine Tür im Raum wirkt. Standardbreiten liegen bei etwa 60 bis 70 mm.",
  "t2": "Die Spiegelbreite ist eine der wenigen Stellschrauben, mit denen sich Standard-Innentüren gestalterisch differenzieren lassen, ohne das System zu verlassen. Schmale Spiegel (ab ca. 45 mm) wirken präziser, verzeihen aber weniger Wandtoleranz, weil weniger Überdeckung bleibt. Typischer Planungsfehler: Spiegel und Sockelleiste kollidieren in Höhe und Vorsprung; das Aufeinandertreffen beider Profile früh zeichnen.",
  "t3": "Übliche Spiegelbreiten 60/70 mm, Sonderbreiten 45 bis 100 mm je nach System. Überdeckung des Wandanschlusses min. 15 mm bei üblichen Trockenbautoleranzen (Ebenheit nach DIN 18202 Tab. 3 prüfen). Ausschreibung: Spiegelbreite, Kantenprofil, Falzbekleidung und Maulweitenbereich getrennt angeben; Maulweite als Toleranzbereich (z. B. 100 +15 mm), nie als Festmaß. Ab hier: Systemunterlagen des Herstellers."
 },
 {
  "id": "e3zaesur",
  "p": "e",
  "lv": 3,
  "pa": "e2schwelle",
  "t": "Die Tür als räumliche Zäsur",
  "t1": "Türen trennen nicht nur Räume, sie inszenieren den Übergang. Ob ein Wechsel abrupt oder gestuft erfolgt (Tür in der Wandflucht oder in einer Nische), verändert, wie privat sich der Raum dahinter anfühlt.",
  "t2": "Entwurflich lässt sich die Zäsur über vier Register steuern: Position (Wandflucht vs. Laibungstiefe), Format (Normhöhe vs. raumhoch), Artikulation (gerahmt vs. flächenbündig) und Material- oder Lichtwechsel am Übergang. Eine tiefe Laibung verlangsamt den Übergang; eine flächenbündige Tür lässt ihn beiläufig werden. Die Entscheidung sollte aus der Raumsequenz begründet sein, nicht aus dem Katalog. Referenzen: Loos’ Raumplan, Zumthors gestufte Schwellen, die Torsituationen der Margarethenhöhe im Siedlungsmaßstab."
 },
 {
  "id": "x4bogen",
  "p": "x",
  "lv": 4,
  "pa": "x3haustuer",
  "t": "Rundbogenportale und Türgewände",
  "t1": "Metzendorf setzte Haustüren fast nie nackt in die Wand: Rundbogen und Werksteingewände machen den Eingang zum wichtigsten Ereignis der Fassade.",
  "t2": "Das Prinzip ist übertragbar: serielle Typen plus individualisierte Schwelle gleich Identifikation ohne Beliebigkeit. Die Portale variieren in wenigen kontrollierten Parametern (Bogenform, Gewändematerial, Türfarbe), während Typengrundriss und Fassadenaufbau konstant bleiben. Für heutige Reihenhaus- und Geschossprojekte ein präzises Rezept gegen die Monotonie-Kritik."
 },
 {
  "id": "k3kombi",
  "p": "k",
  "lv": 3,
  "pa": "k2f",
  "t": "Kombinationsanforderungen",
  "t1": "Der Klassiker im Objektbau: T30 + RS + Schallschutz + Barrierefreiheit an derselben Tür. Jede Einzelanforderung ist lösbar; die Kombination entscheidet, ob es das Element überhaupt gibt.",
  "t2": "Vorgehen: Anforderungsmatrix je Tür aufstellen (Brand, Rauch, Schall, RC, Barrierefreiheit, Feuchtraum), dann gegen reale Herstellerprogramme prüfen, bevor die Tür im Grundriss fixiert wird. Die teuersten Türen im Projekt sind fast immer Kombinationselemente, die zu spät als solche erkannt wurden. Absenkdichtung vs. Rauchschutz vs. Nullschwelle ist der häufigste Zielkonflikt.",
  "t3": "Praxisfalle Barrierefreiheit: DIN 18040 begrenzt Bedienkräfte (Klasse 3 nach EN 12217 empfohlen); Türschließer an T30-RS-Elementen überschreiten das schnell. Lösung meist Freilauftürschließer mit Feststellanlage (dann Rauchmelderpflicht am Sturz). Ab hier: Herstellerberatung mit vollständiger Anforderungsmatrix."
 }
]

## Autoren-Spezifikation (vollständig)
# ArchiPedia – Autoren-Spezifikation v1

Destilliert aus dem Türen-Ast (15.08.2026). Zweck: Jeder weitere Ast entsteht mit dieser Spezifikation im selben Stil, egal ob von einer KI, einem Autor oder euch selbst geschrieben. Sie ist zugleich der Kern des Generierungs-Prompts (Abschnitt 6) und die Prüfliste fürs Review (Abschnitt 7).

---

## 1. Das Knoten-Schema

Jeder Inhalt ist ein Knoten mit genau diesen Feldern:

```json
{
  "id": "k5spiegel",
  "p": "k | e | x",            // Perspektive: Konstruktion, Entwurf, Kontext
  "lv": 1-7,                   // Hierarchie-Ebene
  "pa": "k4umf",               // genau EIN Eltern-Knoten (Baum, kein Netz – das Netz entsteht über ln)
  "t": "Zargenspiegel",        // Titel, max. ~45 Zeichen
  "t1": "…",                   // Überblick, PFLICHT für jeden Knoten
  "t2": "…",                   // Vertiefung, optional
  "t3": "…",                   // Spezifikation, optional
  "ln": ["e4spiegelgest"],     // Querverweise, bevorzugt in ANDERE Perspektiven
  "src": [                     // Normen, Quellen, weiterführende Links
    {"t": "DIN 18202 Toleranzen im Hochbau", "stand": "2019-07", "u": "https://www.dinmedia.de/…", "geprueft": "2026-08-15"},
    {"t": "BauO NRW", "stand": "Fassung 2018, zuletzt geändert 2024", "u": "https://recht.nrw.de/…", "geprueft": "2026-08-15"}
  ],
  "dach": {                    // länderspezifische Besonderheiten DE/AT/CH
    "de": "DIN 18040, je Bundesland eingeführt.",
    "at": "ÖNORM B 1600 und OIB-Richtlinie 4.",
    "ch": "SIA 500."
  },
  "status": "generiert | strukturgeprüft | fachgeprüft",  // ab Plattform-Version
  "review": {"wer": "", "wann": ""}
}
```

IDs: Perspektiven-Präfix + Ebene + Kurzwort (`k5spiegel`, `e3zaesur`, `x4bogen`). Nie umbenennen, sie sind die Verweis-Währung.

## 2. Die fünf Strukturregeln

1. **Maximal 7 Kinder pro Knoten; Wurzelknoten (Ebene 1) dürfen bis 10.** Mehr heißt: eine Ebene höher ist falsch geschnitten. (Lockerung für Wurzeln: Entscheidung Ben, 20.08.2026 — Themenfeld-Einstiege werden als Liste überflogen, in der Tiefe bleibt die 7 als Strukturzwang.)
2. **Tiefe endet mit Verweis, nicht im Nichts.** Jeder T3-Text endet mit „Ab hier: …" (Norm, Zulassung, Hersteller, Fachplaner, Bemusterung). Blattknoten tragen keine gesonderte End-Notiz mehr; die Übergabe an Spezialquellen leistet der „Ab hier"-Satz im T3 (Entscheidung Ben, 20.08.2026).
3. **Jeder Knoten ab Ebene 3 hat mindestens einen Querverweis**, bevorzugt in eine andere Perspektive. Ein Knoten ohne Querverweis ist ein Lexikonartikel, das gibt es schon.
4. **Entwurfs- und Kontextknoten enden meist bei T2** und verlinken für die Umsetzung in die Konstruktions-Perspektive. T3 gehört fast ausschließlich der Konstruktion.
5. **Ebenen-Logik als Orientierung, Verständnis als Maß.** E1 Themenfeld → E2 Hauptgruppen → E3 Bauteile/Themen → E4 Varianten/Systeme → E5 Komponenten → E6 Eigenschaften/Aspekte → E7 Anschluss-/Ausschreibungsdetail. Maßgeblich ist nicht die Ebenenzahl, sondern ob ein Planer das Thema nach dem Ast wirklich versteht, ohne woanders weitersuchen zu müssen: Ein Thema ist so tief auszubauen, wie es für dieses Verständnis nötig ist, inklusive Bauarten, Gewerke-Schnittstellen (wer liefert, wer montiert, wo steht es im LV), Vor- und Nachteilen und typischen Fehlern (Leitbild Ben, 20.08.2026: die Plattform ersetzt die Projektrecherche, sie fasst sie nicht zusammen). Der Ast endet erst dort, wo Regel 2 die Übergabe an Spezialquellen leistet.
6. **Normen und Rechtsquellen gehören strukturiert ins src-Feld, mit Stand und echtem Link.** Jeder Knoten, dessen Text eine Norm, ein Gesetz oder einen Grenzwert nennt, führt die Quelle unter src mit drei Pflichtangaben: `stand` (Ausgabedatum der Norm bzw. Fassung/Änderungsstand der Rechtsquelle, z. B. „HOAI Fassung 2021" oder „ÖNORM B 5371:2018"), `u` (Link) und `geprueft` (Datum der Link- und Standprüfung). Linkpolitik, streng: Rechtsquellen NUR auf amtliche Portale (DE Bund: gesetze-im-internet.de, Landesrecht z. B. recht.nrw.de, gesetze-bayern.de · AT: ris.bka.gv.at · CH: fedlex.admin.ch), Regelwerke auf die herausgebende Institution (dinmedia.de, oib.or.at, sia.ch, vkf.ch, austrian-standards.at), Weiterführendes auf stabile Portalseiten (baunetzwissen.de, nullbarriere.de). Keine Blog-, Hersteller- oder Forenlinks als Quelle. Jeder Link wird beim Build automatisiert auf Erreichbarkeit geprüft; ein Knoten mit totem Link fällt auf Status „generiert" zurück. Ein Rechtsstand ohne Datum ist kein Rechtsstand.
7. **DACH-Pflicht bei Regelwissen.** Sobald ein Wert länderabhängig ist (Baurecht, Barrierefreiheit, Brandschutz, Schallschutz), bekommt der Knoten ein dach-Feld mit den Einträgen DE/AT/CH. Der Fließtext nennt dann Leitwerte mit Verweis auf den DACH-Kasten, statt deutsche Werte als universell auszugeben. Systematik: DE über DIN + Landesbauordnungen, AT über ÖNORM + OIB-Richtlinien, CH über SIA + VKF/kantonale Regeln.

## 3. Tonlage pro Lesetiefe

**T1 Überblick (Pflicht, 2–4 Sätze).** Was ist es, warum ist es relevant, wo hängt es. Immer mit einer Einordnung, die ein Studierender behalten kann („Man hört und fühlt den Unterschied bei jedem Schließen"). Kein einziges Normzitat, keine Maße außer zur Anschauung. Verständlich ohne jeden anderen Knoten.

**T2 Vertiefung (3–6 Sätze).** Planungswissen: Entscheidungskriterien, Varianten mit Vor-/Nachteilen, der typische Fehler („Häufigste Mängelquelle: …"), Kostenlogik in Worten statt Zahlen. Perspektive des Planers in LP 2–5. Es darf eine Haltung erkennbar sein – ArchiPedia berät, es referiert nicht.

**T3 Spezifikation (3–6 Sätze).** Maße, Klassen, Normbezüge, Ausschreibungshinweise, Toleranzen. Präzise, aber ohne Vollständigkeitsanspruch; endet zwingend mit „Ab hier: …". Jede Zahl und jede Norm hier ist reviewpflichtig.

**Sprachregeln für alle Tiefen:** Deutsch, präzise, ohne Bindestrich-Kaskaden und ohne Gedankenstriche. Keine Aufzählungen im Fließtext-Knoten (Listenwissen wird zu Kind-Knoten). Fachbegriffe beim ersten Auftreten in einem Halbsatz erklärt. Keine Marketing-Adjektive, keine Herstellernamen (Systemtypen ja, Marken nein). Humor sparsam, Präzision immer.

## 4. Musterknoten (Goldstandard)

Als Referenz beim Generieren immer mitgeben:
- `k5spiegel` (Zargenspiegel): Konstruktions-Knoten mit allen drei Tiefen.
- `e3zaesur` (Die Tür als räumliche Zäsur): Entwurfs-Knoten, endet bewusst bei T2.
- `x4bogen` (Rundbogenportale): Kontext-Knoten, der Referenzwissen in übertragbare Prinzipien übersetzt.
- `k3kombi` (Kombinationsanforderungen): der Knotentyp „Zielkonflikt", oft der wertvollste.

## 5. Querverweis-Redaktion

Die KI schlägt Querverweise vor, kuratiert wird von Hand. Kriterien für einen guten Verweis: Er wechselt die Perspektive; er ist an dieser Stelle eine echte Anschlussfrage („Wie verträgt sich das Portal mit RC 2?"), nicht bloß thematische Nähe; maximal 3–4 pro Knoten, sonst entsteht Rauschen. Verweise in dieselbe Perspektive nur, wenn zwei Äste real interagieren (Nullschwelle ↔ Abdichtung).

## 6. Generierungs-Prompt (Schablone)

```
Du schreibst für ArchiPedia, eine Wissensplattform für Architekten.
Erzeuge den Ast „{THEMA}" der Perspektive {PERSPEKTIVE} als JSON-Array
von Knoten nach folgendem Schema: {SCHEMA aus Abschnitt 1}.

Halte dich strikt an: {REGELN aus Abschnitt 2} und {TONLAGE aus Abschnitt 3}.
Stilreferenz, exakt zu treffen: {MUSTERKNOTEN aus Abschnitt 4, vollständig}.

Vorgegebene Struktur bis Ebene {N}: {VON HAND REDIGIERTER TEILBAUM}.
Ergänze tiefere Ebenen nur, wo Regel 2 und 5 es rechtfertigen.

Schlage für jeden Knoten ab E3 Querverweis-Kandidaten in diese
existierenden Knoten vor: {ID-LISTE BESTEHENDER KNOTEN}.
Markiere jede Zahl und jede Norm in T3 zusätzlich in einem Feld
"pruefen": ["DIN 18065 Steigungsverhältnis", …].
```

Arbeitsablauf pro Ast: (1) KI erzeugt Strukturvorschlag E1–E4, (2) ihr redigiert die Struktur von Hand (die eigentliche redaktionelle Arbeit, ca. 1 Stunde), (3) KI generiert alle Texte gegen die redigierte Struktur, (4) Review nach Abschnitt 7, (5) Querverweise kuratieren, (6) Build.

## 7. Review-Checkliste

Strukturprüfung (schnell, jeder Knoten): Ebene plausibel? Unter 7 Kindern? Querverweis vorhanden und perspektivwechselnd? T3 endet mit „Ab hier"? Titel unter 45 Zeichen?

Fachprüfung (nur T3 + gekennzeichnete Zahlen): Stimmen Werte, Klassen, Normstände? Prüfer, Datum, Normausgabe im Knoten dokumentieren. Bis zur Fachprüfung trägt der Knoten sichtbar den Status „ungeprüft" – der Status ist Teil des Produkts, nicht dessen Schwäche.

Stilprüfung (Stichprobe, 1 von 10): Klingt T1 nach dem Muster? Kein Katalogton, keine Gedankenstriche, Haltung erkennbar?

## 8. Ergänzungen aus dem Qualitäts-Gate vom 19.08.2026 (Opus-Lesedurchgang, von Ben zu bestätigen)

1. **Kind wiederholt Eltern nicht.** Der Elterntext wird beim Generieren mitgegeben; der Kindknoten setzt ihn voraus und beginnt bei der Frage, die er offen lässt (wie entschieden wird, woran es scheitert, was es kostet).
2. **Jeder t1 endet mit einem befolgbaren Satz.** Verboten sind übertragbare Leerformeln („sorgfältige Planung verhindert X") und Wertungen ohne Träger („beliebt", „hochwertig", „punktet mit").
3. **Varianten brauchen ein Auswahlkriterium.** Wer drei Optionen nennt, nennt im selben Absatz die Größe, an der sich die Wahl entscheidet, und den Regelfall-Gewinner. Attrappen-Sätze („beides ist legitim", „keine ist grundsätzlich überlegen") sind verboten; zulässig ist nur die benannte Bedingung, unter der eine Option gewinnt.
4. **Kontext-Knoten:** T2 („Was daraus folgt") ist ab E1 Pflicht; jede Jahreszahl, jeder Eigenname und jede Zuschreibung ist prüfpflichtig wie T3-Zahlen; wiederkehrende Schlussformeln („Wer … verstehen will, findet hier …") sind verboten und werden astweit geprüft, nicht per Einzelstichprobe.
5. **dach nur bei echtem Unterschied.** Ein dach-Eintrag setzt voraus, dass sich mindestens ein Land in der Sache unterscheidet, nicht nur im Normnamen; sonst gehört „gilt in allen drei Ländern" in den Fließtext und das Feld bleibt leer. In AT/CH-Einträgen sind „vergleichbar/ebenfalls/ähnlich/entsprechend" als Prädikat verboten (Deutschland ist nicht die Referenz, von der andere abweichen).
6. **Bindestrich-Regel präzisiert:** Verboten sind Gedankenstriche (– —) und Kaskaden ab drei Bindestrichen. Normale Komposita- und Ergänzungsbindestriche (Mehr- und Minderleistungen, OIB-Richtlinie) sind Pflicht; ihr Entfernen ist sinnentstellend.
7. **Anti-Dubletten-Kontext:** Beim Generieren werden Titel und t1 von Eltern, Geschwistern und den Musterknoten mitgegeben; kein Bild, Beispiel oder Formulierung daraus wiederverwenden. Build-seitig wird auf n-Gramm-Überlappung geprüft.

