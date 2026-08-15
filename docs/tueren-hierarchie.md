# ArchiPedia – Muster-Hierarchie „Türen"

Arbeitsstand 15.08.2026. Zweck: An einem Thema durchspielen, ob die Detaillierungsstufen-Logik trägt. Alle Designentscheidungen der Plattform lassen sich hieran testen.

---

## 1. Das Strukturmodell (Vorschlag)

Zwei Achsen, die oft verwechselt werden und in ArchiPedia sauber getrennt sein sollten:

**Achse 1: Die Hierarchie-Ebene (E1–E7)** – wo im Themenbaum ein Knoten sitzt. Vom Themenfeld (E1 „Türen") bis zum ausschreibungsreifen Einzelaspekt (E7 „Kantenausbildung Zargenspiegel").

**Achse 2: Die Lesetiefe pro Knoten (T1–T3)** – wie tief der Text an derselben Stelle geht:

- **T1 Überblick** – 3-5 Sätze. Was ist das, warum relevant, wie hängt es zusammen. Zielgruppe: Studierende, fachfremde Einsteiger, schnelle Orientierung.
- **T2 Vertiefung** – Planungswissen. Entscheidungskriterien, typische Fehler, Varianten mit Vor-/Nachteilen. Zielgruppe: Planer in LP 2-5.
- **T3 Spezifikation** – Maße, Normbezüge, Anschlusslogik, Ausschreibungshinweise. Zielgruppe: Ausführungsplanung.

Das löst das Zielgruppenproblem „Studierende UND erfahrene Planer": Beide navigieren denselben Baum, aber mit unterschiedlicher voreingestellter Lesetiefe. Ein Studierender liest E6 „Zargenspiegel" auf T1 und versteht das Bauteil; ein Planer schaltet auf T3 und bekommt Maßketten und Toleranzen. **Nicht jede Ebene braucht jede Tiefe** – E1 braucht selten T3, E7 selten T1.

**Achse 3 (die eigentliche Innovation): Perspektiven.** Jeder Knoten gehört primär zu einer Perspektive, ist aber quer verlinkt:

- **Konstruktion** (das Bauteil-Wissen: Was ist es, wie ist es aufgebaut, wie wird es gebaut)
- **Entwurf** (das gestalterische Wissen: Was leistet es räumlich, welche Haltungen gibt es)
- **Kontext** (das Referenz-Wissen: Wo wurde es wie gelöst – Projekte, Epochen, Typologien)

Baunetzwissen hat nur Perspektive 1. ArchDaily nur 3 (und flach). Wikipedia mischt alles unstrukturiert. Die Querverbindungen zwischen den Perspektiven sind der Kern von ArchiPedia.

---

## 2. Der Baum: Perspektive Konstruktion

```
E1  Türen
├── E2  Innentüren
│   ├── E3  Türblatt
│   │   ├── E4  Aufbau (Röhrenspan, Vollspan, Wabe, Massiv)
│   │   ├── E4  Oberflächen (CPL, HPL, Furnier, Lack)
│   │   └── E4  Falz- und Kantenausbildung (gefälzt / stumpf einschlagend)
│   ├── E3  Zarge
│   │   ├── E4  Umfassungszarge
│   │   │   ├── E5  Zargenspiegel
│   │   │   │   ├── E6  Spiegelbreite und Proportion
│   │   │   │   ├── E6  Kantenausbildung (gerundet / scharfkantig / Schattennut)
│   │   │   │   └── E6  Materialität und Oberfläche
│   │   │   ├── E5  Falzbekleidung und Maulweite
│   │   │   └── E5  Wandanschluss und Montage
│   │   │       └── E6  Anschluss an Trockenbau vs. Massivwand
│   │   │           └── E7  Detail: Schattenfuge Zarge/Wand, Toleranzen
│   │   ├── E4  Blockzarge
│   │   ├── E4  Eckzarge
│   │   └── E4  Verdeckte Zarge / flächenbündige Systeme
│   ├── E3  Beschläge
│   │   ├── E4  Bänder (aufliegend, verdeckt, 3D-verstellbar)
│   │   ├── E4  Drücker und Schlösser
│   │   └── E4  Türschließer und Feststellanlagen
│   └── E3  Öffnungsarten
│       ├── E4  Anschlagtür (DIN links/rechts)
│       ├── E4  Schiebetür (vor der Wand / in der Wand)
│       └── E4  Falt-, Pendel-, Drehtür
├── E2  Außen- und Haustüren
│   ├── E3  Aufbau und Wärmeschutz
│   ├── E3  Einbruchschutz (RC-Klassen)
│   └── E3  Schwelle und Barrierefreiheit
│       └── E4  Nullschwelle: Abdichtung vs. DIN 18040
├── E2  Funktionstüren
│   ├── E3  Brandschutztüren (T30/T60/T90)
│   │   └── E4  Zulassung, Kennzeichnung, das Verbot der Bauteilveränderung
│   ├── E3  Rauchschutztüren (RS)
│   ├── E3  Schallschutztüren (Klassen, Bodendichtung)
│   └── E3  Kombinationsanforderungen (T30-RS mit Schallschutz: der Klassiker)
└── E2  Türen im Bestand
    ├── E3  Aufarbeitung historischer Türen
    └── E3  Ertüchtigung (Schall, Brand) denkmalgerechter Türen
```

## 3. Der Baum: Perspektive Entwurf

```
E1  Die Tür als Entwurfselement
├── E2  Schwelle und Übergang
│   ├── E3  Die Tür als räumliche Zäsur (öffentlich → privat)
│   ├── E3  Schwellenräume: Windfang, Vorraum, Nische
│   └── E3  Referenzfälle → [Kontext: Margarethenhöhe, Loos, Zumthor]
├── E2  Proportion und Format
│   ├── E3  Raumhohe Türen und die Auflösung des Sturzes
│   ├── E3  Türbreiten zwischen Norm und Geste
│   └── E3  Das Verhältnis Tür / Wand / Raumhöhe
├── E2  Artikulation vs. Verschwinden
│   ├── E3  Die betonte Tür: Portal, Rahmung, Gewände
│   │   └── E4  Der Zargenspiegel als gestalterisches Mittel → [Konstruktion: E5 Zargenspiegel]
│   └── E3  Die unsichtbare Tür: flächenbündig, tapezierbar, schattenfugengeführt
│       └── E4  → [Konstruktion: E4 Verdeckte Zarge]
├── E2  Die Tür als Berührungspunkt
│   ├── E3  Der Drücker als „Handschlag des Gebäudes"
│   └── E3  Materialwechsel an der Hand: Messing, Bronze, Holz
└── E2  Türen in der Raumfolge
    ├── E3  Enfilade und Sichtachse
    └── E3  Türposition im Raum: Ecke vs. Mitte
```

## 4. Der Baum: Perspektive Kontext (Case Study Margarethenhöhe)

```
E1  Margarethenhöhe, Essen (Metzendorf, ab 1909)
├── E2  Städtebau der Gartenstadt
│   ├── E3  Platzfolgen und gekrümmte Straßenräume
│   └── E3  Torhaus und Brückenzugang als Schwelle der Siedlung → [Entwurf: Schwelle]
├── E2  Gebäudetypen
│   ├── E3  Reihenhaustypen und ihre Variation
│   └── E3  Sonderbauten (Marktplatz, Gasthaus)
└── E2  Fassadenelemente
    ├── E3  Putzflächen, Klinkersockel, Fensterläden
    └── E3  Haustüren der Margarethenhöhe
        ├── E4  Rundbogenportale und Türgewände → [Entwurf: Die betonte Tür]
        ├── E4  Farbigkeit und Handwerksdetail
        └── E4  Was heutige Planung daraus lernt → [Konstruktion: Haustüren]
```

**Antwort auf deine offene Frage:** Projekte wie die Margarethenhöhe sind nicht bloß Case Studies im Anhang, sondern ein eigener, gleichwertiger Einstiegspfad. Der Wert entsteht an den Kreuzungen: Wer bei „Haustüren der Margarethenhöhe" steht, ist zwei Klicks von der RC-2-Spezifikation UND zwei Klicks von der Entwurfstheorie der Schwelle entfernt. Das kann keine der drei Referenzplattformen.

---

## 5. Drei Beispielartikel in drei Lesetiefen

### 5.1 E5 „Zargenspiegel" (Perspektive Konstruktion)

**T1 Überblick:** Der Zargenspiegel ist der sichtbare, flächige Teil der Umfassungszarge, der die Wandöffnung rahmt. Er bestimmt maßgeblich, wie „schwer" oder „leicht" eine Tür im Raum wirkt. Standardbreiten liegen bei etwa 60-70 mm; schmalere oder breitere Spiegel sind gestalterische Entscheidungen mit konstruktiven Folgen.

**T2 Vertiefung:** Die Spiegelbreite ist eine der wenigen Stellschrauben, mit denen sich Standard-Innentüren gestalterisch differenzieren lassen, ohne das System zu verlassen. Schmale Spiegel (ab ca. 45 mm) wirken präziser, verzeihen aber weniger Wandtoleranzen, weil weniger Überdeckung zur Verfügung steht. Typischer Planungsfehler: Spiegel und Sockelleiste kollidieren in der Höhe und im Vorsprung; die Reihenfolge und das Aufeinandertreffen beider Profile sollte früh gezeichnet werden. Bei flächenbündigen Konzepten entfällt der Spiegel ganz, was ein anderes Zargen- und Toleranzsystem erfordert.

**T3 Spezifikation:** Übliche Spiegelbreiten 60/70 mm, Sonderbreiten 45-100 mm je nach System. Überdeckung des Wandanschlusses min. 15 mm empfohlen bei üblichen Trockenbautoleranzen (Ebenheitstoleranzen nach DIN 18202 Tab. 3 beachten). Kantenausbildung: gerundet (R 2-3 mm, Standard-CPL), scharfkantig (Lack/Furnier, stoßempfindlicher), oder mit umlaufender Schattennut zur Wand. Ausschreibung: Spiegelbreite, Kantenprofil, Falzbekleidung und Maulweitenbereich getrennt angeben; Maulweite mit Toleranzbereich (z. B. 100 +15 mm) statt Festmaß.

### 5.2 E3 „Die Tür als räumliche Zäsur" (Perspektive Entwurf)

**T1 Überblick:** Türen trennen nicht nur Räume, sie inszenieren den Übergang zwischen ihnen. Ob ein Wechsel abrupt oder gestuft erfolgt (Tür in der Wandflucht vs. Tür in einer Nische oder einem Vorraum), verändert, wie öffentlich oder privat sich der dahinterliegende Raum anfühlt.

**T2 Vertiefung:** Entwurflich lässt sich die Zäsur über vier Register steuern: Position (Wandflucht vs. Laibungstiefe), Format (Normhöhe vs. raumhoch), Artikulation (gerahmt vs. flächenbündig) und Material-/Lichtwechsel am Übergang. Eine tiefe Laibung verlangsamt den Übergang und kündigt den Raumwechsel an; eine flächenbündige Tür in der Wandebene lässt ihn beiläufig werden. Die Entscheidung sollte aus der Raumsequenz begründet sein, nicht aus dem Katalog. Referenzen: Loos' Raumplan-Übergänge, Zumthors gestufte Schwellen in Vals, die Torsituationen der Margarethenhöhe im Maßstab der Siedlung.

*(T3 entfällt hier bewusst: Entwurfsknoten enden meist bei T2 und verlinken für die Umsetzung in die Konstruktions-Perspektive. Genau so definiert sich „genug Information erreicht".)*

### 5.3 E4 „Rundbogenportale und Türgewände" (Perspektive Kontext / Margarethenhöhe)

**T1 Überblick:** Metzendorf setzte an der Margarethenhöhe Haustüren fast nie „nackt" in die Wand: Rundbogen, Werksteingewände und farbige Türblätter machen den Hauseingang zum wichtigsten Schmuckelement der ansonsten sparsamen Fassaden. Der Eingang trägt die Individualität innerhalb der seriellen Siedlung.

**T2 Vertiefung:** Das Prinzip ist übertragbar: Serielle Typen + individualisierte Schwelle = Identifikation ohne Beliebigkeit. Die Portale variieren in wenigen kontrollierten Parametern (Bogenform, Gewändematerial, Türfarbe), während Typengrundrisse und Fassadenaufbau konstant bleiben. Für heutige Reihenhaus- und Geschosswohnungsprojekte ist das ein präzises Rezept gegen die Monotonie-Kritik, ohne in Fassaden-Aktionismus zu verfallen. → Konstruktiv schließt hier die Frage an, wie ein gerahmtes Portal heute mit RC-Anforderungen und Nullschwelle zusammengeht [→ Konstruktion: Haustüren].

---

## 6. Regeln, die sich aus der Übung ergeben (Thesen zum Testen)

1. **Tiefe endet mit Verweis, nicht im Nichts.** Jeder T3-Text endet mit „ab hier: Herstellersystem / Norm XY / Fachplaner". Die Plattform verspricht nie Vollständigkeit, sondern den richtigen Absprungpunkt. Das beantwortet deine Frage nach der „idealen Tiefenstufe".
2. **Maximal 7 Kinder pro Knoten.** Mehr heißt: Die Gliederung eine Ebene höher ist falsch geschnitten.
3. **Jeder Knoten ab E3 braucht mindestens einen Querverweis in eine andere Perspektive.** Ein Knoten ohne Querverweis ist ein Lexikonartikel; das gibt es schon (Wikipedia).
4. **KI + Review passt auf dieses Modell:** Die KI generiert Baum + T1/T2-Texte, Experten reviewen T3 (dort liegt das Haftungsrisiko) und die Querverweise (dort liegt die Qualität). Review-Aufwand konzentriert sich auf ~20 % der Inhalte.
5. **Kammer-Finanzierung spricht für die Kontext-Perspektive:** Baukultur-Vermittlung (Margarethenhöhe!) ist förderfähig und kammernah, reine Produktdaten sind es nicht.

## 7. Was dieser Entwurf noch nicht klärt

- Bebilderung: Die Entwurfs- und Kontext-Perspektive funktioniert ohne Zeichnungen/Fotos nur halb. Rechtefrage klären (eigene Axonometrien als Stilmittel?).
- Normzitate: T3 referenziert Normen; wie aktuell halten und rechtlich absichern (Haftungsdisclaimer vs. Anspruch)?
- Suchverhalten: Steigen Nutzer wirklich über Bäume ein, oder googeln sie „Maulweite Trockenbau" und landen mitten im Baum? Vermutlich Letzteres; der Baum ist dann Orientierung nach der Landung, nicht davor.
