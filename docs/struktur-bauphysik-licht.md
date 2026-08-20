# Strukturvorschlag Welle 2: Abdichtung/Bauphysik und Licht (21.08.2026; pauschale Freigabe durch Ben, keine Einzelredaktion)

Begründung: Der Fenster-Ast verweist am häufigsten in Licht (20) und Abdichtung/Bauphysik (20); beide sind heute flach (Bauphysik 15 von 21 ab E3 ohne Spezifikation). Mit diesen zwei Ästen bekommt das Netz um Fenster herum Tiefe auf beiden Seiten. Ablauf wie Fenster-Welle: Sonnet-Texte je Teilast, Haiku-Mechanik, Opus-Gegenlesung mit Websuche vor Livegang, Fable für Struktur, Kuration, Zeichnungen. Sonnet-Prompts bekommen die Fehlerklassen aus docs/gegenlesung-fenster-2026-08-21.md als Negativliste.

Umfang: 42 neue Konstruktionsknoten (kab, davon 1 E5), 27 neue Entwurfsknoten (eli, alle T2-Ende), T3 für 15 bestehende kab-Knoten ab E3, 10 Schemazeichnungen (◆). Legende: T3 Spezifikation, DACH länderabhängig, ln Querverweis-Kandidaten.

## b1_luft

**kab3luftdicht Die luftdichte Ebene im Bauteilaufbau**
- kab4luftfenster · Anschluss der luftdichten Ebene an Fenster · T3 · ln kfe4dichtinnen, kfe3raldicht
- kab4luftdurch · Durchdringungen: Leitungen, Balken, Dosen · T3 · ◆ · ln ktg1, kiw1
- kab4luftinst · Installationsebene vor der Luftdichtheit · T3 · ln kiw1, ktg1
- kab4luftstoss · Stöße, Überlappung und Verklebung von Bahnen · T3 · ln kfe4dichtecke

**kab3dampfbremse Dampfbremse und Dampfsperre**
- kab4sdwert · sd-Wert und Diffusionswiderstand · T3 · ln kma1
- kab4feuchtevar · Feuchtevariable Dampfbremse · T3 · ◆ · ln kda1, kbe1
- kab4dampfsperre · Dampfsperre im Flachdach und Holzbau · T3 · ln kda1 · Knotentyp Zielkonflikt (Muster k3kombi): Bedingung nennen, unter der die Sperre richtig und unter der sie falsch ist (Rücktrocknung).

**kab3blowerdoor Blower-Door-Test und Leckageortung**
- kab4n50 · Messverfahren und Kennwerte n50 und q50 · T3 · DACH · ln pna3nachweis, pbl2bau
- kab4messzeit · Zeitpunkt der Messung im Bauablauf · T3 · ln pbl2bau, pab2termin
- kab4leckagen · Typische Leckagen und ihre Ortung · T3 · ln kfe3raldicht, kiw1

## b2_waermebruecke

**kab3konstruktiv Konstruktive Wärmebrücken**
- kab4balkon · Balkonplatte und thermische Trennung · T3 · ◆ · ln kfa1, pna3nachweis
- kab4stuetze · Stütze und Deckenrand in der Außenwand · T3 · ln kfa1
- kab4wbfenster · Fensteranschluss als Wärmebrücke · T3 · ln kfe4montagewand, kfe3daemmkeil, kfe6tau
- kab4wbsockel · Sockel und Kelleraußenwand · T3 · ln kgr3waermebr, kgr2perim

**kab3geometrisch Geometrische Wärmebrücken**
- kab4ecke · Außenecke und Innenecke · T3 · ◆ · ln kfe6tau
- kab4attika · Attika und Dachrand · T3 · ln kda3attika

**kab3vermeidung Wärmebrückenfreies Konstruieren**
- kab4nachweis · Nachweis: pauschal, gleichwertig, detailliert · T3 · DACH · ln pna3nachweis, pna2energie
- kab4psichi · Psi und Chi: Kennwerte und Rechenregeln · T3 · ln kfe6psi, kfe4montagewand
- kab4isothermen · Isothermen lesen: fRsi und Schimmelrisiko · T3 · DACH · ln kfe6tau, kab2nassraum

**kab4nachweis Nachweis: Pauschal, Gleichwertigkeit, Einzelnachweis**
- kab5gleichwert · Gleichwertigkeitsnachweis führen · T3 · ln pna3nachweis · Ausschreibungs- und Nachweisdetail: wer liefert was, wann im Ablauf.

## b3_schlagregen

**kab3fassade Schlagregenschutz an der Fassade**
- kab4bgruppen · Beanspruchungsgruppen I bis III · T3 · DACH · ln kfa1, pba2ordnungsr
- kab4wasserwege · Wege des Wassers in der Außenwand · T3 · ln kfa2vhf, kfe4laibaussen · Varianten mit Auswahlkriterium und Regelfall-Gewinner (Spec 8.3).
- kab4fassfuge · Fugen und Durchdringungen in der Fassade · T3 · ln kab3abdichtfuge, kfa3befestvhf

**kab3fenster Fenster- und Türanschluss an die Abdichtung**
- kab4anschlussunten · Unterer Anschluss und Fensterbank · T3 · ◆ · ln kfe4bankmontage, kfe5bankwaermebruecke
- kab4anschlussseite · Seitlicher und oberer Anschluss · T3 · ln kfe4dichtaussen, kfe4laibvhf
- kab4bodentief · Bodentiefes Element und Schwelle · T3 · ln kfe5hsschwelle, k4null

**kab3sockel Spritzwasserzone am Sockel**
- kab4spritzhoehe · Spritzwasserhöhe und Sockelabdichtung · T3 · DACH · ln kgr3sockel, kau3sockelanschl
- kab4sockelwdvs · Sockel bei WDVS: Perimeter und Übergang · T3 · ln kgr2perim, kfe4laibaussen

## b4_fuge

**kab3bewegungsfuge Bewegungsfugen im Hochbau**
- kab4fugenabstand · Fugenabstände und Fugenbreite · T3 · ln kfa1, kbo2sockel
- kab4fugedurch · Fuge durch alle Schichten: Dach, Wand, Boden · T3 · ln kda1, kbo1

**kab3abdichtfuge Abdichten von Fugen: Fugenband und Fugenmasse**
- kab4fugenmasse · Fugenmasse: Dimensionierung und Hinterfüllung · T3 · ◆ · ln kfe4dichtaussen
- kab4fugenband · Fugenband und Fugenblech · T3 · ln kgr1
- kab4wartungsfuge · Wartungsfuge oder dauerhaft dichte Fuge · T3 · ln pbl2gewaehr, kab3verbund

**kab3anschlussfuge Anschlussfugen an Bauteilübergängen**
- kab4anschlusstrocken · Anschluss Trockenbau an Massivbau · T3 · ln kiw1, k6trocken
- kab4anschlussfenster · Anschlussfuge Fenster: Maß und Bewegung · T3 · ln kfe3raldicht, kfe4dichtmitte

## b5_nassraum

**kab3verbund Verbundabdichtung unter Fliesenbelag**
- kab4wklassen · Wassereinwirkungsklassen W0 bis W3 · T3 · DACH · ln kbo1, pba2ordnungsr
- kab4wandboden · Wand-Boden-Ecke und Durchdringungen · T3 · ◆ · ln kiw1
- kab4dusche · Bodenebene Dusche · T3 · ln kab3ablauf, kbo1

**kab3ablauf Bodenablauf und Gefälle**
- kab4gefaelle · Gefälle und Ablaufposition · T3 · ln kbo1
- kab4rinne · Rinne oder Punktablauf (Auswahl) · T3 · ln ktg1 · Varianten mit Auswahlkriterium und Regelfall-Gewinner (Spec 8.3).

**kab3feuchtraum Feuchträume außerhalb des Bads**
- kab4kueche · Küche, Hauswirtschaft, Technikraum · T3 · ln ktg1
- kab4schwimmbad · Schwimmbad und Wellness als Sonderfall · T3 · ln ktg1, kma1

## l1_tag

**eli3seite Einseitiges Licht und Raumtiefe**
- eli4raumtiefe · Raumtiefe und Sturzhöhe: die Faustregel · T2-Ende · ◆ · ln erp1, kfe4profbautiefe
- eli4decke · Helle Decke und Sturz als Reflektor · T2-Ende · ln ema3licht, kde1
- eli4lichtband · Lichtband unter der Decke · T2-Ende · ln efe3reihung, kfe4fix

**eli3zwei Licht von zwei Seiten und Eckfenster**
- eli4eckfenster · Eckfenster: Licht um die Kante · T2-Ende · ◆ · ln efe3ecke, kfe4fix
- eli4durchblick · Gegenüberliegende Öffnungen und Durchblick · T2-Ende · ln erp1, eer1

**eli3oben Oberlicht und Zenitlicht**
- eli4shed · Sheddach und Nordlicht · T2-Ende · ln kda1, ety1
- eli4kuppel · Lichtkuppel und Lichtschacht · T2-Ende · ln kda1, kab4attika
- eli4treppenlicht · Oberlicht im Treppenhaus · T2-Ende · ln et2licht, et1

**eli3lenk Lichtlenkung durch Material und Farbe**
- eli4laibungfarbe · Weiße und farbige Laibung · T2-Ende · ln efe2laibung, ema1
- eli4lamellen · Lichtlenkende Lamellen und Prismen · T2-Ende · ln kfe4integriertlamelle, kfe3innenliegend
- eli4glanz · Glanz und Mattigkeit der Oberflächen · T2-Ende · ln ema1, kma1

**eli3jahreszeit Lichteinfall im Jahresverlauf**
- eli4sonnenstand · Sonnenstand und Verschattung im Entwurf · T2-Ende · ◆ · ln kfe3aussenliegend, kfe4sommer
- eli4ueberstand · Dachüberstand: Winterlicht tief, Sommer hoch · T2-Ende · ln kda1, kfe4sommer

## l2_verh_kunst

**eli3anteil Öffnungsanteil und Fassadencharakter**
- eli4orientierung · Öffnungsanteil nach Himmelsrichtung · T2-Ende · ln pna2energie, kfe4gwert
- eli4kennwerte · Tageslichtquotient und andere Kennwerte · T2-Ende · ln pna3nachweis, pba2ordnungsr · Kennwerte nennen (Tageslichtquotient, Tageslichtversorgung), Normen als Orientierung in pruefen, DE/AT/CH unterschiedlich: im Text benennen, kein dach-Feld (Entwurf).

**eli3format Fensterformat: liegend, stehend, raumhoch**
- eli4liegend · Liegend: Horizont und Panorama · T2-Ende · ln efe2format, kfe4fix
- eli4stehend · Stehend: Aufrichtung und Tiefe · T2-Ende · ln efe2format, erp1
- eli4raumhoch · Raumhoch: die Schwelle zum Außenraum · T2-Ende · ln kfe4bodentief, esw1

**eli3wandanteil Die geschlossene Wand als Gegenpart**
- eli4bildtraeger · Die Wand als Bildträger · T2-Ende · ln ema1, eor1
- eli4strasse · Geschlossene Fassade zur Straße · T2-Ende · ln eko1, eli3privat

**eli3privat Öffnung und Einsichtnahme**
- eli4sichtschutz · Sichtschutz durch Höhe, Lage und Filter · T2-Ende · ln kfe3innenliegend, efe2laibung
- eli4nachteinblick · Einblick von außen bei Nacht · T2-Ende · ln eli3fassnacht, eli2kunst

**eli3grundlicht Grundlicht und Akzentlicht**
- eli4schichten · Lichtschichten: Grund, Akzent, Orientierung · T2-Ende · ln ktg1, eer1
- eli4lichtfarbe · Lichtfarbe und Farbwiedergabe · T2-Ende · ln ema3licht, ktg1

**eli3indirekt Indirektes Licht**
- eli4voute · Voute und Lichtdecke · T2-Ende · ln kde1, ktg1

**eli3fassnacht Fassaden und Wege bei Nacht**
- eli4anstrahlen · Fassadenlicht: anstrahlen oder durchleuchten · T2-Ende · ln kfa1, eko1
- eli4lichtverschmutzung · Lichtverschmutzung und Nachbarschaft · T2-Ende · ln pba2abstand, pba2ordnungsr

## Bestand: T3 nachziehen
kab3luftdicht, kab3dampfbremse, kab3blowerdoor, kab3konstruktiv, kab3geometrisch, kab3vermeidung, kab3fassade, kab3fenster, kab3sockel, kab3bewegungsfuge, kab3abdichtfuge, kab3anschlussfuge, kab3verbund, kab3ablauf, kab3feuchtraum

## Landkarte
Reihenfolge Stufe 2 wird geändert: Fenster → Abdichtung/Bauphysik + Licht → Flachdach/Fassade → Baurecht → Trockenbau → Böden → Kosten (Begründung: Netzdichte vor Recherche-Schmerz).

## Entscheidungen für dich
1. Streichen/ergänzen nach Gefühl; IDs und Aufhängung ändere ich danach.
2. eli4kennwerte (Tageslichtquotient) als Entwurfsknoten ohne dach-Feld, Länderunterschiede im Text: einverstanden, oder lieber ein Konstruktions-/Prozessknoten mit DACH?
3. Start der Sonnet-Welle sofort nach deiner Freigabe, Opus-Gegenlesung danach automatisch.
