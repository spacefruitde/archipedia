# Wiederaufnahme-Punkt (16.08.2026, Pause wegen Kontingent)

## AKTUALISIERUNG 02:20 Uhr: Merge und Deploy sind schon passiert

Alle 10 Agenten fertig, 603 neue Knoten in `staging/*.json` gesichert UND bereits in `data.mjs` gemergt (700 Knoten, 48 ROOTS), gebaut und auf https://ao-prototyp.netlify.app deployt. `pruefen`/`lnwunsch` liegen abgetrennt in `staging/pruefliste.json` und `staging/lnwunsch.json`.

**WICHTIG, bevor irgendetwas anderes passiert: `npm run pull-data` NICHT ausführen!** Die 603 neuen Knoten sind noch NICHT in Supabase; pull-data würde data.mjs auf die 97 DB-Knoten zurücksetzen. Erster Schritt bei Wiederaufnahme ist deshalb der DB-Insert der neuen Knoten (aus data.mjs generieren, `npm run gen-seed` erzeugt das volle Seed; nur die neuen 603 einspielen oder Tabelle leeren und komplett neu seeden, ord = Dateireihenfolge). Erst danach ist pull-data wieder sicher.

**Bekannte Warnung:** Build meldet „mehr als 7 Kinder: kma1" (K13 Material hat laut Landkarte 8 Hauptgruppen, Spec erlaubt 7). Entscheidung von Ben nötig: zwei Gruppen zusammenlegen oder Regel für Wurzelknoten lockern.

Die Schritte 1 bis 3 unten sind damit erledigt bzw. überholt; offen bleiben DB-Insert (siehe oben), src-Verifikation der P-Knoten gegen `staging/pruefliste.json` und Stichproben-Stilkontrolle.

Stand beim Pausieren: Aufgaben 1, 2 und Netlify sind fertig (siehe Git-Log). MVP Stufe 1 läuft: 10 Sonnet-Agenten generieren die Themenlandkarte (alle Äste bis E3, nur T1). Fable 5 hat pausiert, bevor die Agenten fertig wurden.

## Wo die Agenten-Ausgaben liegen

`/private/tmp/claude-501/-Users-ben-Documents-AO/49e3b261-a7fc-45ae-b39b-3d2ef2109005/scratchpad/stufe1/`
Erwartete Dateien: k-a.json (K1–K3), k-b.json (K4/K5/K8), k-c.json (K9–K11), k-d.json (K12/K13), k-e.json (K14/K15), e-a.json (E1–E4), e-b.json (E5–E8), p-a.json (P1–P4), p-b.json (P5–P7), x.json (Fallstudien + Epochen).
Anleitung der Agenten: `../stufe1-anleitung.md` im selben Scratchpad; Bestands-IDs: `../bestand-ids.txt`.

**ERSTER SCHRITT bei Wiederaufnahme: Diese JSON-Dateien sofort nach `staging/` im Repo kopieren** (tmp überlebt keinen Neustart). Dann prüfen, ob alle 10 vorhanden und valide sind; fehlende Ast-Gruppen mit demselben Anleitungs-Prompt per Sonnet-Agent nachgenerieren.

## Dann, in dieser Reihenfolge (Modellstrategie beachten: Mechanik an Haiku/Sonnet)

1. Validieren und mergen (Skript, kann Sonnet schreiben): ID-Eindeutigkeit global, pa/ln-Ziele, Titel ≤45, keine Gedankenstriche, ≤7 Kinder. `pruefen`/`lnwunsch`-Felder VOR dem DB-Insert abtrennen und als `staging/pruefliste.json` bzw. `staging/lnwunsch.json` sichern.
2. Insert in Supabase (Projekt „Architektur", ygdorhwlautrfekhvlbd, Spacefruit; MCP verbunden): ord fortlaufend ab 98, Reihenfolge K-Äste, E-Äste, X, P.
3. ROOTS in data.mjs erweitern (neue Wurzeln: kgr1,kro1,kfa1,kda1,kfe1,kiw1,kbo1,kde1,kab1,ktg1,kma1,kbe1,kau1 · erp1,eli1,eer1,esw1,ema1,ety1,eko1,eor1 · xws1,xha1,xbs1,xun1,xga1,xwr1,xnn1,xtv1,xkl1,xph1,xre1,xkm1,xnb1,xkr1,xzp1 · pab1,pho1,pba1,pko1,pav1,pbl1,pna1) mit je einem Beschreibungssatz; Reihenfolge K, E, X, P. data.mjs P-Konstante hat `p` schon, build.mjs kann Perspektive p schon rendern (beides committet).
4. `npm run pull-data && npm run build && npm run check-links`, dann `netlify deploy --prod --dir dist` (Konto ben@spacefruit.de, Team Archi-tektur, Site ao-prototyp).
5. Fable-Arbeit danach: verifizierte src an P-Knoten anhängen (siehe unten, Rest der Prüfliste per Websuche), Stichproben-Stilkontrolle (1 von 10), Commit.

## Bereits verifizierte Rechtsquellen für P-Knoten (16.08.2026, noch NICHT eingetragen)

- HOAI, Fassung 2021 (seit 01.01.2021, Honorare nur noch Orientierung nach EuGH): https://www.gesetze-im-internet.de/hoai_2021/
- BauGB, Fassung der Bekanntmachung 03.11.2017, zuletzt geändert 23.07.2026: https://www.gesetze-im-internet.de/bbaug/
- GEG, vom 08.08.2020, zuletzt geändert 23.07.2026: https://www.gesetze-im-internet.de/geg/
- VOB/B, Ausgabe 2016 (Bekanntmachung 07.01.2016, berichtigt 01.04.2016; als DIN 1961:2016-09): https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_07012016_BI78106361.htm
- DIN 276 Kosten im Bauwesen, Ausgabe 2018-12: https://www.dinmedia.de/de/norm/din-276/293154016

Noch zu verifizieren (Auswahl je nach pruefen-Listen der Agenten): BauNVO, BGB-Bauvertragsrecht, VgV/UVgO, RPW; AT: BVergG 2018 (ris.bka.gv.at), ÖNORM B 2110, B 1801, A 2063, LM.VM (austrian-standards), OIB-RL 6 (oib.or.at, Richtlinien-2023-Seite ist verifiziert); CH: SIA 102/112/118/142/143 (shop.sia.ch), BöB und RPG (fedlex.admin.ch), eBKP-H (crb.ch). DACH-Zertifizierungen (DGNB, QNG, klimaaktiv, ÖGNI, Minergie, SNBS) auf Herausgeber-Portale.

## Offene Punkte danach

- Bilder (SVG-Pipeline, Wikimedia Commons) laut Ben „bestenfalls", noch nicht begonnen.
- Stufe 2: Tiefe in Wellen, Reihung laut Landkarte: Fenster, Flachdach, Abdichtung/Bauphysik, Baurecht (P3), Trockenbau, Böden, Kosten (P4).
- lnwunsch-Sammlung der Agenten als Kuratierungs-Backlog für Querverweise.
- Keine Redaktionsschleife nötig (Bens Ansage 16.08.): KI-Inhalte reichen für das MVP, Struktur direkt umsetzen.
