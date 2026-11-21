# Hauskarte

Eine Karte des Hauses für Mensch und Sprachmodell: Home Assistant Gerät für Gerät aufräumen, Grundriss zeichnen
oder hochladen, festlegen, was der Sprachassistent sehen darf.

*English summary below.*

Ein Sprachassistent mit Sprachmodell ist nur so gut wie das, was er über das Haus weiß: welches Gerät in welchem
Raum steht, wie es heißt, was es schaltet und ob er es überhaupt sehen soll. Hauskarte liest Etagen, Bereiche,
Geräte und Entitäten ein, macht Vorschläge und räumt dabei auch Home Assistant selbst auf.

Nichts wird ohne dich geändert. Jeder Vorschlag ist ein Haken, den du setzt oder nicht; jede Änderung lässt sich
im Verlauf zurücknehmen, auch das Entfernen verwaister Einträge. Was du entschieden hast, wird nicht erneut
vorgeschlagen.

## Status: wer was sieht

Jede Funktion (Entität) steht auf einer von vier Stufen:

| Stufe | Bedeutung |
|---|---|
| **Assistent** | Der Sprachassistent kann sie nutzen, Home Assistant zeigt sie an |
| **Nur HA** | In Home Assistant sichtbar, für den Assistenten nicht freigegeben |
| **Ausgeblendet** | Läuft weiter (Automationen, Verlauf), erscheint aber nicht in den Übersichten |
| **Deaktiviert** | Abgeschaltet, schreibt nichts mehr in die Datenbank |

Die Stufen bauen aufeinander auf: Was Home Assistant ausblendet, bekommt auch der Assistent nicht. Am Gerät ist die
Stufe eine Obergrenze: „Ausgeblendet“ blendet alle Funktionen aus, „Deaktiviert“ schaltet das Gerät ab.
Diagnosewerte wie Funkstärke werden beim Hochstufen eines Geräts nie für den Assistenten freigegeben.

## Aufbau der Seite

Die Seite **Hauskarte** in der Seitenleiste (für Administratoren) hat fünf Abschnitte, auf dem Handy als Leiste
unten:

- **Übersicht**: Stand und nächster Schritt (Hausstruktur, Grundriss, Aufräumen), Kennzahlen, Bestand prüfen,
  KI-Durchsicht und die Hausbeschreibung für den Assistenten.
- **Aufräumen**: ein Gerät nach dem anderen, ohne Ablenkung. Zuerst offene Dubletten, dann die Geräte nach Etage
  und Raum, zuletzt Funktionen ohne Gerät (Szenen, Skripte, Helfer) je Integration. Jede Karte zeigt Raum,
  Gerätestatus, „Auf der Karte zeigen“, die Vorschläge zum Ankreuzen und alle Funktionen mit Status, Name,
  Kategorie und Aliasen. Unten: *Später*, *Ohne Änderung erledigt*, *Übernehmen & weiter*. Ein erledigtes Gerät
  kommt erst wieder, wenn es neue Funktionen bekommt; neue Geräte reihen sich von selbst ein.
- **Bestand**: Listen zum Prüfen und Nachschärfen, mit Suche und Filtern.
  *Geräte* (aufklappbar zur selben Gerätekarte wie beim Aufräumen) · *Funktionen* (alle Entitäten, auch
  deaktivierte, mit Schreibrate, Mehrfachauswahl für den Status) · *Dubletten* · *Verwaist* (mit Archiv) ·
  *Verlauf* (Rückgängig).
- **Karte**: Grundriss je Etage mit Räumen, Geräten und Live-Werten.
- **Haus**: Etagen, Räume und ihre Etage, Raumgruppen, Räume zusammenführen, Notizen.

## Vorschläge

Eine Liste je Gerät, aus festen Regeln und, falls eingerichtet, vom Sprachmodell:

- **Raum** für Geräte ohne Bereich (aus dem Namen erkannt oder vom Modell vorgeschlagen)
- **Name** für Geräte mit technischem Namen (`0x00158d00…`, `shelly1-a4cf12`)
- **Status** je Funktion: Diagnose- und Technikwerte aus dem Assistenten heraus, Steuerbares hinein
- **Kategorie** für schaltbare Funktionen: Licht, Beschattung, Steckdose, Lüfter, Ventil …
- **Aliase**, wie man ein Gerät im Gespräch nennt
- **In HA als Licht führen**: Ein Schaltaktor, der eine Lampe schaltet, ist für Home Assistant nur ein Schalter;
  „Licht im Büro aus“ trifft ihn nicht. Hauskarte bietet dann die Funktion *Anzeigen als* von Home Assistant an
  (auch als Beschattung, Lüfter, Schloss oder Ventil). Der Schalter bleibt dahinter, Automationen laufen weiter.
  Dieser Vorschlag ist nie vorab angehakt.

Ein Vorschlag gilt nur, solange du die Sache seitdem nicht selbst geändert hast. Sichere Regel-Vorschläge lassen
sich in der Übersicht gesammelt übernehmen, Vorschläge des Sprachmodells nie.

## Sprachmodell (optional)

Die Regeln laufen immer. Für das, was sie nicht wissen, kann ein Sprachmodell gefragt werden:

| Einstellung | Wofür |
|---|---|
| Kein Sprachmodell | Nur Regeln; offene Fragen beantwortest du auf der Seite selbst |
| AI-Task-Entität | Das Modell, das in Home Assistant schon eingerichtet ist (`ai_task.generate_data`) |
| OpenAI-kompatibler Server | Direkt an `…/v1/chat/completions`, z. B. llama.cpp, Ollama, LM Studio, vLLM |

Wofür das Modell gefragt wird:

- **Was ist das?** an jedem Gerät: eine kurze Erklärung, was das Gerät tut, dazu Status und Kategorie für jede
  seiner Funktionen, jeweils mit Begründung.
- **KI-Durchsicht** in der Übersicht: Räume ohne Etage, Dubletten (wirklich dasselbe? welche Entität bleibt?),
  verwaiste Einträge je Integration und Geräte ohne Lebenszeichen.
- **Bestand prüfen** mit Modell: Räume und Namen, wo die Regeln keine finden.

Das Modell bekommt Gerätenamen, Hersteller, Modell, Integration, Entitätstypen und die Liste der Bereiche, keine
Zustände und keinen Verlauf. Anfragen laufen nacheinander in kleinen Gruppen, damit ein gemeinsam genutzter
Modellserver für Sprachbefehle frei bleibt.

## Dubletten zusammenführen

Dasselbe Gerät kommt oft über zwei Systeme ins Haus: Loxone und Shelly, Loxone und KNX, Zigbee2MQTT und Tasmota …
Hauskarte findet solche Paare auf zwei Wegen, ohne bestimmte Systeme zu bevorzugen:

- **Verlauf:** Beide schalten in den letzten 7 Tagen immer gleichzeitig (aus dem Recorder). Findet auch Paare wie
  „Deckenlicht Küche“ und `shelly1pm-a1b2c3…`, deren Namen nichts gemeinsam haben.
- **Name:** gleiche Art, sehr ähnlicher Name, gleicher Raum, verschiedene Systeme.

*Zusammenführen* heißt: Der Assistent nutzt nur die gewählte Entität (sie bekommt den Raum und die anderen Namen als
Aliase), die anderen werden in Home Assistant **ausgeblendet**, nicht deaktiviert. Automationen und die Systeme
selbst laufen unverändert weiter. *Trennen* stellt alles wieder her.

## Verwaistes und Archiv

Unter *Bestand → Verwaist* stehen Entitäten, die ihre Integration gerade nicht liefert, nach Integration
gruppiert. Nichts ist vorausgewählt: „nicht geliefert“ heißt oft nur „gerade offline“. Entfernte Einträge landen im
**Archiv** und lassen sich mit Raum, Namen, Aliasen und Freigabe wiederherstellen. Geräte löschen geht über den
Löschweg von Home Assistant selbst und nur bei Integrationen, die das erlauben.

## Karte und Grundriss

- **Zeichnen:** Rechteck auf dem Raster aufziehen, einem Bereich zuordnen oder einen neuen anlegen, verschieben und
  in der Größe ändern. Alle Etagen teilen sich ein Raster, so ergibt sich, was nebeneinander und was übereinander
  liegt.
- **Hochladen:** ein Grundriss-Bild je Etage als Hintergrund. *Mit KI erkennen* schickt es an ein Bildmodell
  (OpenAI-kompatibler Server mit Bildverständnis); die erkannten Räume prüfst und übernimmst du.
- **Geräte** stehen als Symbole in ihrem Raum und lassen sich an ihren Platz ziehen; in einen anderen Raum gezogen,
  wechseln sie den Bereich. Eigene Symbole: ein Home-Assistant-Icon (`mdi:…`) oder ein eigenes Bild.
- **Werte:** Reine Sensoren (Temperatur, Luftfeuchte, Fenster/Tür, Bewegung, Strom) stehen als Werteleiste je Raum
  neben der Karte, live.
- **Bedienen:** Tippen schaltet Licht und Schalter, alles andere öffnet das Bedienfenster von Home Assistant.
- **Raumgruppen** für offene Bereiche aus mehreren Räumen (z. B. *Wohnbereich* = Wohnzimmer + Esszimmer): Die Räume
  bleiben einzeln, die Gruppe ist ein Home-Assistant-**Label** an ihnen. Einen Bereich, der eigentlich mehrere Räume
  ist, wandelt *In Raumgruppe umwandeln* um. Die eingebaute Sprachsteuerung von Home Assistant kennt keine Labels;
  „im Wohnbereich“ versteht ein Gesprächsagent mit Sprachmodell über die Hausbeschreibung.
- **Räume zusammenführen:** Geräte und Entitäten wandern in den anderen Raum, der alte Name bleibt dort als Alias;
  vorher zeigt Hauskarte, welche Automationen und Skripte den alten Raum direkt ansprechen.

## Hausbeschreibung für den Sprachassistenten

Aus der Karte entsteht ein kurzer, stabiler Text: Etagen mit Räumen, was „oben“ und „unten“ heißt, welche Räume
aneinandergrenzen oder übereinander liegen, wo Sprachgeräte stehen, Raumgruppen, Notizen. Er steht im Sensor
`sensor.hauskarte_beschreibung` (Attribut `text`, nicht in der Datenbank) und gehört in die Anweisungen des
Gesprächsagenten:

```jinja
{{ state_attr('sensor.hauskarte_beschreibung', 'text') }}
```

Home Assistant gibt dem Modell selbst schon die freigegebenen Entitäten mit ihren Bereichen; die Hausbeschreibung
ergänzt, was dort fehlt.

## Neue Geräte

Zwei Minuten nachdem ein Gerät angelernt wurde, laufen die Regeln (ohne Sprachmodell). Neue Vorschläge erscheinen
als ein Eintrag unter *Einstellungen → Reparaturen*, das Gerät selbst im Abschnitt *Aufräumen*. Abschaltbar in den
Optionen der Integration.

Der Dienst `hauskarte.scan` (`use_llm: true|false`) startet einen Durchlauf von Hand, z. B. nachts per Automation.

## Installation

Voraussetzung: Home Assistant 2025.8 oder neuer.

**HACS:** *HACS → Benutzerdefinierte Repositories* → dieses Repository als *Integration* hinzufügen → *Hauskarte*
herunterladen → Home Assistant neu starten.

**Von Hand:** `custom_components/hauskarte` nach `config/custom_components/` kopieren, neu starten.

Danach *Einstellungen → Geräte & Dienste → Integration hinzufügen → Hauskarte*. Das Sprachmodell stellst du in den
Optionen der Integration ein.

Vorher ein Backup machen: Hauskarte schreibt in die Geräte- und Entitäts-Registry.

---

## English

Hauskarte ("house map") tidies up Home Assistant and gives people and language models a map of the home.

- **Clean up device by device:** a focus mode walks through every device (duplicates first, then by floor and
  room). Each card shows area, device status, "show on map", tickable suggestions (area, name, status, category,
  aliases) and all functions. A switch that drives a light can be shown as a light in HA (switch_as_x), so
  "turn off the office light" works.
- **One status ladder:** Assistant → HA only → Hidden → Disabled. On a device it is a ceiling.
- **Inventory:** lists of devices, functions (with write rate), duplicates, orphans (with a restorable archive) and
  history. Every change can be undone.
- **Map:** draw rooms on a grid per floor or upload a floor plan and let a vision model propose rooms. The map
  becomes a compact house description in `sensor.hauskarte_beschreibung` for a conversation agent's instructions.
- **Optional language model** (AI Task entity or any OpenAI-compatible server): explains what a device is, suggests
  status and category per function, reviews duplicates, orphans and silent devices. It only receives device names,
  manufacturer, model, integration, entity types and the list of areas.

Install via HACS as a custom repository (category *Integration*) or copy `custom_components/hauskarte`, restart,
then add the *Hauskarte* integration. Back up first: it writes to the device and entity registries.
