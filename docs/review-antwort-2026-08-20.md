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

---

## Nachtrag: Reaktion auf die fachliche Gegenlesung (Runde 2, 20.08.2026)

Korrigiert (alle live):
1. Psi-Grenzwert „höchstens 0,04 W/mK" aus Vordersatz und Zulagemuster entfernt; stattdessen Kriterium Σ(d·λ) ≤ 0,007 W/K nach DIN EN ISO 10077-1 Anhang G plus repräsentativer Psi-Wert des eingesetzten Systems nach BF-Datenblatt, Nachweis mit dem Angebot. Hinweis ergänzt, dass ein fester Grenzwert nur differenziert nach Rahmenwerkstoff und Scheibenzahl sinnvoll ist.
2. „Dreifachverglasung jeweils am oberen Ende" auf Aluminium beschränkt; warme Kante jetzt „etwa 0,03 bis 0,045 W/mK je nach System und Rahmenwerkstoff, Dreifach geringfügig unter Zweifach". Aluminium „rund 0,07 bis 0,11". Uw-Gewinn am Normfenster „rund 0,1 W/m²K".
3. Farbwiderspruch aufgelöst: beide Texte „nach Bemusterung aus dem Standardprogramm".
4. Werkstoffvorgabe „Edelstahl oder Kunststoffverbund" gestrichen, Kriterium allein.
5. DIN EN 14351-1 benannt und als Quelle an E6 und E7 (Ausgabe 2016-12).
6. VOB/A § 7 im T3 der E7 als Grundlage zitiert, Quelle Bekanntmachung 2019 (verwaltungsvorschriften-im-internet.de).
7. „höchstens 1 Prozent" Gasverlustrate gestrichen; Text nennt jetzt nur die geänderte Anforderung der Ausgabe 2018 (BF-Information 020-2021).
8. Anhang G an allen Stellen ergänzt, an denen das 0,007-W/K-Kriterium steht.
9. Zeichnung Taupunktisotherme neu: Rahmen mit Glasfalz und Glaseinstand-Maß, Taupunkt 9,3 °C bei 20 °C/50 % r. F. in der Legende, gestrichelte Isothermen beschriftet, Orientierung für beide Schnitte. Zeichnung Randverbund: Glaseinstand als Maßlinie ohne Zahl ergänzt.
10. Perspektiven-Lead: „bis zu sieben Auflösungen".

Nicht geändert: Thread-Teaser „bis hinunter zur Ausschreibungsposition" (Thread endet mit „Sonderfall Brandschutztüren im LV", Prozess E3; Formulierung stammt aus der Thread-Redaktion, Entscheidung Ben).
