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
5. **Ebenen-Logik:** E1 Themenfeld → E2 Hauptgruppen → E3 Bauteile/Themen → E4 Varianten/Systeme → E5 Komponenten → E6 Eigenschaften/Aspekte → E7 Anschluss-/Ausschreibungsdetail. Nicht jeder Ast muss bis E7 reichen; er muss dort enden, wo Regel 2 greift.
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
