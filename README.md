# Hauskarte

Eine Karte des Hauses für Mensch und Sprachmodell: Grundriss zeichnen oder hochladen, Geräte aufräumen, per Klick
prüfen.

*English summary below.*

Ein Sprachassistent mit Sprachmodell ist nur so gut wie das, was er über das Haus weiß: welches Gerät in
welchem Raum steht, wie es heißt und ob er es überhaupt sehen soll. Hauskarte liest Etagen, Bereiche, Geräte
und Entitäten ein und schlägt vor:

- **Raum** für Geräte ohne Bereich (aus dem Namen erkannt oder vom Sprachmodell vorgeschlagen)
- **Name** für Geräte mit technischem Namen (`0x00158d00…`, `shelly1-a4cf12`)
- **Freigabe für Assist**: Diagnose-, Konfigurations- und Technik-Entitäten raus, Steuerbares rein
- **Aliase**, wie man das Gerät im Gespräch nennt

Nichts wird ohne dich geändert. Die Seite **Hauskarte** in der Seitenleiste zeigt jeden Vorschlag als Karte:
*Übernehmen* (auch nach eigener Korrektur), *Nicht für Assistent*, *Später* oder *Ignorieren*. Sichere
Vorschläge aus festen Regeln lassen sich gesammelt übernehmen; Vorschläge des Sprachmodells nie. Jede Änderung
lässt sich zurücknehmen (außer dem Entfernen). Entscheidungen bleiben gespeichert: Ein neuer Durchlauf zeigt
nur, was neu ist oder sich geändert hat.

## Einrichtungs-Assistent

Beim ersten Öffnen führt ein Assistent einmal durchs ganze Haus – damit man am Anfang nicht im Durcheinander
steht:

1. **Willkommen** – was passiert; auf Wunsch startet die KI-Durchsicht im Hintergrund.
2. **Etagen** anlegen, benennen, nummerieren (mit KI-Vorschlag).
3. **Je Etage:** Räume anlegen, Räume ohne Etage zuordnen (KI-Vorschläge vorausgewählt), optional Grundriss
   hochladen und erkennen lassen oder Räume einzeichnen.
4. **Raum für Raum:** was drin ist (mit Typ), was vermutlich hierher gehört, Vorschläge und Doppelte zu den
   Geräten des Raums, Geräte in einen anderen Raum verschieben.
5. **Geräte ohne Raum** zuordnen (Vorschlag vorausgewählt).
6. **Fertig** – Zusammenfassung und die Hausbeschreibung für den Sprachassistenten.

Er merkt sich den Stand (auch über Neustarts und Geräte hinweg), lässt sich jederzeit unterbrechen und über
**🧭 Einrichtung** fortsetzen.

## Aufbau der Seite

Vier Bereiche – auf dem Handy als Leiste unten:

- **Aufräumen** führt in Schritten durch: 1 Räume ohne Etage · 2 Doppelte · 3 Vorschläge · 4 Geräte ohne
  Lebenszeichen · 5 Verwaist · Verlauf. Jeder Schritt zeigt, wie viel noch offen ist.
- **Karte** – Grundriss je Etage mit Räumen und Geräten.
- **Räume** – Etagen umbenennen, nummerieren, anlegen; jeden Raum einer Etage zuordnen, umbenennen; sehen, was
  drin ist (💡 3 ⛱️ 2 🌡️ 1).
- **Geräte** – alle Geräte mit Typ, nach Raum oder System gruppiert, filterbar; Raum direkt ändern.

Hauskarte erkennt, **was** etwas ist – Licht, Beschattung, Steckdose, Heizung, Kontakt, Bewegung … – aus Typ,
Geräteklasse und Namen (ein Schalter „Licht Flur“ ist ein Licht).

## KI-Durchsicht

Mit eingestelltem Sprachmodell fragt **🤖 KI-Durchsicht** das Modell zu jedem Aufräum-Schritt – eine Frage nach der
anderen, damit ein gemeinsam genutzter Modellserver für Sprachbefehle frei bleibt:

| Schritt | Die KI empfiehlt |
|---|---|
| Etagen | verständliche Etagennamen und -nummern, Etage für Räume ohne Etage |
| Doppelte | wirklich dasselbe? welche Entität der Assistent nutzen soll |
| Verwaist | je Integration: entfernen, behalten oder prüfen |
| Ohne Lebenszeichen | behalten, prüfen, deaktivieren oder löschen |
| Schalter | was ein Schalter vermutlich steuert (Licht, Steckdose, Pumpe …) |

Jede Empfehlung steht mit Begründung beim jeweiligen Eintrag. Übernommen wird nur per Klick, mit Rückgängig. Das
Modell bekommt Namen, Typen, Räume und Integrationen – keine Zustände und keinen Verlauf.

## Doppelte zusammenführen

Dasselbe Gerät kommt oft über zwei Systeme ins Haus: Loxone und Shelly, Loxone und KNX, Zigbee2MQTT und Tasmota
… Hauskarte findet solche Paare auf zwei Wegen – ohne bestimmte Systeme zu bevorzugen:

- **Verlauf:** Beide schalten in den letzten 7 Tagen immer gleichzeitig (aus dem Recorder). Findet auch Paare
  wie „Deckenlicht Küche“ und `shelly1pm-a1b2c3…`, deren Namen nichts gemeinsam haben.
- **Name:** gleiche Art, sehr ähnlicher Name, gleicher Raum, verschiedene Systeme.

*Zusammenführen* heißt: Der Assistent nutzt nur die gewählte Entität (sie bekommt Raum und die anderen Namen als
Aliase), die anderen werden für den Assistenten nicht freigegeben und in Home Assistant **ausgeblendet** – nicht
deaktiviert. Automationen und die Systeme selbst laufen unverändert weiter. *Trennen* stellt alles wieder her.

## Geräte und Verwaistes aufräumen

- **Geräte:** alle Geräte nach Integration, Geräte ohne Lebenszeichen zuerst. *Deaktivieren* blendet ein Gerät
  samt Entitäten aus und lässt sich zurücknehmen. *Löschen* nutzt den Löschweg von Home Assistant selbst und geht
  nur bei Integrationen, die das Löschen einzelner Geräte erlauben.
- **Verwaist:** Entitäten, die ihre Integration gerade nicht liefert, nach Integration gruppiert, mit Hinweis, ob
  das Gerät selbst noch meldet. Nichts ist vorausgewählt: „nicht geliefert“ heißt oft nur „gerade offline“ (Drucker
  aus, Tablet weg) oder „wird erst angelegt, wenn das Gerät meldet“. Darum schlägt Hauskarte das Entfernen nie
  von sich aus vor.

## Karte und Grundriss

Der Reiter **Karte** zeigt jede Etage (von oben nach unten) mit ihren Räumen, Geräten und Sprachgeräten.

- **Zeichnen:** *Grundriss bearbeiten* → auf freier Fläche ein Rechteck aufziehen → vorhandenem Bereich
  zuordnen oder neuen anlegen. Räume verschieben, an der Ecke unten rechts die Größe ändern. Alle Etagen teilen
  sich ein Raster, so ergibt sich, was nebeneinander und was übereinander liegt.
- **Hochladen:** Ein Grundriss-Bild pro Etage liegt als Hintergrund unter dem Raster. *Mit KI erkennen* schickt
  das Bild mit eingezeichnetem, nummeriertem Raster an ein Bildmodell (OpenAI-kompatibler Server mit
  Bildverständnis). Die erkannten Räume erscheinen gestrichelt; du prüfst Namen und Zuordnung und übernimmst sie.
- **Zwei Modi beim Bearbeiten:** *🏠 Räume zeichnen* (Geräte nur blass, nichts verdeckt Ecken und Knöpfe) und
  *💡 Geräte platzieren* (Räume bleiben fest).
- **Raumgruppen** für offene Bereiche aus mehreren Räumen (z. B. *Wohnbereich* = Wohnzimmer + Esszimmer): Die
  Räume bleiben einzeln, die Gruppe ist ein Home-Assistant-**Label** an ihnen (nutzbar als Ziel in Automationen).
  Auf der Karte ein gestrichelter Rahmen, in der Hausbeschreibung die Zeile „Wohnbereich = Esszimmer und Wohnzimmer“.
  Einen vorhandenen Bereich, der eigentlich mehrere Räume ist, wandelt *In Raumgruppe umwandeln* um: Räume wählen,
  jedes Gerät einem davon zuordnen (Vorschlag aus dem Namen), fertig – rücknehmbar. Hinweis: Die eingebaute
  Sprachsteuerung von Home Assistant kennt keine Labels; „im Wohnbereich“ versteht ein Gesprächsagent mit
  Sprachmodell über die Hausbeschreibung.
- **Räume zusammenführen** (unter Räume und in der Einrichtung): Geräte und Entitäten wandern in den anderen Raum,
  der alte Name bleibt dort als Alias; vorher zeigt Hauskarte, welche Automationen und Skripte den alten Raum direkt
  ansprechen. Lässt sich zurücknehmen.
- **Etagen anlegen** geht direkt auf der Karte. Räume, die auf einer anderen Etage eingezeichnet werden, wechseln
  die Etage.
- **Geräte** stehen als Symbole in ihrem Raum – automatisch, sobald sie einen Bereich haben. Im Bearbeiten-Modus
  lassen sie sich an ihren ungefähren Platz ziehen; in einen anderen Raum gezogen, wechseln sie den Bereich.
  Geräte ohne Bereich warten in einer Ablage und werden durch Hineinziehen eingeordnet. Auf der Karte stehen alle
  Geräte, die der Assistent nutzen darf, und alle Sprachgeräte; einzelne lassen sich aus- und einblenden, beim
  Aufräumen per Häkchen „Auf der Karte zeigen“.
- **Dinge und Werte:** Auf der Karte stehen die physischen Dinge (Licht, Beschattung, Steckdosen, Heizung,
  Medien, Sprachgeräte …) mit den Symbolen und dem Live-Zustand aus Home Assistant. Reine Sensoren (Temperatur,
  Luftfeuchte, Fenster/Tür, Bewegung, Melder, Strom) stehen als **Werteleiste je Raum neben der Karte**, live;
  Temperatur und Luftfeuchte zusätzlich klein im Raumkopf.
- **Bedienen:** Tippen schaltet Licht und Schalter (abschaltbar: „Tippen schaltet“), alles andere – und langes
  Drücken – öffnet das Bedienfenster von Home Assistant. Ein Wert in der Leiste öffnet seinen Verlauf.
- **Eigene Symbole:** im Bearbeiten-Modus per 🎨 ein HA-Icon (`mdi:…`) oder ein eigenes Bild je Gerät.
- **Notizen** pro Raum und fürs ganze Haus (z. B. „offen zur Küche“).

Änderungen an Bereichen und Etagen lassen sich wie alles andere zurücknehmen.

## Hausbeschreibung für den Sprachassistenten

Aus der Karte entsteht ein kurzer, stabiler Text: Etagen mit Räumen, was „oben“ und „unten“ heißt, welche Räume
aneinandergrenzen oder übereinander liegen, wo Sprachgeräte stehen, Notizen. Er steht im Sensor
`sensor.hauskarte_beschreibung` (Attribut `text`, nicht in der Datenbank) und gehört in die Anweisungen des
Gesprächsagenten:

```jinja
{{ state_attr('sensor.hauskarte_beschreibung', 'text') }}
```

Home Assistant gibt dem Modell selbst schon die freigegebenen Entitäten mit ihren Bereichen und den Bereich des
Sprachgeräts, über das gerade gesprochen wird – die Hausbeschreibung ergänzt, was dort fehlt.

## Neue Geräte

Zwei Minuten nachdem ein Gerät angelernt wurde, laufen die Regeln (ohne Sprachmodell). Neue Vorschläge erscheinen
als ein Eintrag unter *Einstellungen → Reparaturen*: dort sichere Vorschläge direkt übernehmen oder auf der
Hauskarte-Seite prüfen. Abschaltbar in den Optionen der Integration. Sprachgeräte ohne Raum stehen immer oben.

## Sprachmodell (optional)

Die Regeln laufen immer. Für Lücken, die sie nicht schließen, kann ein Sprachmodell gefragt werden:

| Einstellung | Wofür |
|---|---|
| Kein Sprachmodell | Nur Regeln; offene Fragen beantwortest du auf der Seite selbst |
| AI-Task-Entität | Das Modell, das in Home Assistant schon eingerichtet ist (`ai_task.generate_data`) |
| OpenAI-kompatibler Server | Direkt an `…/v1/chat/completions`, z. B. llama.cpp, Ollama, LM Studio, vLLM |

Hauskarte schickt dem Modell nur Gerätenamen, Hersteller, Modell, Integration, Entitätstypen und die Liste
der Bereiche – keine Zustände, keine Verläufe. Anfragen laufen nacheinander in kleinen Gruppen, damit ein
gemeinsam genutzter Modellserver für Sprachbefehle frei bleibt. Der Systemprompt ist für alle Gruppen gleich,
damit Server mit Prompt-Cache ihn nur einmal einlesen.

## Installation

**HACS:** *HACS → Benutzerdefinierte Repositories* → dieses Repository als *Integration* hinzufügen →
*Hauskarte* herunterladen → Home Assistant neu starten.

**Von Hand:** `custom_components/hauskarte` nach `config/custom_components/` kopieren, neu starten.

Danach *Einstellungen → Geräte & Dienste → Integration hinzufügen → Hauskarte*. Die Seite erscheint für
Administratoren in der Seitenleiste.

Vorher ein Backup machen: Hauskarte schreibt in die Geräte- und Entitäts-Registry.

## Dienst

`hauskarte.scan` (`use_llm: true|false`) startet einen Durchlauf, z. B. nachts per Automation. Neue Geräte
stehen dann morgens als Vorschlag bereit.

## Entwicklung

```bash
python3.14 -m venv .venv && .venv/bin/pip install -r requirements_test.txt ruff
.venv/bin/ruff check . && .venv/bin/pytest -q
```

Getestet mit Home Assistant 2026.10.

---

## English

Hauskarte ("house map") gives people and language models a map of the home. Draw rooms on a grid per floor or
upload a floor plan image and let a vision model propose the rooms. The map becomes a compact house description
(floors, what is next to / above what, where voice devices are, notes) in `sensor.hauskarte_beschreibung` for a
conversation agent's instructions. It also tidies up Home Assistant: it proposes areas, readable names, Assist
exposure, aliases and removal of orphaned entities; new devices show up in Repairs. You
review every proposal in a sidebar panel and apply, correct, postpone or ignore it. Safe rule-based proposals
can be applied in bulk, language-model proposals never. Every change except removal can be undone.

An optional language model fills the gaps the rules leave open, either through an AI Task entity or any
OpenAI-compatible server. It only receives device names, manufacturer, model, integration, entity types and
the list of areas.

Install via HACS as a custom repository (category *Integration*) or copy `custom_components/hauskarte`, restart,
then add the *Hauskarte* integration. Back up first: it writes to the device and entity registries.
