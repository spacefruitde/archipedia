# Antwort auf das Review vom 20.08.2026 (Prompt an Claude Cowork)

Kopiervorlage für Ben. Alles unterhalb der Linie ist der Prompt.

---

Du hast am 20.08.2026 den ArchiPedia-Prototyp (ao-prototyp.pages.dev) reviewt. Danke, das Review war präzise und hat Folgen gehabt. Hier ist, was wir seitdem geändert haben, was wir bewusst nicht ändern, und worum wir dich jetzt bitten.

## Was wir geändert haben (alles live)

1. **Favicon / Doppel-Download.** Dein Befund war noch untertrieben: `/favicon.ico` lieferte per Cloudflare-SPA-Fallback die komplette `index.html` (4,3 MB unkomprimiert, ~411 KB komprimiert) bei jedem Seitenaufruf. Behoben durch ein Inline-SVG-Favicon, kein zusätzlicher Request mehr.

2. **Das 7-Ebenen-Versprechen.** Wir haben deinen Vorschlag umgesetzt und genau einen Strang bis Ebene 7 durchgezogen, inklusive echter LV-Position:
   Fenster und Verglasung → Verglasung → Wärmeschutzverglasung → Randverbund und warme Kante → Abstandhalterprofile → Psi-Wert: Kennwert und Nachweis → **LV-Position: Warme Kante im Fenster-LV** (Vordersatz-Text, Zulageposition mit Menge und Einheit, Gewerkezuordnung nach ATV, DACH-Kasten zur LV-Systematik DE/AT/CH).
   Dazu auf Ebene 6 „Oberflächentemperatur und Kondensat am Rand" (fRsi, DACH-Unterschiede DIN 4108-2 / ÖNORM B 8110-2 / SIA 180) und „Sichtbare Kante: Farbe, Breite, Sprossen", auf Ebene 5 „Dichtstoffe und Trockenmittel im Randverbund". Der von dir als nackt identifizierte Knoten „Randverbund" hat jetzt Spezifikation, vier Quellen und eine Schemazeichnung. Alle neuen Normen sind mit Ausgabe, Link auf das amtliche Portal bzw. den Herausgeber und Prüfdatum hinterlegt; zwei Zeichnungen sind neu (Aufbau Randverbund, Taupunktisotherme am Glasrand).
   Ehrlichkeitspunkt: Der Randverbund ist im LV keine eigene Position, sondern Vordersatz oder Zulage. Genau das steht jetzt in der E7, statt eine Position zu erfinden.

3. **Hero-Claim.** „Ebene 1–7" stand als Behauptung im Hero. Die Zeile wird jetzt aus den tatsächlichen Thread-Stationen berechnet und sagt „5 Stationen · Ebene 3–4".

4. **Prototyp-/KI-Hinweise** aus Titel, Footer und Spezifikationskästen entfernt. Der Status der Inhalte wird im Gespräch kommuniziert, nicht in der UI.

5. **Dark Mode** überarbeitet (wärmere Palette, gedämpfte Perspektivfarben), nicht Teil deines Reviews, aber seitdem passiert.

## Was wir bewusst nicht ändern

- **Navigation ab Ebene 2** (dein Punkt 3): Wir haben den leeren linken Rand auf tieferen Ebenen und den Thread als Zeile am Artikelende angeschaut und finden die Ruhe auf den tiefen Ebenen richtig. Bleibt so.
- **Crawlbare URLs / SEO** (dein Punkt 5): Die Seite ist bis auf Weiteres ein MVP für Sponsorengespräche, kein Traffic-Produkt. Hash-Routing und Single-File bleiben, bis sich die Zielsetzung ändert.
- **Suche in Frageform** (dein Punkt 6): Das ist eine LLM-Aufgabe, nicht die Aufgabe eines Titel-/Lead-Filters. Kommt nicht im MVP.
- **Sidebar-Dubletten** (dein Punkt 2): Befund bestätigt und erklärt (die Boxen ziehen den Satz aus dem Fließtext, die Dublette ist Konstruktion), Änderung steht noch aus.

## Worum wir dich jetzt bitten

Lies nur den einen Strang, von „Wärmeschutzverglasung" bis „LV-Position: Warme Kante im Fenster-LV", Lesetiefe Spezifikation aufgeklappt, DACH-Kasten und Quellen mit.

1. **Macht die Tiefe den Unterschied, den du in deinem Vorschlag gemeint hast?** Antworte bitte binär und begründe in drei Sätzen: Ist das der Grund, eine solche Plattform zu abonnieren, oder sind es doch die Threads?
2. **Ist die E7 eine echte LV-Position** aus Sicht eines Architekten, der morgen ein Fenster-LV schreibt? Was fehlt, was ist zu viel, was ist falsch?
3. **Fachliche Gegenprobe** auf die Zahlen und Normaussagen in den T3-Texten (Psi-Werte als Größenordnung, Kriterium 0,007 W/K, fRsi-Regelungen DE/AT/CH, Ausnahme für Fenster in DIN 4108-2, Gasverlustrate nach DIN EN 1279-3). Alles trägt den Status „generiert", du bist die erste fachliche Gegenlesung.
4. **Die zwei neuen Schemazeichnungen:** Tragen sie das Prinzip, oder dekorieren sie?

Format wie beim ersten Mal: kurz, messbar, ohne Höflichkeit. Was nicht trägt, zuerst.
