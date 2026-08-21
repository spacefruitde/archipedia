# Fachliche Gegenlesung Welle 2: Abdichtung/Bauphysik und Licht (Opus, 21.08.2026)

Geprüft: 103 Einträge (69 neue Knoten, 15 Bestands-T3, 34 nachgelieferte T2 auf E2/E3) in fünf Paketen durch Opus-Agenten mit Websuche, Belege nur von amtlichen Portalen und Herausgebern. Anleitung wie Welle 1 (review-anleitung.md), zusätzlich die Vorgabe, ganze Sätze zu zitieren.

## Bilanz
- Urteile: 19 ok, 74 korrigieren, 10 unsicher. 190 Befunde, 174 automatisch satzgenau eingespielt, 0 von Hand (Vollsatz-Zitate), 16 Befunde ohne Ersatz (Hinweise zur Entscheidung, siehe unten).
- 156 Quellen mit Ausgabe/Stand und Prüfdatum in `src` ergänzt.
- Status bleibt generiert.

## Schwerste korrigierte Fehler (Auswahl)
- ÖNORM B 3691 (Dachabdichtung) als österreichische Bauwerksabdichtungs-/Schlagregennorm ausgegeben; richtig B 3692, B 2209, B 5320.
- Wassereinwirkungsklasse W3-I falsch definiert; Schwimmbecken fällt unter DIN 18535, nicht 18534; neue SIA 271/1:2025 für Innenraumabdichtung.
- Nullschwelle ohne den normativen Kern (DIN 18533-1: mindestens 15 cm Anschlusshöhe, Absenkung nur mit Ersatzmaßnahmen).
- Schlagregen-Beanspruchungsgruppen standortbezogen, nicht je Fassadenseite; Spritzwasserbereich am Sockel nach DIN 18533-1, nicht 4108-3.
- Luftdichtheitsgrenzwerte: Formelzeichen und Fundstelle (§ 26 GModG) falsch; AT nennt dieselben Zahlen wie DE (kein DACH-Unterschied); SIA 380/1 kennt keinen pauschalen Wärmebrückenzuschlag.
- Fenster-Einbau: Psi des Randverbunds in der Gebäudebilanz doppelt gezählt; Ecken sind keine Chi-Werte.
- Verbundabdichtung ist nach ATV DIN 18352 Besondere Leistung der Fliesenarbeiten, kein eigenes Gewerk.
- Licht: geklebte Glasecke als tragend, Shed-Neigung physikalisch verdreht, Nordlicht-Widerspruch Eltern/Kind, Raumtiefen-Faustregel auf Fensterhöhe statt Sturzhöhe bezogen, Rauchabzug „motorisiert" (BauO NRW verlangt nur Bedienbarkeit), Tageslicht-Anforderungen DE/AT/CH sind Flächenanteile im Baurecht, keine Normkennwerte; Lichtimmission im BImSchG, nicht in der Landesbauordnung; Ringanker wird nicht „unterbrochen".

## Unsicher (Sätze entschärft, Fachprüfung)
eli3anteil, eli4bildtraeger, eli4schichten, sowie sieben Knoten im Paket Schlagregen/Fugen/Nassraum (unbelegte Zahlen; Liste in ergebnis-w2r2.json).

## Entscheidungen für Ben (aus Befunden ohne Ersatztext)
1. Das Gebäudeenergiegesetz heißt laut gesetze-im-internet.de seit 29.07.2026 Gebäudemodernisierungsgesetz (GModG). In den geprüften Knoten ist das korrigiert; alle übrigen Knoten mit „GEG" (Zählung im Commit-Kommentar) sind plattformweit zu prüfen.
2. Normstand-Divergenz: Das Gesetz verweist datiert auf DIN 4108-2:2013-02, 4108-3:2018-10, 4108-7:2011-01, während neue Ausgaben gelten (2026-05, 2024-03, 2026-04). Welche Ausgabe die Plattform als „Stand" führt, ist eine Redaktionsentscheidung (Vorschlag: aktuelle Ausgabe in src, Satz im Text, dass das Gesetz datiert verweist).
3. Neue Normstände für ältere Knoten: DIN 18533-1:2026-06, DIN 18534-1:2025-10, DIN 18197:2026-08, ÖNORM B 3407:2026-01, SIA 271/1:2025.

## Lehren
- Die Negativliste aus Welle 1 hat die Begriffsfehler (Psi/Chi, Zulassung/CE) weitgehend verhindert; die Fehlerklasse dieser Welle sind Normzuordnungen zwischen benachbarten Normen (3691/3692, 18534/18535, 4108-3/18533) und DACH-Unterschiede, die behauptet werden, wo keine sind. Beides in die Negativliste der nächsten Welle.
- Vollsatz-Zitate im Review machen das Einspielen handarbeitsfrei.
