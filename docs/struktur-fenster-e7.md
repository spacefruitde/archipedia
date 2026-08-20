# Strukturvorschlag: Fenster-Strang bis Ebene 7 (Redaktion Ben)

Stand 20.08.2026. Ziel aus dem Review vom 20.08.: einen einzigen Strang vollständig bis E7 ausarbeiten, am Ende eine echte LV-Position mit Ausschreibungstext, Menge, Einheit. Strang: Fenster und Verglasung → Verglasung → Wärmeschutzverglasung → Randverbund → Abstandhalter → … → LV.

Status 20.08.2026: umgesetzt (Entscheidungen durch Claude auf Bens Bitte: LV-Position unter kfe6psi, kfe5dicht ja, kfe6sicht bleibt Konstruktion mit T2-Ende, Bundesverband Flachglas als Verbandsquelle zugelassen). Alle neuen Texte Status generiert, Quellen verifiziert am 20.08.2026. Ursprünglicher Vorschlag: Nach deiner Redaktion folgen Texte nach Spec (T1–T3, src mit Stand und geprueft, dach nur bei echtem Unterschied), alle Normen und Links per Websuche verifiziert.

## Bestand (bleibt, wird ergänzt)

| Ebene | ID | Titel | Stand | Zu tun |
|---|---|---|---|---|
| E1 | kfe1 | Fenster und Verglasung | T1 | nichts |
| E2 | kfe2glas | Verglasung (Wärme-, Sonnen-, Schallschutz) | T1, T2, Foto | nichts |
| E3 | kfe3waermeglas | Wärmeschutzverglasung | T1–T3, 6 src, DACH, Schema | nichts |
| E4 | kfe4randverbund | Randverbund und warme Kante | nur T1, T2 | **T3 nachziehen**, src (DIN EN 1279, DIN EN ISO 10077-1), eigenes Schema (Aufbau Randverbund: Abstandhalter, Primärdichtung, Sekundärdichtung, Trockenmittel, Glaseinstand) |
| E5 | kfe5abstandhalter | Abstandhalterprofile im Vergleich | T1–T3, Schema | src ergänzen (derzeit keine), ln auf neue E6 |

## Neue Knoten

```
kfe4randverbund  E4  Randverbund und warme Kante                    (Bestand)
├─ kfe5abstandhalter  E5  Abstandhalterprofile im Vergleich         (Bestand)
│  ├─ kfe6psi    E6  Psi-Wert: Kennwert und Nachweis
│  │  └─ kfe7lvkante  E7  LV-Position: Warme Kante im Fenster-LV
│  ├─ kfe6tau    E6  Oberflächentemperatur und Kondensat am Rand
│  └─ kfe6sicht  E6  Sichtbare Kante: Farbe, Breite, Sprossen
└─ kfe5dicht     E5  Dichtstoffe und Trockenmittel im Randverbund
```

### kfe5dicht (E5, Komponente)
Was der Abstandhalter nicht leistet: Primärdichtung (Butyl, Dampfsperre und Gasdichtheit), Sekundärdichtung (Polysulfid, Polyurethan, Silikon; Silikon bei UV-belasteter freier Kante), Trockenmittel im Profil. Auswahlkriterium: UV-Exposition der Kante (Structural Glazing, Stufenglas) entscheidet über Silikon. T3: Prüfgrundlagen Feuchteaufnahme und Gasverlustrate (DIN EN 1279 Teile 2 und 3), Dauerhaftigkeitsklassen, typische Schadensbilder (Scheibenblindheit). Ab hier: Systemzulassung des Isolierglasherstellers. ln: kma3glasart (Konstruktion), evtl. Fassade/Structural Glazing falls vorhanden.

### kfe6psi (E6, Eigenschaft)
Der lineare Wärmedurchgangskoeffizient Psi des Randverbunds als eigener Kennwert neben Ug und Uf. Größenordnung Aluminium vs. warme Kante, Einfluss auf Uw am Normfenster (1,23 × 1,48 m), warum zwei Scheiben mit gleichem Ug verschiedene Uw liefern. T3: Berechnung nach DIN EN ISO 10077-2, repräsentative Psi-Werte (Datenblatt Bundesverband Flachglas, ift-Richtlinie WA-08), was im Nachweis wirklich eingetragen wird. Ab hier: Uw-Berechnung des Fensterbauers und Energieberater. ln: pna3nachweis (Prozess, Energieausweis), kab3geometrisch (Konstruktion). Kein dach (Berechnungsnorm ist europäisch; die Anforderungswerte stehen schon in kfe3waermeglas).

### kfe7lvkante (E7, Ausschreibungsdetail) — die Probe aufs Exempel
Ehrlich gesagt: Der Randverbund ist im LV keine eigene Position, sondern ein Vordersatz in der Fenster- bzw. Verglasungsposition oder eine Zulageposition „warme Kante". Genau das ist der Inhalt: wie die Anforderung im LV formuliert wird, damit der Bieter sie nicht wegoptimieren kann.
Inhalt: (1) Vordersatz-Text zum Einbau in die Fensterposition (Randverbund thermisch verbessert, Psi-Grenzwert mit Nachweisverfahren, Werkstoff des Abstandhalters als Systemtyp ohne Markenname, Farbe, Nachweis per Datenblatt mit Angebot). (2) Alternativ die Zulageposition: Positionstext, Menge in m² Glasfläche oder Stück Element, Einheit, Vordersatz, woran sich die Mengenermittlung orientiert. (3) Gewerkezuordnung: Fensterbau (Tischler/Metallbau) liefert Isolierglas in der Regel mit, Verglasungsarbeiten nur bei getrennter Vergabe; wer den Psi-Nachweis schuldet. (4) Typischer Fehler: „Dreifachverglasung" ohne Randverbundangabe, Bieter liefert Aluminium. Ab hier: Standardleistungsbuch und Vertragsmuster des Projekts.
DACH (echter Unterschied in der LV-Systematik): DE VOB/C (ATV DIN 18355 Tischlerarbeiten, DIN 18360 Metallbauarbeiten, DIN 18361 Verglasungsarbeiten), STLB-Bau · AT standardisierte Leistungsbeschreibung Hochbau, ÖNORM A 2063 · CH NPK (CRB), entsprechende Kapitel Fenster/Verglasung. Alle drei per Websuche auf aktuelle Ausgabe prüfen.
ln: pav3pos (Prozess: Positionen, Mengen, Vordersätze), pav3funk (funktional vs. detailliert), kfe4bankgewerke (Konstruktion: Gewerke und Ausschreibung bei der Fensterbank, gleiches Muster).

### kfe6tau (E6, Eigenschaft)
Oberflächentemperatur am inneren Scheibenrand, Taupunkt, Temperaturfaktor fRsi, warum bei Aluminiumkante im Winter die Scheibe unten beschlägt und bei warmer Kante nicht. T3: Mindestwärmeschutz-Kriterium (DE DIN 4108-2, fRsi 0,70; AT ÖNORM B 8110-2; CH SIA 180), Randbedingungen, wann der Nachweis am Fenster geführt werden muss. Ab hier: Isothermenberechnung. dach: ja, echter Unterschied in Kriterium und Randbedingungen, zu verifizieren. ln: kab2waermebruecke, kfe5bankwaermebruecke (Konstruktion, gleiches Problem eine Ebene tiefer am Anschluss). Eigenes Schema (Isothermenverlauf am Scheibenrand, zwei Varianten).

### kfe6sicht (E6, Eigenschaft mit Entwurfsbezug)
Die Kante ist sichtbar: Farbe (schwarz, grau, hell), Breite, Verhalten bei Sprossen und schlanken Profilen, Edelstahl glänzend vs. Kunststoff matt. Auswahlkriterium: Rahmenfarbe und Sprossenbild. Endet bei T2 (Entwurfsnähe, Regel 4 sinngemäß). ln: eli3format (Entwurf, Fensterformat), ema3reduktion (Entwurf, Reduktion); Gegenverweis von dort prüfen.

## Zahlen und Regeln
- Kinderzahl: kfe4randverbund 2, kfe5abstandhalter 3. Alles unter 7.
- Titel alle unter 45 Zeichen (längster: „Oberflächentemperatur und Kondensat am Rand", 43).
- Jeder neue Knoten ab E3 hat mindestens einen Querverweis, E6/E7 jeweils einen perspektivwechselnden (Prozess oder Entwurf).
- T3 nur bei kfe4randverbund (nachziehen), kfe5dicht, kfe6psi, kfe6tau, kfe7lvkante. kfe6sicht endet bei T2.
- Status aller neuen Texte: generiert.

## Quellen, die für die Texte verifiziert werden müssen (Websuche, Stand + Link + geprueft)
DIN EN 1279-1 bis -6 (dinmedia) · DIN EN ISO 10077-1 und -2 (dinmedia) · DIN 4108-2 (dinmedia) · ÖNORM B 8110-2 (austrian-standards) · SIA 180 (sia.ch) · VOB/C ATV DIN 18355, 18360, 18361 (dinmedia) · ÖNORM A 2063 (austrian-standards) · NPK/CRB (crb.ch) · Bundesverband Flachglas, Datenblatt Psi-Werte (Verbandsquelle, keine Herstellerquelle; bitte freigeben) · ift-Richtlinie WA-08 (ift-rosenheim.de).

## Offene Entscheidungen für dich
1. Hängt die LV-Position unter kfe6psi (Kennwert → Ausschreibung, mein Vorschlag) oder direkt unter kfe5abstandhalter als E6? Spec sagt E7 = Ausschreibungsdetail, deshalb E7.
2. kfe5dicht ja oder nein? Ohne ihn versteht man den Randverbund nur halb (Abstandhalter ist nur eine von drei Komponenten), er liegt aber neben dem Strang, der zum LV führt.
3. kfe6sicht: Entwurfsbezug reicht für einen Konstruktionsknoten, oder gehört das als Entwurfsknoten neben eli3format?
4. Bundesverband Flachglas als Quelle zulassen?
