// Hauskarte review panel. Plain web component, no build step.

const TEXT = {
  de: {
    title: "Hauskarte",
    scan: "Bestand prüfen",
    scanRules: "Nur Regeln",
    applySafe: "Alle sicheren übernehmen",
    undo: "Letzte Änderung zurücknehmen",
    open: "Offen",
    later: "Später",
    ignored: "Ignoriert",
    history: "Verlauf",
    search: "Suchen …",
    neverScanned: "Noch nicht geprüft. Starte mit „Bestand prüfen“.",
    lastScan: "Zuletzt geprüft",
    running: "Prüfe …",
    phaseRules: "Regeln",
    phaseLlm: "Sprachmodell",
    noLlm: "Kein Sprachmodell eingestellt – nur Regeln (Einstellungen der Integration).",
    empty: "Hier ist nichts.",
    area: "Raum",
    noArea: "– kein Raum –",
    name: "Name",
    exposed: "für Assistent",
    aliases: "Aliase, mit Komma getrennt",
    remove: "entfernen",
    more: "weitere Entitäten",
    accept: "Übernehmen",
    notForAssistant: "Nicht für Assistent",
    postpone: "Später",
    ignore: "Ignorieren",
    showAgain: "Wieder anzeigen",
    safe: "sicher",
    ai: "KI-Vorschlag",
    showMore: "Mehr anzeigen",
    changes: "Änderungen",
    confirmSafe: (n) => `${n} sichere Vorschläge ohne Einzelprüfung übernehmen?`,
    confirmRemove: "Entitäten werden endgültig aus der Registry entfernt. Das lässt sich nicht zurücknehmen. Fortfahren?",
    undone: (r) => `${r.reverted} Änderungen an „${r.title}“ zurückgenommen` + (r.skipped ? `, ${r.skipped} nicht möglich` : ""),
    nothingToUndo: "Nichts zum Zurücknehmen.",
    applied: (n) => `${n} Änderungen gespeichert`,
    map: "Karte",
    edit: "Grundriss bearbeiten",
    editDone: "Fertig",
    onMap: "Auf der Karte zeigen",
    wiz: {
      nav: "Einrichtung",
      open: "🧭 Einrichtung",
      stepOf: (n, total) => `Schritt ${n} von ${total}`,
      prev: "‹ Zurück",
      next: "Weiter ›",
      finish: "Einrichtung abschließen",
      later: "Später weitermachen",
      all: "Alle Schritte",
      labels: { welcome: "Willkommen", floors: "Etagen", rooms: "Räume den Etagen zuordnen", plan: "Grundriss (optional)", devices: "Geräte zuordnen", duplicates: "Doppelte aussortieren", check: "Kontrolle", done: "Fertig" },
      intro:
        "Dieser Assistent richtet das Haus einmal sauber ein – in fester Reihenfolge, damit jeder Schritt auf dem vorigen aufbaut. Du kannst jederzeit aufhören, er merkt sich, wo du warst. Nichts wird ohne deinen Klick geändert, alles lässt sich zurücknehmen.",
      plan: [
        "Etagen anlegen und benennen – nur die Etagen",
        "Räume den Etagen zuordnen – du siehst, welche Geräte in jedem Raum sind; die KI schlägt mit Begründung vor",
        "Grundriss (optional)",
        "Geräte ohne Raum zuordnen – mit Name, Modell, Entitäten und Begründung; Doppelte noch ausgenommen",
        "Doppelte aussortieren – Hauptentität wählen und ihr den Raum geben",
        "Kontrolle: Etage → Raum → Geräte",
      ],
      aiStart: "🤖 KI-Durchsicht im Hintergrund starten",
      aiStartInfo: "Dauert ein paar Minuten. Die Empfehlungen erscheinen dann in den passenden Schritten.",
      aiReady: (at) => `🤖 KI-Durchsicht vom ${at} – ihre Empfehlungen stehen in den Schritten.`,
      aiNo: "Ohne Sprachmodell gibt es nur die Vorschläge aus festen Regeln. Ein Modell lässt sich in den Optionen der Integration einstellen.",
      scanFirst: "Zuerst den Bestand prüfen (nur Regeln, dauert Sekunden)",
      floorsInfo:
        "Lege hier nur die Etagen an – Räume kommen im nächsten Schritt. Namen so, wie ihr sie nennt. Die Nummer ist die Höhe im Haus: 0 = Erdgeschoss, 1 = eine höher, -1 = Keller. Jede Etage bekommt ihre eigene Nummer. Darunter siehst du sofort die Reihenfolge.",
      floorRow: (n) => `${n} Räume`,
      orderTitle: "So steht das Haus – von oben nach unten:",
      levelClash: "Zwei Etagen haben dieselbe Nummer. Jede Etage braucht ihre eigene: höchste Nummer = ganz oben, 0 = Erdgeschoss.",
      roomsInfo:
        "Jeder Raum gehört zu einer Etage. Unter jedem Raum steht, welche Geräte schon drin sind – so erkennst du, welcher Raum wohin gehört. Etage auswählen = sofort gespeichert. KI-Vorschläge stehen mit Begründung daneben.",
      aiRooms: "🤖 KI ordnet die Räume zu",
      aiRoomsInfo: "Nutzt die Etagen von eben und die Gerätenamen in jedem Raum. Dauert etwa eine Minute.",
      aiRoomsRunning: "🤖 Die KI ordnet die Räume zu …",
      aiRoomsCount: (n) => `🤖 ${n} Vorschläge – stehen mit Begründung bei den Räumen`,
      aiMove: (floor) => `KI: auf „${floor}“`,
      noDevices: "noch keine Geräte",
      more: (n) => `+${n} weitere`,
      savedNow: "Änderungen werden sofort gespeichert. Zwei gleiche Räume (zwei Bäder)? Home Assistant erlaubt jeden Raumnamen nur einmal – nenne sie z. B. „Bad oben“ und „Bad unten“.",
      takeAll: (n) => `🤖 Alle ${n} Vorschläge übernehmen`,
      nameTaken: "Diesen Raumnamen gibt es schon. Home Assistant erlaubt jeden Namen nur einmal – z. B. „Bad oben“ und „Bad unten“.",
      planInfo: "Optional: je Etage ein Grundriss-Bild hochladen und von der KI erkennen lassen, oder Räume einzeichnen. Lässt sich auch später unter Karte machen.",
      devicesInfo:
        "Geräte ohne Raum – außer Doppelten, die kommen im nächsten Schritt. Raum auswählen = sofort gespeichert. Vorschläge stehen mit Begründung daneben; was nicht ins Haus gehört, einfach lassen.",
      aiDevices: "🤖 KI nach Räumen fragen",
      suggestedFor: (room, n) => `Vorschlag: ${room} (${n})`,
      noSuggestion: (n) => `Ohne Vorschlag (${n})`,
      byName: (word) => `aus dem Namen („${word}“)`,
      entities: (list) => `Entitäten: ${list}`,
      noneLeft: "Alle Geräte (außer Doppelten) haben einen Raum. 👍",
      withRoom: (n) => `${n} Geräte haben schon einen Raum – siehe Kontrolle.`,
      dupsInfo: "Dasselbe Gerät über zwei Systeme. Wähle, welche Entität der Assistent nutzt, und gib ihr den Raum. Die anderen werden ausgeblendet, laufen aber weiter.",
      dupRoom: "Raum für die Hauptentität",
      dupsNone: "Keine Doppelten mehr. 👍",
      checkInfo: "So steht das Haus jetzt da. Fehlt etwas oder steht falsch? Zurück zum passenden Schritt oder unter Räume/Geräte ändern.",
      empty: "leer",
      rest: (s) => `Noch offen unter Aufräumen: ${s.open} Vorschläge (Freigaben, Namen) · ${s.orphans} verwaiste Entitäten · ${s.silent} Geräte ohne Lebenszeichen`,
      doneInfo: "Das Haus ist sauber eingerichtet. Der Rest (Freigaben, Namen, Verwaistes) liegt unter Aufräumen.",
      summary: (s) => `${s.floors} Etagen · ${s.rooms} Räume (${s.loose} ohne Etage) · ${s.dups} Doppelte offen · ${s.unassigned} Geräte ohne Raum`,
    },
    aiReview: "🤖 KI-Durchsicht",
    aiAt: "KI-Durchsicht",
    aiTasks: { floors: "Etagen", duplicates: "Doppelte", orphans: "Verwaist", silent: "Ohne Lebenszeichen", switches: "Schalter" },
    aiRunning: (task, n, total) => `KI prüft: ${task} (${n}/${total})`,
    aiNone: "Noch keine KI-Durchsicht. „🤖 KI-Durchsicht“ fragt dein Sprachmodell zu allen Schritten – nacheinander, damit der Sprachassistent frei bleibt.",
    aiFloorsTitle: "🤖 KI-Vorschlag: Räume zu Etagen",
    applySelected: "Ausgewählte übernehmen",
    levelClash: "Achtung: Zwei Etagen hätten dieselbe Nummer. Bitte Nummern prüfen (0 = Erdgeschoss, höher = weiter oben) und dann anhaken.",
    aiSame: (name) => `KI: dasselbe – „${name}“ nutzen`,
    aiDifferent: "KI: verschieden",
    advice: { remove: "entfernen", keep: "behalten", check: "prüfen", disable: "deaktivieren", delete: "löschen" },
    aiAdvice: (a) => `KI: ${a}`,
    aiPick: "🤖 Nach KI auswählen",
    aiKind: (kind) => `KI: vermutlich ${kind}`,
    modeRooms: "🏠 Räume zeichnen",
    modeDevices: "💡 Geräte platzieren",
    hintRooms: "Rechteck aufziehen = neuer Raum (oder „+ Raum“). Räume verschieben, an der Ecke unten rechts vergrößern. Geräte sind in diesem Modus nur blass sichtbar.",
    hintDevices: "Geräte an ihren Platz ziehen – auch in einen anderen Raum oder aus der Ablage. Räume bleiben in diesem Modus fest.",
    groupsTitle: "Raumgruppen",
    groupsInfo: "Für offene Bereiche aus mehreren Räumen, z. B. Wohnbereich = Wohnzimmer + Esszimmer. Die Räume bleiben einzeln; die Gruppe ist ein Home-Assistant-Label an ihnen – nutzbar in Automationen, und der Sprachassistent erfährt es über die Hausbeschreibung.",
    groupNamePh: "Name, z. B. Wohnbereich",
    groupAdd: "+ Raumgruppe",
    groupDissolve: "Auflösen",
    groupRooms: "Gehört dazu (antippen zum Ändern):",
    convertBtn: "In Raumgruppe umwandeln …",
    convertTitle: (name) => `„${name}“ ist eigentlich mehrere Räume?`,
    convertInfo: (name) =>
      `Wähle die Räume, aus denen „${name}“ besteht. Jedes Gerät kommt in einen davon; danach wird „${name}“ als Raum gelöscht und wird zur Raumgruppe dieser Räume. Lässt sich zurücknehmen.`,
    convertPick: "Welche Räume gehören dazu?",
    convertWhere: "Wohin kommt was?",
    convertDo: "Umwandeln",
    convertDone: (name) => `„${name}“ ist jetzt eine Raumgruppe`,
    convertByName: "aus dem Namen",
    mergeBtn: "Zusammenführen …",
    mergeWith: (name) => `„${name}“ zusammenführen mit:`,
    mergeChoose: "– Raum wählen –",
    mergeInfo: (name) =>
      `Alle Geräte und Entitäten wandern in den gewählten Raum. „${name}“ bleibt dort als Alias, damit der Name weiter verstanden wird. Danach wird „${name}“ gelöscht – lässt sich zurücknehmen.`,
    mergeRefs: (name) => `⚠️ Diese Automationen/Skripte sprechen „${name}“ direkt an und zeigen danach ins Leere – bitte danach anpassen:`,
    mergeNoRefs: "Keine Automation und kein Skript spricht den Raum direkt an.",
    mergeDo: "Zusammenführen",
    mergedInto: (a, b) => `„${a}“ ist jetzt Teil von „${b}“`,
    reloadNew: (v) => `Neue Version ${v} – neu laden`,
    tapToggle: "Tippen schaltet",
    tapHint: "Tippen schaltet Licht und Schalter, langes Drücken öffnet die Bedienung.",
    sensorsTitle: "Werte",
    iconFor: (name) => `Symbol für „${name}“`,
    iconMdi: "HA-Icon, z. B. mdi:ceiling-light",
    iconSearch: "Icons suchen",
    iconUpload: "Bild hochladen",
    iconReset: "Standard",
    iconApply: "Übernehmen",
    sections: { clean: "Aufräumen", map: "Karte", rooms: "Räume", devices: "Geräte" },
    steps: { rooms: "Etagen", duplicates: "Doppelte", open: "Vorschläge", silent: "Ohne Lebenszeichen", orphans: "Verwaist", history: "Verlauf" },
    stepInfo: {
      rooms: "Jeder Raum sollte zu einer Etage gehören – sonst weiß der Assistent nicht, was „oben“ oder „unten“ ist.",
      duplicates: "Dasselbe Gerät über zwei Systeme (z. B. Loxone und Shelly, KNX, Zigbee, MQTT). Zusammenführen heißt: Der Assistent nutzt nur die gewählte Entität, die anderen werden ausgeblendet und nicht freigegeben. Sie laufen weiter – Automationen und die Systeme selbst bleiben unberührt. Lässt sich jederzeit trennen.",
      open: "Vorschläge für Raum, Name und Freigabe. Prüfen, bei Bedarf anpassen, übernehmen.",
      silent: "Diese Geräte melden gerade nichts. Nicht mehr gebraucht? Deaktivieren (rücknehmbar) oder löschen.",
    },
    allDone: "Hier ist alles erledigt.",
    noFloorRooms: (n) => `${n} Räume ohne Etage`,
    allRooms: "Alle Räume und Etagen",
    propFilter: { open: "Offen", safe: "Sicher", later: "Später", ignored: "Ignoriert" },
    kinds: {
      light: "Licht", shading: "Beschattung", window: "Fenster", door: "Tür/Tor", socket: "Steckdose", switch: "Schalter",
      heating: "Heizung/Klima", fan: "Lüftung", water: "Wasser", lock: "Schloss", media: "Medien", voice: "Sprachgerät",
      camera: "Kamera", vacuum: "Sauger", garden: "Garten", contact: "Kontakt", motion: "Bewegung", alarm: "Melder",
      temperature: "Temperatur", humidity: "Luftfeuchte", energy: "Strom", battery: "Batterie", sensor: "Messwert",
      scene: "Szene", script: "Skript", automation: "Automation", weather: "Wetter", list: "Liste", presence: "Anwesenheit",
      button: "Taster", setting: "Einstellung", update: "Update", other: "Sonstiges",
    },
    allKinds: "Alle Typen",
    allRoomsFilter: "Alle Räume",
    withoutRoom: "Ohne Raum",
    byRoom: "nach Raum",
    byIntegration: "nach System",
    changeRaum: (a, b) => `Raum: ${a} → ${b}`,
    needRoom: "Raum fehlt – bitte wählen",
    changeName: (a, b) => `Name: ${a} → ${b}`,
    needName: "Technischer Name – besser umbenennen",
    hideFor: (list) => `Für den Assistenten ausblenden: ${list}`,
    showFor: (list) => `Für den Assistenten freigeben: ${list}`,
    aliasesSet: (list) => `Aliase: ${list}`,
    speakerNoRoom: "Sprachgerät ohne Raum – der Assistent weiß nicht, wo gesprochen wird",
    adjust: "Anpassen",
    nothingChanges: "Keine Änderung nötig",
    dupTitle: (name) => `Vermutlich dasselbe: ${name}`,
    dupHistory: (n, of) => `schalten ${n} von ${of} Mal gleichzeitig (letzte 7 Tage)`,
    dupName: "gleiche Art, ähnlicher Name, gleicher Raum",
    dupStrong: "sicher erkannt",
    dupWeak: "nach Name",
    dupPick: "Diese nutzt der Assistent:",
    merge: "Zusammenführen",
    different: "Nicht dasselbe",
    merged: "Zusammengeführt",
    unmerge: "Trennen",
    noHistory: "Der Verlauf (Recorder) war nicht lesbar – Doppelte nur nach Namen erkannt.",
    floorLevelShort: "Nr.",
    roomsCount: (n) => `${n} Räume`,
    newRoomPh: "Neuer Raum",
    addRoom: "+ Raum",
    addFloor: "+ Etage",
    saved: "Gespeichert",
    onMapShort: "auf der Karte",
    twinsVia: (list) => `auch über: ${list}`,
    devices: "Geräte",
    devicesInfo:
      "Alle Geräte nach Integration, Geräte ohne Lebenszeichen zuerst. Deaktivieren blendet ein Gerät samt Entitäten aus und lässt sich zurücknehmen. Löschen entfernt es endgültig – nur wenn die Integration das erlaubt; ist es wieder erreichbar, kann sie es neu anlegen.",
    silent: "meldet nichts",
    disabledLbl: "deaktiviert",
    disable: "Deaktivieren",
    enable: "Aktivieren",
    del: "Löschen",
    noDelete: "Diese Integration erlaubt kein Löschen einzelner Geräte – deaktivieren oder in der Integration entfernen.",
    confirmDelete: (name) => `„${name}“ endgültig löschen? Das lässt sich nicht zurücknehmen.`,
    deleted: (name) => `„${name}“ gelöscht`,
    onlySilent: "nur Geräte ohne Lebenszeichen",
    orphans: "Verwaist",
    orphansInfo:
      "Diese Entitäten liefert ihre Integration gerade nicht. Oft heißt das nur: Gerät aus oder offline (Drucker, Tablet), Zubehör nicht angesteckt, oder die Integration legt sie erst an, wenn das Gerät meldet. Nur entfernen, was sicher weg ist: Entfernen lässt sich nicht zurücknehmen. Kommt das Gerät wieder, legt die Integration die Entität neu an – ohne eigene Namen und Räume.",
    deviceLive: "Gerät ist da, nur dieser Wert fehlt",
    deviceGone: "ganzes Gerät meldet nichts",
    integrationDown: "Integration läuft gerade nicht",
    all: "alle",
    removeSelected: "Ausgewählte entfernen",
    confirmOrphans: (n) => `${n} Entitäten endgültig aus der Registry entfernen? Das lässt sich nicht zurücknehmen.`,
    removed: (n) => `${n} entfernt`,
    tray: "Noch ohne Raum – auf einen Raum ziehen",
    trayHint: (n) => `${n} Geräte haben noch keinen Raum. Zum Einordnen „Grundriss bearbeiten“.`,
    hidden: "Ausgeblendet",
    hide: "Von der Karte nehmen",
    dropOnRoom: "Auf einen eingezeichneten Raum ziehen.",
    movedTo: (name, room) => `${name} → ${room}`,
    floorName: "Name der Etage",
    floorLevel: "Nummer (0 = Erdgeschoss)",
    noFloor: "Ohne Etage",
    level: "Etage",
    upload: "Grundriss hochladen",
    removeImage: "Bild entfernen",
    detect: "Mit KI erkennen",
    detecting: "Das Bildmodell liest den Grundriss … das kann eine Minute dauern.",
    detected: "Vom Bildmodell erkannte Räume – prüfen und übernehmen",
    newRoom: "neuer Raum",
    take: "übernehmen",
    acceptDetected: "Ausgewählte übernehmen",
    discard: "Verwerfen",
    gridSize: "Rasterhöhe",
    unplaced: "Noch nicht eingezeichnet",
    placeWhich: "Welcher Raum ist das?",
    place: "Einzeichnen",
    cancel: "Abbrechen",
    newRoomName: "oder neuer Raum",
    removeFromMap: "Aus der Karte nehmen",
    speakersNoArea: "Sprachgeräte ohne Raum – der Assistent weiß nicht, wo gesprochen wird",
    notes: "Notizen für den Assistenten",
    houseNote: "Allgemein (z. B. „Die Kaffeemaschine hängt an der Steckdose Küche 2“)",
    description: "Das bekommt der Assistent",
    descriptionHint: "In die Anweisungen des Gesprächsagenten (Einstellungen → Sprachassistenten → Agent) einfügen:",
    copy: "Kopieren",
    copied: "Kopiert",
    noFloors: "Noch keine Etagen. Lege sie hier oder unter Einstellungen → Bereiche an.",
    tooLarge: "Bild ist zu groß.",
    reasons: {
      category: "Diagnose- oder Konfigurations-Entität",
      hidden: "ausgeblendet",
      domain_never: "für Sprachassistenten ohne Nutzen",
      sensor_noise: "technischer Messwert",
      domain_control: "steuerbar, bisher nicht freigegeben",
      orphaned: "wird von keiner Integration mehr bereitgestellt",
      area_from_name: "Raum aus dem Namen: {area}",
      llm_area: "KI schlägt Raum vor: {area}",
      llm_name: "KI schlägt Namen vor",
      llm_irrelevant: "KI: für den Assistenten unwichtig",
      llm_aliases: "KI schlägt Aliase vor",
      llm_note: "KI: {text}",
      area_missing: "kein Raum zugeordnet",
      name_technical: "technischer Name",
      speaker: "Sprachgerät ohne Raum",
    },
  },
  en: {
    title: "Hauskarte",
    scan: "Scan",
    scanRules: "Rules only",
    applySafe: "Apply all safe",
    undo: "Undo last change",
    open: "Open",
    later: "Later",
    ignored: "Ignored",
    history: "History",
    search: "Search …",
    neverScanned: "Not scanned yet. Start with “Scan”.",
    lastScan: "Last scan",
    running: "Scanning …",
    phaseRules: "rules",
    phaseLlm: "language model",
    noLlm: "No language model configured – rules only (integration options).",
    empty: "Nothing here.",
    area: "Area",
    noArea: "– no area –",
    name: "Name",
    exposed: "for assistant",
    aliases: "Aliases, comma separated",
    remove: "remove",
    more: "more entities",
    accept: "Apply",
    notForAssistant: "Not for assistant",
    postpone: "Later",
    ignore: "Ignore",
    showAgain: "Show again",
    safe: "safe",
    ai: "AI proposal",
    showMore: "Show more",
    changes: "changes",
    confirmSafe: (n) => `Apply ${n} safe proposals without reviewing each?`,
    confirmRemove: "Entities will be removed from the registry for good. This cannot be undone. Continue?",
    undone: (r) => `Reverted ${r.reverted} changes to “${r.title}”` + (r.skipped ? `, ${r.skipped} not possible` : ""),
    nothingToUndo: "Nothing to undo.",
    applied: (n) => `${n} changes saved`,
    map: "Map",
    edit: "Edit floor plan",
    editDone: "Done",
    onMap: "Show on map",
    wiz: {
      nav: "Setup",
      open: "🧭 Setup",
      stepOf: (n, total) => `Step ${n} of ${total}`,
      prev: "‹ Back",
      next: "Next ›",
      finish: "Finish setup",
      later: "Continue later",
      all: "All steps",
      labels: { welcome: "Welcome", floors: "Floors", rooms: "Rooms to floors", plan: "Floor plan (optional)", devices: "Assign devices", duplicates: "Sort out duplicates", check: "Check", done: "Done" },
      intro:
        "This assistant sets up the home once, cleanly – in a fixed order, so every step builds on the previous one. You can stop any time; it remembers where you were. Nothing changes without your click, everything can be undone.",
      plan: [
        "Create and name floors – floors only",
        "Rooms to floors – you see which devices are in each room; the AI suggests with a reason",
        "Floor plan (optional)",
        "Devices without area – with name, model, entities and reason; duplicates left out for now",
        "Sort out duplicates – choose the main entity and give it its room",
        "Check: floor → room → devices",
      ],
      aiStart: "🤖 Start AI review in the background",
      aiStartInfo: "Takes a few minutes. Its recommendations then show up in the matching steps.",
      aiReady: (at) => `🤖 AI review from ${at} – its recommendations are in the steps.`,
      aiNo: "Without a language model there are only rule-based proposals. A model can be set in the integration options.",
      scanFirst: "Scan first (rules only, takes seconds)",
      floorsInfo:
        "Only floors here – rooms come next. Name them the way you call them. The number is the height in the house: 0 = ground floor, 1 = one up, -1 = basement. Every floor gets its own number. Below you see the order right away.",
      floorRow: (n) => `${n} rooms`,
      orderTitle: "This is the home – top to bottom:",
      levelClash: "Two floors share a number. Every floor needs its own: highest number = top, 0 = ground floor.",
      roomsInfo:
        "Every room belongs to a floor. Under each room you see which devices are already in it – so you can tell which room goes where. Choosing a floor saves right away. AI suggestions are shown with their reason.",
      aiRooms: "🤖 Let the AI assign the rooms",
      aiRoomsInfo: "Uses the floors from the last step and the device names in each room. Takes about a minute.",
      aiRoomsRunning: "🤖 The AI is assigning the rooms …",
      aiRoomsCount: (n) => `🤖 ${n} suggestions – shown with their reason at the rooms`,
      aiMove: (floor) => `AI: on “${floor}”`,
      noDevices: "no devices yet",
      more: (n) => `+${n} more`,
      savedNow: "Changes are saved right away. Two rooms of the same kind (two bathrooms)? Home Assistant allows every room name only once – call them e.g. “Upstairs bath” and “Downstairs bath”.",
      takeAll: (n) => `🤖 Apply all ${n} suggestions`,
      nameTaken: "This room name exists already. Home Assistant allows every name only once – e.g. “Upstairs bath” and “Downstairs bath”.",
      planInfo: "Optional: per floor upload a floor plan image and let the AI detect rooms, or draw them. Can also be done later under Map.",
      devicesInfo:
        "Devices without area – except duplicates, they come next. Choosing a room saves right away. Suggestions with reasons are shown next to it; leave what does not belong to the home.",
      aiDevices: "🤖 Ask the AI for rooms",
      suggestedFor: (room, n) => `Suggested: ${room} (${n})`,
      noSuggestion: (n) => `No suggestion (${n})`,
      byName: (word) => `from the name (“${word}”)`,
      entities: (list) => `Entities: ${list}`,
      noneLeft: "Every device (except duplicates) has a room. 👍",
      withRoom: (n) => `${n} devices already have a room – see Check.`,
      dupsInfo: "The same device through two systems. Choose which entity the assistant uses and give it its room. The others are hidden but keep running.",
      dupRoom: "Room for the main entity",
      dupsNone: "No duplicates left. 👍",
      checkInfo: "This is how the home looks now. Something missing or wrong? Go back to the matching step or change it under Rooms/Devices.",
      empty: "empty",
      rest: (s) => `Still open under Clean up: ${s.open} proposals (exposure, names) · ${s.orphans} orphaned entities · ${s.silent} silent devices`,
      doneInfo: "The home is set up cleanly. The rest (exposure, names, orphaned) is under Clean up.",
      summary: (s) => `${s.floors} floors · ${s.rooms} rooms (${s.loose} without floor) · ${s.dups} duplicates open · ${s.unassigned} devices without area`,
    },
    aiReview: "🤖 AI review",
    aiAt: "AI review",
    aiTasks: { floors: "floors", duplicates: "duplicates", orphans: "orphaned", silent: "silent", switches: "switches" },
    aiRunning: (task, n, total) => `AI checks: ${task} (${n}/${total})`,
    aiNone: "No AI review yet. “🤖 AI review” asks your language model about every step – one question at a time, so the voice assistant stays free.",
    aiFloorsTitle: "🤖 AI proposal: rooms to floors",
    applySelected: "Apply selected",
    levelClash: "Careful: two floors would get the same number. Please check the numbers (0 = ground floor, higher = further up), then tick.",
    aiSame: (name) => `AI: same – use “${name}”`,
    aiDifferent: "AI: different",
    advice: { remove: "remove", keep: "keep", check: "check", disable: "disable", delete: "delete" },
    aiAdvice: (a) => `AI: ${a}`,
    aiPick: "🤖 Select as AI says",
    aiKind: (kind) => `AI: probably ${kind}`,
    modeRooms: "🏠 Draw rooms",
    modeDevices: "💡 Place devices",
    hintRooms: "Drag a rectangle = new room (or “+ Room”). Move rooms, resize at the bottom right corner. Devices are only faded in this mode.",
    hintDevices: "Drag devices to their spot – also into another room or from the tray. Rooms stay fixed in this mode.",
    groupsTitle: "Room groups",
    groupsInfo: "For open spaces made of several rooms, e.g. living area = living room + dining room. The rooms stay separate; the group is a Home Assistant label on them – usable in automations, and the voice assistant learns it from the house description.",
    groupNamePh: "Name, e.g. Living area",
    groupAdd: "+ Room group",
    groupDissolve: "Dissolve",
    groupRooms: "Members (tap to change):",
    convertBtn: "Turn into room group …",
    convertTitle: (name) => `Is “${name}” really several rooms?`,
    convertInfo: (name) =>
      `Choose the rooms “${name}” consists of. Every device goes into one of them; then “${name}” is deleted as a room and becomes the room group of these rooms. Can be undone.`,
    convertPick: "Which rooms belong to it?",
    convertWhere: "What goes where?",
    convertDo: "Convert",
    convertDone: (name) => `“${name}” is now a room group`,
    convertByName: "from the name",
    mergeBtn: "Merge …",
    mergeWith: (name) => `Merge “${name}” into:`,
    mergeChoose: "– choose room –",
    mergeInfo: (name) =>
      `All devices and entities move to the chosen room. “${name}” stays there as an alias so the name is still understood. Then “${name}” is deleted – can be undone.`,
    mergeRefs: (name) => `⚠️ These automations/scripts use “${name}” directly and will point nowhere – please adjust them afterwards:`,
    mergeNoRefs: "No automation or script uses the room directly.",
    mergeDo: "Merge",
    mergedInto: (a, b) => `“${a}” is now part of “${b}”`,
    reloadNew: (v) => `New version ${v} – reload`,
    tapToggle: "Tap switches",
    tapHint: "Tap switches lights and switches, a long press opens the controls.",
    sensorsTitle: "Readings",
    iconFor: (name) => `Symbol for “${name}”`,
    iconMdi: "HA icon, e.g. mdi:ceiling-light",
    iconSearch: "Find icons",
    iconUpload: "Upload picture",
    iconReset: "Default",
    iconApply: "Apply",
    sections: { clean: "Clean up", map: "Map", rooms: "Rooms", devices: "Devices" },
    steps: { rooms: "Floors", duplicates: "Duplicates", open: "Proposals", silent: "Silent", orphans: "Orphaned", history: "History" },
    stepInfo: {
      rooms: "Every room should belong to a floor – otherwise the assistant cannot tell what “upstairs” means.",
      duplicates: "The same device through two systems (e.g. Loxone and Shelly, KNX, Zigbee, MQTT). Merging means: the assistant only uses the chosen entity; the others are hidden and not exposed. They keep running – automations and the systems themselves stay untouched. Can be split again any time.",
      open: "Proposals for area, name and exposure. Review, adjust if needed, apply.",
      silent: "These devices report nothing right now. Not needed any more? Disable (undoable) or delete.",
    },
    allDone: "All done here.",
    noFloorRooms: (n) => `${n} rooms without floor`,
    allRooms: "All rooms and floors",
    propFilter: { open: "Open", safe: "Safe", later: "Later", ignored: "Ignored" },
    kinds: {
      light: "Light", shading: "Shading", window: "Window", door: "Door/gate", socket: "Socket", switch: "Switch",
      heating: "Heating/climate", fan: "Ventilation", water: "Water", lock: "Lock", media: "Media", voice: "Voice device",
      camera: "Camera", vacuum: "Vacuum", garden: "Garden", contact: "Contact", motion: "Motion", alarm: "Detector",
      temperature: "Temperature", humidity: "Humidity", energy: "Power", battery: "Battery", sensor: "Reading",
      scene: "Scene", script: "Script", automation: "Automation", weather: "Weather", list: "List", presence: "Presence",
      button: "Button", setting: "Setting", update: "Update", other: "Other",
    },
    allKinds: "All kinds",
    allRoomsFilter: "All rooms",
    withoutRoom: "No room",
    byRoom: "by room",
    byIntegration: "by system",
    changeRaum: (a, b) => `Area: ${a} → ${b}`,
    needRoom: "Area missing – please choose",
    changeName: (a, b) => `Name: ${a} → ${b}`,
    needName: "Technical name – better rename",
    hideFor: (list) => `Hide from the assistant: ${list}`,
    showFor: (list) => `Expose to the assistant: ${list}`,
    aliasesSet: (list) => `Aliases: ${list}`,
    speakerNoRoom: "Voice device without area – the assistant cannot tell where someone speaks",
    adjust: "Adjust",
    nothingChanges: "No change needed",
    dupTitle: (name) => `Probably the same: ${name}`,
    dupHistory: (n, of) => `switch together ${n} of ${of} times (last 7 days)`,
    dupName: "same kind, similar name, same room",
    dupStrong: "clearly detected",
    dupWeak: "by name",
    dupPick: "The assistant uses:",
    merge: "Merge",
    different: "Not the same",
    merged: "Merged",
    unmerge: "Split",
    noHistory: "The history (recorder) was not readable – duplicates found by name only.",
    floorLevelShort: "No.",
    roomsCount: (n) => `${n} rooms`,
    newRoomPh: "New room",
    addRoom: "+ Room",
    addFloor: "+ Floor",
    saved: "Saved",
    onMapShort: "on the map",
    twinsVia: (list) => `also via: ${list}`,
    devices: "Devices",
    devicesInfo:
      "All devices by integration, silent ones first. Disabling hides a device with its entities and can be undone. Deleting removes it for good – only where the integration allows it; if it is reachable again, the integration may create it again.",
    silent: "reports nothing",
    disabledLbl: "disabled",
    disable: "Disable",
    enable: "Enable",
    del: "Delete",
    noDelete: "This integration does not allow deleting single devices – disable it or remove it in the integration.",
    confirmDelete: (name) => `Delete “${name}” for good? This cannot be undone.`,
    deleted: (name) => `“${name}” deleted`,
    onlySilent: "silent devices only",
    orphans: "Orphaned",
    orphansInfo:
      "Their integration does not provide these entities right now. Often that only means: device off or offline (printer, tablet), accessory unplugged, or the integration creates them only while the device reports. Only remove what is surely gone: removal cannot be undone. If the device comes back, the integration creates the entity again – without your names and areas.",
    deviceLive: "device is there, only this value is missing",
    deviceGone: "the whole device reports nothing",
    integrationDown: "integration is not running",
    all: "all",
    removeSelected: "Remove selected",
    confirmOrphans: (n) => `Remove ${n} entities from the registry for good? This cannot be undone.`,
    removed: (n) => `${n} removed`,
    tray: "No area yet – drag onto a room",
    trayHint: (n) => `${n} devices have no area yet. Use “Edit floor plan” to place them.`,
    hidden: "Hidden",
    hide: "Remove from map",
    dropOnRoom: "Drop onto a drawn room.",
    movedTo: (name, room) => `${name} → ${room}`,
    floorName: "Floor name",
    floorLevel: "Level (0 = ground floor)",
    noFloor: "No floor",
    level: "Level",
    upload: "Upload floor plan",
    removeImage: "Remove image",
    detect: "Detect with AI",
    detecting: "The vision model is reading the floor plan … this can take a minute.",
    detected: "Rooms detected by the vision model – review and apply",
    newRoom: "new room",
    take: "apply",
    acceptDetected: "Apply selected",
    discard: "Discard",
    gridSize: "Grid height",
    unplaced: "Not drawn yet",
    placeWhich: "Which room is this?",
    place: "Draw",
    cancel: "Cancel",
    newRoomName: "or new room",
    removeFromMap: "Remove from map",
    speakersNoArea: "Voice devices without area – the assistant cannot tell where someone speaks",
    notes: "Notes for the assistant",
    houseNote: "General (e.g. “The coffee machine is plugged into kitchen socket 2”)",
    description: "What the assistant gets",
    descriptionHint: "Paste into the conversation agent's instructions (Settings → Voice assistants → agent):",
    copy: "Copy",
    copied: "Copied",
    noFloors: "No floors yet. Add them here or under Settings → Areas.",
    tooLarge: "Image is too large.",
    reasons: {
      category: "diagnostic or config entity",
      hidden: "hidden",
      domain_never: "no use for a voice assistant",
      sensor_noise: "technical reading",
      domain_control: "controllable, not exposed yet",
      orphaned: "no longer provided by any integration",
      area_from_name: "area from name: {area}",
      llm_area: "AI suggests area: {area}",
      llm_name: "AI suggests a name",
      llm_irrelevant: "AI: not relevant for the assistant",
      llm_aliases: "AI suggests aliases",
      llm_note: "AI: {text}",
      area_missing: "no area",
      name_technical: "technical name",
      speaker: "voice device without area",
    },
  },
};

const PAGE = 40;
// Set by the release script together with manifest.json; compared with the server to spot a stale page.
const PANEL_VERSION = "0.11.1";

const KIND_ICON = {
  light: "💡", shading: "⛱️", window: "🪟", door: "🚪", socket: "🔌", switch: "🔘", heating: "🌡️", fan: "🌀",
  water: "💧", lock: "🔒", media: "🔊", voice: "🎙️", camera: "📷", vacuum: "🧹", garden: "🌱", contact: "🚪",
  motion: "🏃", alarm: "🚨", temperature: "🌡️", humidity: "💧", energy: "⚡", battery: "🔋", sensor: "📈",
  scene: "🎬", script: "📜", automation: "⚙️", weather: "⛅", list: "📝", presence: "👤", button: "🔘",
  setting: "🎚️", update: "⬆️", other: "▫️",
};
const kindIcon = (kind) => KIND_ICON[kind] || "▫️";

// Tapping a symbol switches these directly; everything else opens Home Assistant's own controls.
const TOGGLE_DOMAINS = new Set(["light", "switch", "fan", "input_boolean", "siren", "humidifier"]);
const ACTIVE_STATES = new Set(["on", "open", "opening", "closing", "playing", "heat", "cool", "heat_cool", "auto", "dry", "fan_only", "unlocked", "unlocking"]);

const SECTION_ICON = { start: "🧭", clean: "🧹", map: "🗺️", rooms: "🏠", devices: "📦" };
const STEPS = ["rooms", "duplicates", "open", "silent", "orphans", "history"];

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

class HauskartePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._data = null;
    this._tab = "map";
    this._editMode = "rooms";
    this._section = null;
    this._step = null;
    this._propFilter = "open";
    this._devGroup = "room";
    this._devKind = "";
    this._devRoom = "";
    this._edit = false;
    this._images = {};
    this._pending = null;
    this._detecting = null;
    this._search = "";
    this._onlySafe = false;
    this._shown = PAGE;
    this._busy = false;
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) {
      this._t = TEXT[(hass.language || "en").startsWith("de") ? "de" : "en"];
      try {
        this._tap = localStorage.getItem("hauskarte.tapToggle") !== "0";
      } catch (err) {
        this._tap = true;
      }
      this._skeleton();
      this._load();
    } else if (!this._liveQueued) {
      // states change all the time: only touch the few live spots, never rebuild
      this._liveQueued = true;
      requestAnimationFrame(() => {
        this._liveQueued = false;
        this._live();
      });
    }
  }

  _fmt(entityId) {
    const st = this._hass?.states?.[entityId];
    if (!st) return "–";
    if (typeof this._hass.formatEntityState === "function") return this._hass.formatEntityState(st);
    const unit = st.attributes?.unit_of_measurement;
    return unit ? `${st.state} ${unit}` : st.state;
  }

  _isActive(entityId) {
    const st = this._hass?.states?.[entityId];
    if (!st) return false;
    if (entityId.startsWith("climate.")) return st.state !== "off";
    return ACTIVE_STATES.has(st.state);
  }

  // Values and on/off of the symbols, refreshed in place.
  _live() {
    const root = this.shadowRoot;
    if (!root || !this._hass) return;
    root.querySelectorAll("[data-state-entity]").forEach((el) => {
      const text = this._fmt(el.dataset.stateEntity);
      if (el.textContent !== text) el.textContent = text;
    });
    const stateIcon = customElements.get("ha-state-icon");
    root.querySelectorAll(".pin[data-entity]").forEach((pin) => {
      const id = pin.dataset.entity;
      if (!id) return;
      pin.classList.toggle("on", this._isActive(id));
      const st = this._hass.states[id];
      const ico = pin.querySelector(".ico[data-hydrate]");
      if (!ico || !st || !stateIcon) return;
      let el = ico.querySelector("ha-state-icon");
      if (!el) {
        el = document.createElement("ha-state-icon");
        ico.replaceChildren(el, ...ico.querySelectorAll(".twin"));
      }
      el.hass = this._hass;
      el.stateObj = st;
    });
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId } }));
  }

  set narrow(narrow) {
    this._narrow = narrow;
    const btn = this.shadowRoot.querySelector("#menu");
    if (btn) btn.hidden = !narrow;
  }

  disconnectedCallback() {
    clearTimeout(this._poll);
  }

  async _ws(type, extra = {}) {
    return this._hass.callWS({ type: `hauskarte/${type}`, ...extra });
  }

  async _load() {
    try {
      this._data = await this._ws("state");
    } catch (err) {
      this._toast(err.message || String(err));
      return;
    }
    // while something runs the page polls; do not rebuild it under the user's fingers
    const focused = this.shadowRoot.activeElement;
    const typing = focused && ["INPUT", "SELECT", "TEXTAREA"].includes(focused.tagName);
    if (!(typing && this._data.progress.running)) this._render();
    clearTimeout(this._poll);
    if (this._data.progress.running) this._poll = setTimeout(() => this._load(), 1500);
  }

  _toast(message) {
    const el = this.shadowRoot.querySelector("#toast");
    el.textContent = message;
    el.hidden = false;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => (el.hidden = true), 5000);
  }

  _skeleton() {
    const t = this._t;
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <header>
        <button id="menu" class="icon" title="Menu" ${this._narrow ? "" : "hidden"}>☰</button>
        <h1>${esc(t.title)}</h1>
        <span class="grow"></span>
        <span id="ver" class="hver"></span>
      </header>
      <nav id="sections" class="sections"></nav>
      <main>
        <div id="status"></div>
        <nav id="tabs"></nav>
        <div id="tools"></div>
        <div id="list"></div>
      </main>
      <div id="toast" hidden></div>`;
    this.shadowRoot.addEventListener("click", (ev) => this._click(ev));
    this.shadowRoot.addEventListener("input", (ev) => {
      if (ev.target.id === "search") {
        this._search = ev.target.value.toLowerCase();
        this._shown = PAGE;
        this._renderList();
      }
    });
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" && ev.target.id === "pending-name" && ev.target.value.trim()) {
        this.shadowRoot.querySelector('[data-act="map-place-pending"]')?.click();
      }
    });
    this.shadowRoot.addEventListener("pointerdown", (ev) => this._pointerDown(ev));
    this.shadowRoot.addEventListener("pointermove", (ev) => this._pointerMove(ev));
    this.shadowRoot.addEventListener("pointerup", (ev) => this._pointerUp(ev));
    this.shadowRoot.addEventListener("change", (ev) => {
      if (ev.target.dataset.iconfile !== undefined) {
        this._uploadIcon(ev.target);
        return;
      }
      if (ev.target.id === "tap-toggle") {
        this._tap = ev.target.checked;
        try {
          localStorage.setItem("hauskarte.tapToggle", this._tap ? "1" : "0");
        } catch (err) {
          /* private mode: keep it for this visit */
        }
        return;
      }
      if (ev.target.dataset.upload !== undefined) {
        this._upload(ev.target);
        return;
      }
      if (ev.target.dataset.orphanGroup !== undefined) {
        ev.target.closest("details").querySelectorAll("[data-orphan]").forEach((c) => (c.checked = ev.target.checked));
        return;
      }
      if (ev.target.dataset.note !== undefined) {
        this._ws("note", { key: ev.target.dataset.note, text: ev.target.value }).then(
          () => this._load(),
          (err) => this._toast(err.message || String(err)),
        );
        return;
      }
      const tg = ev.target;
      this._savedKey = this._fieldKey(tg);
      if (tg.id === "pending-area" && tg.value) {
        this.shadowRoot.querySelector('[data-act="map-place-pending"]')?.click();
        return;
      }
      if (tg.dataset.groupName !== undefined) return this._save("group_update", { label_id: tg.dataset.groupName, name: tg.value });
      if (tg.dataset.floorName !== undefined) return this._save("floor_update", { floor_id: tg.dataset.floorName, name: tg.value });
      if (tg.dataset.floorLevel !== undefined)
        return this._save("floor_update", { floor_id: tg.dataset.floorLevel, level: tg.value === "" ? null : Number(tg.value) });
      if (tg.dataset.areaName !== undefined) return this._save("area_update", { area_id: tg.dataset.areaName, name: tg.value });
      if (tg.dataset.areaFloor !== undefined)
        return this._save("area_update", { area_id: tg.dataset.areaFloor, floor_id: tg.value || null });
      if (tg.dataset.devArea !== undefined) return this._save("device_area", { device_id: tg.dataset.devArea, area_id: tg.value || null });
      if (tg.id === "dev-kind" || tg.id === "dev-room") {
        if (tg.id === "dev-kind") this._devKind = tg.value;
        else this._devRoom = tg.value;
        this._renderList();
        return;
      }
      if (ev.target.id === "only-silent") {
        this._onlySilent = ev.target.checked;
        this._renderList();
        return;
      }
      if (ev.target.id === "only-safe") {
        this._onlySafe = ev.target.checked;
        this._shown = PAGE;
        this._renderList();
      }
    });
  }

  _areaName(id) {
    return this._data.areas.find((a) => a.area_id === id)?.name ?? id;
  }

  _reason(r) {
    const tpl = this._t.reasons[r.code] || r.code;
    return tpl.replace("{area}", this._areaName(r.area)).replace("{text}", r.text ?? "");
  }

  _filtered() {
    const d = this._data;
    const f = this._propFilter;
    let items = d.proposals.filter((p) => (f === "later" ? p.status === "later" : p.status === "open"));
    if (f === "safe") items = items.filter((p) => p.safe);
    if (this._search) {
      const s = this._search;
      items = items.filter((p) =>
        [p.title, p.manufacturer, p.model, p.integration, this._areaName(p.proposed.area_id), ...p.entities.map((e) => e.entity_id)]
          .join(" ")
          .toLowerCase()
          .includes(s),
      );
    }
    return items;
  }

  async _save(type, payload) {
    try {
      await this._ws(type, payload);
      this._toast(this._t.saved);
    } catch (err) {
      const msg = err.message || String(err);
      this._toast(/already in use/i.test(msg) ? this._t.wiz.nameTaken : msg);
    }
    await this._load();
  }

  _counts() {
    const d = this._data;
    const c = {
      rooms: d.map.rooms.filter((r) => !r.floor_id).length,
      duplicates: d.duplicates.length,
      open: d.proposals.filter((p) => p.status === "open").length,
      silent: d.devices.reduce((n, g) => n + g.silent, 0),
      orphans: d.orphans.reduce((n, g) => n + g.entities.length, 0),
      history: 0,
    };
    c.total = c.rooms + c.duplicates + c.open;
    return c;
  }

  _view() {
    if (this._section === "clean") {
      if (!this._step) {
        const c = this._counts();
        this._step = STEPS.find((s) => s !== "history" && c[s]) || "open";
      }
      return this._step;
    }
    if (this._section === "start") return "wizard";
    return this._section;
  }

  _fieldKey(el) {
    const parts = [el.tagName, el.id, el.name, el.type === "radio" ? el.value : ""];
    for (const a of el.attributes) if (a.name.startsWith("data-")) parts.push(`${a.name}=${a.value}`);
    return parts.join("|");
  }

  // A rebuild must not take away what the user is doing: unsaved input, focus, caret and scroll survive it.
  _render() {
    const root = this.shadowRoot;
    const fields = () => root.querySelectorAll("input:not([type=file]), select, textarea");
    const kept = new Map();
    fields().forEach((el) => {
      const toggle = el.type === "checkbox" || el.type === "radio";
      const dirty =
        el.tagName === "SELECT"
          ? [...el.options].some((o) => o.selected !== o.defaultSelected)
          : toggle
            ? el.checked !== el.defaultChecked
            : el.value !== el.defaultValue;
      if (dirty) kept.set(this._fieldKey(el), toggle ? { checked: el.checked } : { value: el.value });
    });
    const active = root.activeElement;
    const focusKey = active?.matches?.("input, select, textarea") ? this._fieldKey(active) : null;
    const caret = focusKey && typeof active.selectionStart === "number" ? [active.selectionStart, active.selectionEnd] : null;
    const scroll = window.scrollY;
    this._renderAll();
    fields().forEach((el) => {
      const key = this._fieldKey(el);
      const k = key !== this._savedKey ? kept.get(key) : null; // the field just saved shows what was stored
      if (k) "checked" in k ? (el.checked = k.checked) : (el.value = k.value);
      if (key === focusKey) {
        el.focus({ preventScroll: true });
        try {
          if (caret && el.setSelectionRange) el.setSelectionRange(...caret);
        } catch (err) {
          /* not every input type has a caret */
        }
      }
    });
    this._savedKey = null;
    window.scrollTo({ top: scroll });
    this._live();
  }

  _renderAll() {
    const t = this._t;
    const d = this._data;
    const p = d.progress;
    const c = this._counts();
    const wz = d.wizard || {};
    if (!this._section) this._section = !wz.finished && !wz.dismissed ? "start" : c.total ? "clean" : "map";
    this._tab = this._view();
    const stale = d.version !== PANEL_VERSION;
    const ver = this.shadowRoot.querySelector("#ver");
    ver.innerHTML = stale
      ? `<button data-act="reload" class="reloadbtn">${esc(t.reloadNew(d.version))}</button>`
      : esc(d.version);

    this.shadowRoot.querySelector("#sections").innerHTML = [...(wz.finished ? [] : ["start"]), "clean", "map", "rooms", "devices"]
      .map((sec) => {
        const badge = sec === "clean" ? c.total : sec === "rooms" ? c.rooms : 0;
        return `<button data-section="${sec}" class="${this._section === sec ? "active" : ""}">
          <span class="sicon">${SECTION_ICON[sec]}</span><span class="slabel">${esc(sec === "start" ? t.wiz.nav : t.sections[sec])}</span>
          ${badge ? `<span class="sbadge">${badge}</span>` : ""}</button>`;
      })
      .join("");

    let status = "";
    if (this._section === "clean") {
      let line;
      if (p.running) {
        const phase = p.phase === "llm" ? `${t.phaseLlm} ${p.done}/${p.total}` : p.phase === "duplicates" ? t.steps.duplicates : t.phaseRules;
        line =
          p.phase === "ai"
            ? `<span class="running">${esc(t.aiRunning(t.aiTasks[p.task] || "…", p.done + 1, p.total))}</span>`
            : `<span class="running">${esc(t.running)} ${esc(phase)}</span>`;
      } else if (!d.last_scan) {
        line = esc(t.neverScanned);
      } else {
        line = `${esc(t.lastScan)}: ${esc(new Date(d.last_scan).toLocaleString(this._hass.language))}`;
      }
      const aiLine = d.ai?.at ? `<br>${esc(t.aiAt)}: ${esc(new Date(d.ai.at).toLocaleString(this._hass.language))}` : "";
      status = `<div class="card scan"><div class="muted grow">${line}${d.llm ? aiLine : `<br>${esc(t.noLlm)}`}</div>
        <button data-act="scan" ${p.running ? "disabled" : ""}>${esc(t.scan)}</button>
        ${d.llm ? `<button data-act="ai-review" class="secondary ai" ${p.running ? "disabled" : ""}>${esc(t.aiReview)}</button>` : ""}
        <button data-act="scan-rules" class="secondary" ${p.running ? "disabled" : ""}>${esc(t.scanRules)}</button>
        <button data-section-go="start" class="flat">${esc(t.wiz.open)}</button></div>`;
      if (d.llm && !d.ai?.at && !p.running) status += `<div class="muted ainote">${esc(t.aiNone)}</div>`;
      if (p.error) status += `<div class="info error">${esc(p.error)}</div>`;
    }
    this.shadowRoot.querySelector("#status").innerHTML = status;

    this.shadowRoot.querySelector("#tabs").innerHTML =
      this._section === "clean"
        ? `<div class="steps">${STEPS.map(
            (st, i) => `<button data-step="${st}" class="step ${this._step === st ? "active" : ""}">
              <span class="num">${i + 1}</span>${esc(t.steps[st])}${c[st] ? `<span class="count">${c[st]}</span>` : st === "history" ? "" : `<span class="ok">✓</span>`}
            </button>`,
          ).join("")}</div>`
        : "";

    this.shadowRoot.querySelector(".step.active")?.scrollIntoView({ block: "nearest", inline: "center" });
    const tools = this.shadowRoot.querySelector("#tools");
    const view = this._tab;
    if (view === "open") {
      const pc = {
        open: c.open,
        safe: d.proposals.filter((x) => x.safe && x.status === "open").length,
        later: d.proposals.filter((x) => x.status === "later").length,
        ignored: d.ignored.length,
      };
      tools.innerHTML = `<div class="chips">${Object.keys(pc)
        .map((f) => `<button data-pfilter="${f}" class="chip ${this._propFilter === f ? "active" : ""}">${esc(t.propFilter[f])} ${pc[f]}</button>`)
        .join("")}</div>
        <input id="search" type="search" placeholder="${esc(t.search)}">
        <span class="grow"></span>
        <button data-act="apply-safe" class="secondary" ${!pc.safe || p.running ? "disabled" : ""}>${esc(t.applySafe)} (${pc.safe})</button>`;
      tools.querySelector("#search").value = this._search;
    } else if (view === "devices" || view === "silent") {
      const kindsPresent = [...new Set(d.devices.flatMap((g) => g.devices.map((x) => x.kind)))].sort((a, b) =>
        (t.kinds[a] || a).localeCompare(t.kinds[b] || b),
      );
      tools.innerHTML = `<input id="search" type="search" placeholder="${esc(t.search)}">
        <select id="dev-kind"><option value="">${esc(t.allKinds)}</option>${kindsPresent
          .map((k) => `<option value="${k}" ${this._devKind === k ? "selected" : ""}>${kindIcon(k)} ${esc(t.kinds[k] || k)}</option>`)
          .join("")}</select>
        <select id="dev-room"><option value="">${esc(t.allRoomsFilter)}</option><option value="-" ${this._devRoom === "-" ? "selected" : ""}>${esc(t.withoutRoom)}</option>
          ${d.areas.map((a) => `<option value="${esc(a.area_id)}" ${this._devRoom === a.area_id ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select>
        <div class="chips"><button data-devgroup="room" class="chip ${this._devGroup === "room" ? "active" : ""}">${esc(t.byRoom)}</button>
          <button data-devgroup="integration" class="chip ${this._devGroup === "integration" ? "active" : ""}">${esc(t.byIntegration)}</button></div>
        ${view === "devices" ? `<label class="check"><input id="only-silent" type="checkbox" ${this._onlySilent ? "checked" : ""}> ${esc(t.onlySilent)}</label>` : ""}`;
      tools.querySelector("#search").value = this._search;
    } else if (view === "orphans") {
      tools.innerHTML = `${d.orphans.some((g) => g.ai) ? `<button data-act="ai-orphans-pick" class="secondary ai">${esc(t.aiPick)}</button>` : ""}
        <span class="grow"></span><button data-act="remove-orphans" class="secondary danger">${esc(t.removeSelected)}</button>`;
    } else if (view === "history") {
      tools.innerHTML = `<span class="grow"></span><button data-act="undo" class="secondary">${esc(t.undo)}</button>`;
    } else {
      tools.innerHTML = "";
    }
    this._renderList();
  }

  _renderList() {
    const t = this._t;
    const d = this._data;
    const list = this.shadowRoot.querySelector("#list");
    const info = t.stepInfo[this._tab] ? `<div class="info">${esc(t.stepInfo[this._tab])}</div>` : "";
    if (this._tab === "map") {
      this._renderMap(list);
      return;
    }
    if (this._tab === "wizard") {
      this._renderWizard(list);
      return;
    }
    if (this._tab === "rooms") {
      list.innerHTML = (this._section === "clean" ? info : "") + this._roomsHtml(this._section === "clean");
      return;
    }
    if (this._tab === "duplicates") {
      list.innerHTML = info + this._duplicatesHtml();
      return;
    }
    if (this._tab === "devices" || this._tab === "silent") {
      list.innerHTML = (this._tab === "silent" ? info : "") + this._devicesHtml(this._tab === "silent");
      return;
    }
    if (this._tab === "orphans") {
      list.innerHTML =
        `<div class="info">${esc(t.orphansInfo)}</div>` +
        (d.orphans.length
          ? d.orphans
              .map(
                (g) => `<details class="card" data-group data-ai-advice="${g.ai?.advice || ""}">
            <summary><b>${esc(g.integration)}</b> · ${g.entities.length}${g.running ? "" : ` · <span class="danger">${esc(t.integrationDown)}</span>`}
              ${g.ai ? `<span class="aibadge ${g.ai.advice}">🤖 ${esc(t.advice[g.ai.advice])}</span>` : ""}</summary>
            ${g.ai ? `<div class="ailine ${g.ai.advice === "remove" ? "yes" : g.ai.advice === "keep" ? "no" : ""}">🤖 ${esc(t.aiAdvice(t.advice[g.ai.advice]))} · ${esc(g.ai.reason)}</div>` : ""}
            <label class="check"><input type="checkbox" data-orphan-group> ${esc(t.all)}</label>
            ${g.entities
              .map(
                (e) => `<label class="orphan"><input type="checkbox" data-orphan="${esc(e.entity_id)}">
                  <span class="ename"><b>${esc(e.title)}</b><span class="muted">${esc(e.entity_id)}${e.device ? ` · ${esc(e.device)}` : ""}</span>
                  ${e.device ? `<span class="reason">${esc(e.device_live ? t.deviceLive : t.deviceGone)}</span>` : ""}</span></label>`,
              )
              .join("")}
          </details>`,
              )
              .join("")
          : `<p class="muted">${esc(t.empty)}</p>`);
      return;
    }
    if (this._tab === "open" && this._propFilter === "ignored") {
      list.innerHTML = d.ignored.length
        ? d.ignored
            .map(
              (i) => `<div class="card row" data-id="${esc(i.id)}"><b>${esc(i.title)}</b><span class="grow"></span>
                <button data-act="show-again" class="secondary">${esc(t.showAgain)}</button></div>`,
            )
            .join("")
        : `<p class="muted">${esc(t.empty)}</p>`;
      return;
    }
    if (this._tab === "history") {
      list.innerHTML = d.history.length
        ? d.history
            .map(
              (h) => `<div class="card row"><b>${esc(h.title)}</b><span class="muted">${h.changes} ${esc(t.changes)}</span>
                <span class="grow"></span><span class="muted">${esc(new Date(h.at).toLocaleString(this._hass.language))}</span></div>`,
            )
            .join("")
        : `<p class="muted">${esc(t.empty)}</p>`;
      return;
    }
    const items = this._filtered();
    list.innerHTML = info + (items.length
      ? items.slice(0, this._shown).map((p) => this._card(p)).join("") +
        (items.length > this._shown ? `<button data-act="more" class="secondary wide">${esc(t.showMore)} (${items.length - this._shown})</button>` : "")
      : `<p class="muted">${esc(t.allDone)}</p>`);
  }


  // ---- rooms, duplicates, devices ------------------------------------------

  _countsHtml(counts) {
    const t = this._t;
    return Object.entries(counts || {})
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `<span class="cnt" title="${esc(t.kinds[k] || k)}">${kindIcon(k)}${n}</span>`)
      .join("");
  }

  _floorSelect(attr, id, selected) {
    const t = this._t;
    const floors = this._data.map.floors.filter((f) => f.floor_id);
    return `<select ${attr}="${esc(id)}"><option value="">– ${esc(t.noFloor)} –</option>${floors
      .map((f) => `<option value="${esc(f.floor_id)}" ${f.floor_id === selected ? "selected" : ""}>${esc(f.name)}</option>`)
      .join("")}</select>`;
  }

  _aiFloorsHtml(floorsOnly = false) {
    const t = this._t;
    const ai = { ...(this._data.ai || {}) };
    ai.floors = []; // floors are few and the user's call; the AI helps with rooms only
    if (floorsOnly) ai.rooms = [];
    if (!(ai.floors?.length || ai.rooms?.length)) return "";
    const floors = this._data.map.floors.filter((f) => f.floor_id);
    const floorName = (id) => floors.find((f) => f.floor_id === id)?.name || id;
    // two floors with the same number would break "upstairs/downstairs": then nothing is pre-ticked
    const levels = floors.map((f) => ai.floors.find((x) => x.floor_id === f.floor_id)?.level ?? f.level);
    const clash = levels.filter((l) => l != null).length !== new Set(levels.filter((l) => l != null)).size;
    const floorRows = (ai.floors || [])
      .map(
        (f) => `<div class="airow" data-ai-floor="${esc(f.floor_id)}">
          <input type="checkbox" data-ai-take ${f.confidence >= 0.5 && !clash ? "checked" : ""}>
          <div class="ename"><b>${esc(f.old_name)} →</b>
            <div class="row"><input data-ai-name value="${esc(f.name)}">
              <label class="muted">${esc(t.floorLevelShort)} <input type="number" class="level" data-ai-level value="${f.level ?? ""}"></label></div>
            <span class="muted">${esc(f.reason)} · ${Math.round(f.confidence * 100)} %</span></div></div>`,
      )
      .join("");
    const roomRows = (ai.rooms || [])
      .map(
        (r) => `<div class="airow" data-ai-room="${esc(r.area_id)}">
          <input type="checkbox" data-ai-take ${r.confidence >= 0.5 ? "checked" : ""}>
          <div class="ename"><b>${esc(r.name)} →</b>${this._floorSelect("data-ai-room-floor", r.area_id, r.floor_id)}
            <span class="muted">${esc(r.reason)} · ${Math.round(r.confidence * 100)} %</span></div></div>`,
      )
      .join("");
    return `<div class="card aicard"><b>${esc(t.aiFloorsTitle)}</b>
      ${clash ? `<div class="ailine no">${esc(t.levelClash)}</div>` : ""}
      ${floorRows}${roomRows}
      <div class="actions"><button data-act="ai-floors-apply">${esc(t.applySelected)}</button></div></div>`;
  }

  _groupsHtml() {
    const t = this._t;
    const rooms = [...this._data.map.rooms].sort((a, b) => a.name.localeCompare(b.name));
    const groups = this._data.groups || [];
    return `<div class="card groupcard"><div class="floorhead"><h2>${esc(t.groupsTitle)}</h2></div>
      <div class="muted small">${esc(t.groupsInfo)}</div>
      ${groups
        .map(
          (g) => `<div class="grouprow">
            <div class="row"><input class="fname" data-group-name="${esc(g.label_id)}" value="${esc(g.name)}">
              <button data-act="group-delete" data-label="${esc(g.label_id)}" class="flat danger">${esc(t.groupDissolve)}</button></div>
            <div class="muted small">${esc(t.groupRooms)}</div>
            <div class="chips">${rooms
              .map(
                (r) => `<button data-group-toggle="${esc(g.label_id)}" data-area="${esc(r.area_id)}" class="chip ${g.area_ids.includes(r.area_id) ? "active" : ""}">${esc(r.name)}</button>`,
              )
              .join("")}</div></div>`,
        )
        .join("")}
      <div class="row addrow"><input id="group-name" placeholder="${esc(t.groupNamePh)}">
        <button data-act="group-add" class="secondary">${esc(t.groupAdd)}</button></div></div>`;
  }

  _convertButton(r) {
    return `<button data-act="convert-start" data-area="${esc(r.area_id)}" data-name="${esc(r.name)}" class="flat inline">⇢ ${esc(this._t.convertBtn)}</button>`;
  }

  _convertForm(r) {
    const t = this._t;
    const cv = this._convert;
    if (!cv || cv.area_id !== r.area_id) return "";
    const others = [...this._data.map.rooms].filter((x) => x.area_id !== r.area_id).sort((a, b) => a.name.localeCompare(b.name));
    const name = (id) => others.find((x) => x.area_id === id)?.name || id;
    const options = (selected) =>
      cv.members.map((id) => `<option value="${esc(id)}" ${id === selected ? "selected" : ""}>${esc(name(id))}</option>`).join("");
    const pv = cv.preview;
    const items = pv
      ? [
          ...pv.devices.map((d) => ({ key: d.device_id, attr: "data-convert-dev", ...d })),
          ...pv.entities.map((e) => ({ key: e.entity_id, attr: "data-convert-ent", ...e })),
        ]
      : [];
    const refs = pv ? [...pv.references.automations, ...pv.references.scripts] : [];
    return `<div class="mergeform">
      <b>${esc(t.convertTitle(r.name))}</b>
      <div class="muted small">${esc(t.convertInfo(r.name))}</div>
      <div class="muted small">${esc(t.convertPick)}</div>
      <div class="chips">${others
        .map((x) => `<button data-convert-member="${esc(x.area_id)}" class="chip ${cv.members.includes(x.area_id) ? "active" : ""}">${esc(x.name)}</button>`)
        .join("")}</div>
      ${cv.members.length && pv
        ? `<div class="muted small">${esc(t.convertWhere)}</div>
          ${items
            .map(
              (x) => `<div class="devrow"><span class="kicon small">${kindIcon(x.what)}</span>
                <div class="ename"><b>${esc(x.name)}</b>${x.suggested ? `<span class="muted small">${esc(t.convertByName)}</span>` : ""}</div>
                <select ${x.attr}="${esc(x.key)}" class="devarea">${options(x.suggested || cv.members[0])}</select></div>`,
            )
            .join("")}
          ${refs.length ? `<div class="ailine no">${esc(t.mergeRefs(r.name))} ${refs.map((x) => esc(x.name)).join(", ")}</div>` : ""}
          <div class="actions"><button data-act="convert-do">${esc(t.convertDo)}</button>
            <button data-act="convert-cancel" class="flat">${esc(t.cancel)}</button></div>`
        : `<div class="actions"><button data-act="convert-cancel" class="flat">${esc(t.cancel)}</button></div>`}
    </div>`;
  }

  _mergeButton(r) {
    return `<button data-act="merge-start" data-area="${esc(r.area_id)}" data-name="${esc(r.name)}" class="flat inline">⤵ ${esc(this._t.mergeBtn)}</button>`;
  }

  _mergeForm(r) {
    const t = this._t;
    const mg = this._merge;
    if (!mg || mg.source !== r.area_id) return "";
    const others = [...this._data.map.rooms].filter((x) => x.area_id !== r.area_id).sort((a, b) => a.name.localeCompare(b.name));
    const floorName = (id) => this._data.map.floors.find((f) => f.floor_id === id)?.name;
    const refs = mg.refs ? [...mg.refs.automations, ...mg.refs.scripts] : null;
    return `<div class="mergeform">
      <b>${esc(t.mergeWith(r.name))}</b>
      <select id="merge-target"><option value="">${esc(t.mergeChoose)}</option>${others
        .map((x) => `<option value="${esc(x.area_id)}">${esc(x.name)}${floorName(x.floor_id) ? ` (${esc(floorName(x.floor_id))})` : ""}</option>`)
        .join("")}</select>
      <div class="muted small">${esc(t.mergeInfo(r.name))}</div>
      ${refs === null ? "" : refs.length
        ? `<div class="ailine no">${esc(t.mergeRefs(r.name))} ${refs.map((x) => esc(x.name)).join(", ")}</div>`
        : `<div class="muted small">${esc(t.mergeNoRefs)}</div>`}
      <div class="actions"><button data-act="merge-do">${esc(t.mergeDo)}</button>
        <button data-act="merge-cancel" class="flat">${esc(t.cancel)}</button></div></div>`;
  }

  _roomsHtml(onlyMissing) {
    const t = this._t;
    const m = this._data.map;
    const roomRow = (r) => `<div class="roomrow">
        <input class="rname" data-area-name="${esc(r.area_id)}" value="${esc(r.name)}">
        ${this._floorSelect("data-area-floor", r.area_id, r.floor_id)}
        <span class="counts">${this._countsHtml(r.counts)}</span>
        ${r.position ? `<span class="muted" title="${esc(t.onMapShort)}">🗺️</span>` : ""}
        <span class="roomacts">${this._mergeButton(r)}${this._convertButton(r)}</span>
      </div>${this._mergeForm(r)}${this._convertForm(r)}`;
    const loose = m.rooms.filter((r) => !r.floor_id);
    if (onlyMissing) {
      return (
        this._aiFloorsHtml() +
        (loose.length
          ? `<div class="card warnline"><b>${esc(t.noFloorRooms(loose.length))}</b>${loose.map(roomRow).join("")}</div>`
          : `<p class="muted">${esc(t.allDone)}</p>`) +
        `<button data-section-go="rooms" class="secondary wide">🏠 ${esc(t.allRooms)}</button>`
      );
    }
    let html = this._aiFloorsHtml() + this._groupsHtml();
    if (loose.length) {
      html += `<div class="card warnline"><div class="floorhead"><h2>${esc(t.noFloor)}</h2><span class="muted">${esc(t.roomsCount(loose.length))}</span></div>
        ${loose.map(roomRow).join("")}</div>`;
    }
    for (const f of m.floors.filter((x) => x.floor_id)) {
      const rooms = m.rooms.filter((r) => r.floor_id === f.floor_id);
      html += `<div class="card" data-floor="${esc(f.floor_id)}">
        <div class="floorhead">
          <input class="fname" data-floor-name="${esc(f.floor_id)}" value="${esc(f.name)}">
          <label class="muted">${esc(t.floorLevelShort)} <input type="number" class="level" data-floor-level="${esc(f.floor_id)}" value="${f.level ?? ""}"></label>
          <span class="grow"></span><span class="muted">${esc(t.roomsCount(rooms.length))}</span>
        </div>
        ${rooms.map(roomRow).join("")}
        <div class="row addrow"><input data-new-room="${esc(f.floor_id)}" placeholder="${esc(t.newRoomPh)}">
          <button data-act="room-add" class="secondary">${esc(t.addRoom)}</button></div>
      </div>`;
    }
    html += `<div class="card row addrow"><input id="floor-name" placeholder="${esc(t.floorName)}">
      <input id="floor-level" type="number" placeholder="${esc(t.floorLevel)}" class="level">
      <button data-act="floor-add" class="secondary">${esc(t.addFloor)}</button></div>`;
    return html;
  }

  _dupCard(g, withRoom = false) {
    const t = this._t;
            const primary = g.members.find((m) => m.entity_id === g.primary) || g.members[0];
    const ev = g.evidence.find((e) => e.kind === "history") || g.evidence[0];
    const evText = ev.kind === "history" ? t.dupHistory(ev.together, ev.of) : t.dupName;
    const ai = g.ai;
    const pick = ai?.same && ai.primary ? ai.primary : g.primary;
    const aiLine = ai
      ? `<div class="ailine ${ai.same ? "yes" : "no"}">🤖 ${esc(ai.same ? t.aiSame(g.members.find((m) => m.entity_id === ai.primary)?.title || "") : t.aiDifferent)} · ${esc(ai.reason)}</div>`
      : "";
    return `<div class="card dup" data-key="${esc(g.key)}">
      <div class="head"><span class="kicon">${kindIcon(primary.kind)}</span>
        <div class="htxt"><h2>${esc(t.dupTitle(primary.title))}</h2><div class="muted">${esc(evText)}</div></div>
        <span class="grow"></span><span class="badge ${g.strong ? "safe" : ""}">${esc(g.strong ? t.dupStrong : t.dupWeak)}</span></div>
      ${aiLine}
      <div class="muted">${esc(t.dupPick)}</div>
      ${g.members
        .map(
          (m) => `<label class="dupm"><input type="radio" name="dup-${esc(g.key)}" value="${esc(m.entity_id)}" ${m.entity_id === pick ? "checked" : ""}>
            <span class="kicon small">${kindIcon(m.kind)}</span>
            <span class="ename"><b>${esc(m.title)}</b>
              <span class="muted">${esc([m.platform, m.device, this._areaName(m.area_id) || null, m.entity_id].filter(Boolean).join(" · "))}</span></span></label>`,
        )
        .join("")}
      ${withRoom ? `<label class="duproom">${esc(t.wiz.dupRoom)}
        <select data-dup-area>${this._areaOptions(g.members.find((m) => m.entity_id === pick)?.area_id || g.members.find((m) => m.area_id)?.area_id || "")}</select></label>` : ""}
      <div class="actions"><button data-act="dup-merge" class="${ai && !ai.same ? "secondary" : ""}">${esc(t.merge)}</button>
        <span class="grow"></span><button data-act="dup-different" class="${ai && !ai.same ? "" : "flat"}">${esc(t.different)}</button></div>
    </div>`;
  }

  _duplicatesHtml() {
    const t = this._t;
    const d = this._data;
    let html = d.history_checked ? "" : `<div class="muted">${esc(t.noHistory)}</div>`;
    html += d.duplicates.length
      ? d.duplicates
          .map((g) => this._dupCard(g))
          .join("")
      : `<p class="muted">${esc(t.allDone)}</p>`;
    if (d.merged.length) {
      html += `<details class="card"><summary><b>${esc(t.merged)}</b> (${d.merged.length})</summary>
        ${d.merged
          .map(
            (m) => `<div class="devrow" data-key="${esc(m.key)}"><div class="ename"><b>${esc(m.title)}</b>
              <span class="muted">${esc(m.members.map((x) => x.platform).join(" + "))}</span></div>
              <button data-act="dup-unmerge" class="flat">${esc(t.unmerge)}</button></div>`,
          )
          .join("")}</details>`;
    }
    return html;
  }

  _deviceRow(x) {
    const t = this._t;
    return `<div class="devrow" data-device="${esc(x.device_id)}" data-entry="${esc(x.config_entry_id || "")}"
                data-name="${esc(x.name)}" data-disabled="${x.disabled ? 1 : 0}">
                <span class="kicon">${kindIcon(x.kind)}</span>
                <div class="ename"><b>${esc(x.name)}</b>
                  <span class="muted">${esc([t.kinds[x.kind], x.model, this._devGroup === "room" ? x.integration : x.area].filter(Boolean).join(" · "))}</span>
                  ${x.silent ? `<span class="reason danger">${esc(t.silent)}</span>` : ""}
                  ${x.disabled ? `<span class="reason">${esc(t.disabledLbl)}</span>` : ""}
                  ${x.ai ? `<span class="ailine ${x.ai.advice === "keep" ? "no" : "yes"}">🤖 ${esc(t.aiAdvice(t.advice[x.ai.advice]))} · ${esc(x.ai.reason)}</span>` : ""}
                  ${x.ai_kind ? `<span class="ailine">🤖 ${esc(t.aiKind(t.kinds[x.ai_kind.kind] || x.ai_kind.kind))} · ${esc(x.ai_kind.reason)}
                    <button data-act="ai-kind" data-entity="${esc(x.ai_kind.entity_id)}" data-kind="${esc(x.ai_kind.kind)}" class="flat inline">${esc(t.take)}</button></span>` : ""}</div>
                <select data-dev-area="${esc(x.device_id)}" class="devarea">${this._areaOptions(x.area_id)}</select>
                <div class="devbtns">
                  <button data-act="dev-toggle" class="secondary">${esc(x.disabled ? t.enable : t.disable)}</button>
                  <button data-act="dev-delete" class="flat danger" ${x.deletable ? "" : `disabled title="${esc(t.noDelete)}"`}>${esc(t.del)}</button>
                </div>
              </div>`;
  }

  _devicesHtml(silentOnly) {
    const t = this._t;
    const s = this._search;
    const all = this._data.devices.flatMap((g) => g.devices.map((x) => ({ ...x, integration: g.integration, entryTitle: g.title })));
    const shown = all.filter(
      (x) =>
        (!(silentOnly || this._onlySilent) || x.silent) &&
        (!this._devKind || x.kind === this._devKind) &&
        (!this._devRoom || (this._devRoom === "-" ? !x.area_id : x.area_id === this._devRoom)) &&
        (!s || [x.name, x.model, x.area, x.integration, x.entryTitle, t.kinds[x.kind]].join(" ").toLowerCase().includes(s)),
    );
    const groups = new Map();
    for (const x of shown) {
      const key = this._devGroup === "room" ? x.area || t.withoutRoom : x.integration;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(x);
    }
    const sorted = [...groups.entries()].sort((a, b) => b[1].filter((x) => x.silent).length - a[1].filter((x) => x.silent).length || a[0].localeCompare(b[0]));
    if (!sorted.length) return `<p class="muted">${esc(silentOnly ? t.allDone : t.empty)}</p>`;
    const open = sorted.length <= 3 || !!s || silentOnly || !!this._devKind || !!this._devRoom || this._onlySilent;
    return sorted
      .map(([key, items]) => {
        const silent = items.filter((x) => x.silent).length;
        return `<details class="card" ${open || silent ? "open" : ""}>
          <summary><b>${esc(key)}</b> · ${items.length}${silent ? ` · <span class="danger">${silent} ${esc(t.silent)}</span>` : ""}</summary>
          ${items.map((x) => this._deviceRow(x)).join("")}
        </details>`;
      })
      .join("");
  }

  // ---- start assistant ---------------------------------------------------

  _descriptionHtml() {
    const t = this._t;
    const tpl = `{{ state_attr('${this._data.sensor || "sensor.hauskarte_beschreibung"}', 'text') }}`;
    return `<div class="card"><b>${esc(t.description)}</b>
      <pre class="desc">${esc(this._data.description)}</pre>
      <div class="muted">${esc(t.descriptionHint)}</div>
      <div class="row"><code class="tpl grow">${esc(tpl)}</code>
        <button data-act="map-copy" data-copy="${esc(tpl)}" class="secondary">${esc(t.copy)}</button></div></div>`;
  }

  _wizSteps() {
    return ["welcome", "floors", "rooms", "plan", "devices", "duplicates", "check", "done"].map((id) => ({ id }));
  }

  _wizIndex(steps) {
    const w = this._data.wizard || {};
    let i = steps.findIndex((s) => s.id === w.pos);
    if (i < 0) i = Math.max(0, steps.findIndex((s) => !(w.done || []).includes(s.id)));
    return i;
  }

  _wizGo(id, doneId) {
    this._floorOrder = null;
    const w = (this._data.wizard = this._data.wizard || { done: [] });
    w.pos = id;
    if (doneId && !w.done.includes(doneId)) w.done.push(doneId);
    this._ws("wizard", { pos: id, ...(doneId ? { done: doneId } : {}) }).catch((err) => this._toast(err.message || String(err)));
    this._edit = false;
    this._pending = null;
    this._render();
    window.scrollTo({ top: 0 });
  }

  _wizLabel(step) {
    return this._t.wiz.labels[step.id] || step.id;
  }

  _renderWizard(list) {
    const t = this._t;
    const steps = this._wizSteps();
    const i = this._wizIndex(steps);
    const step = steps[i];
    const done = this._data.wizard?.done || [];
    const pct = Math.round((i / (steps.length - 1)) * 100);
    const body = {
      welcome: () => this._wizWelcome(),
      floors: () => this._wizFloors(),
      rooms: () => this._wizRooms(),
      plan: () => this._wizPlan(),
      devices: () => this._wizDevices(),
      duplicates: () => this._wizDups(),
      check: () => this._wizCheck(),
      done: () => this._wizDone(),
    }[step.id]();
    const last = i === steps.length - 1;
    list.innerHTML = `<div class="wiz">
      <div class="wizhead"><div class="wizbar"><span style="width:${pct}%"></span></div>
        <div class="muted">${esc(t.wiz.stepOf(i + 1, steps.length))} · <b>${esc(this._wizLabel(step))}</b></div></div>
      ${body}
      <div class="wiznav">
        <button data-wiz="prev" class="secondary" ${i === 0 ? "disabled" : ""}>${esc(t.wiz.prev)}</button>
        <span class="grow"></span>
        ${last ? `<button data-wiz="finish">${esc(t.wiz.finish)}</button>` : `<button data-wiz="next">${esc(t.wiz.next)}</button>`}
      </div>
      <details class="card wizall"><summary>${esc(t.wiz.all)}</summary>
        ${steps
          .map(
            (s, n) => `<button data-wiz-go="${esc(s.id)}" class="wizstep ${n === i ? "active" : ""}">
              <span>${done.includes(s.id) ? "✓" : n + 1}</span>${esc(this._wizLabel(s))}</button>`,
          )
          .join("")}
      </details>
      <button data-wiz="later" class="flat wide">${esc(t.wiz.later)}</button>
    </div>`;
    if (step.id === "plan") this._applyImages();
    this._live();
  }

  _wizWelcome() {
    const t = this._t;
    const d = this._data;
    const ai = d.llm
      ? d.ai?.at
        ? `<div class="ailine yes">${esc(t.wiz.aiReady(new Date(d.ai.at).toLocaleString(this._hass.language)))}</div>`
        : d.progress.running && d.progress.phase === "ai"
          ? `<div class="ailine">${esc(t.aiRunning(t.aiTasks[d.progress.task] || "…", d.progress.done + 1, d.progress.total))}</div>`
          : `<button data-act="ai-review" class="secondary ai" ${d.progress.running ? "disabled" : ""}>${esc(t.wiz.aiStart)}</button>
             <div class="muted">${esc(t.wiz.aiStartInfo)}</div>`
      : `<div class="muted">${esc(t.wiz.aiNo)}</div>`;
    return `<div class="card"><h2>👋 ${esc(t.wiz.labels.welcome)}</h2>
      <p>${esc(t.wiz.intro)}</p>
      <ol class="wizplan">${t.wiz.plan.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>
      ${d.last_scan ? "" : `<button data-act="scan-rules" ${d.progress.running ? "disabled" : ""}>${esc(t.wiz.scanFirst)}</button>`}
      <div class="wizai">${ai}</div></div>`;
  }

  _wizFloors() {
    const t = this._t;
    const floors = this._data.map.floors.filter((f) => f.floor_id);
    // keep the list where it is while numbers change; the order preview below shows the effect
    const ids = floors.map((f) => f.floor_id);
    this._floorOrder = [...(this._floorOrder || []).filter((id) => ids.includes(id)), ...ids.filter((id) => !(this._floorOrder || []).includes(id))];
    const ordered = this._floorOrder.map((id) => floors.find((f) => f.floor_id === id));
    const byLevel = [...floors].sort((a, b) => (b.level ?? -999) - (a.level ?? -999));
    const levels = floors.map((f) => f.level).filter((l) => l != null);
    const clash = levels.length !== new Set(levels).size;
    return `<div class="info">${esc(t.wiz.floorsInfo)}</div>
      ${ordered
        .map(
          (f) => `<div class="card floorhead">
            <input class="fname" data-floor-name="${esc(f.floor_id)}" value="${esc(f.name)}">
            <label class="muted">${esc(t.floorLevelShort)} <input type="number" class="level" data-floor-level="${esc(f.floor_id)}" value="${f.level ?? ""}"></label>
            <span class="muted">${esc(t.wiz.floorRow(this._data.map.rooms.filter((r) => r.floor_id === f.floor_id).length))}</span></div>`,
        )
        .join("")}
      <div class="card order"><b>${esc(t.wiz.orderTitle)}</b>
        <div class="orderlist">${byLevel
          .map((f) => `<span class="orderitem">${esc(f.name)} <span class="muted">${f.level ?? "–"}</span></span>`)
          .join('<span class="muted">↓</span>')}</div>
        ${clash ? `<div class="ailine no">${esc(t.wiz.levelClash)}</div>` : ""}</div>
      <div class="card row addrow"><input id="floor-name" placeholder="${esc(t.floorName)}">
        <input id="floor-level" type="number" placeholder="${esc(t.floorLevel)}" class="level">
        <button data-act="floor-add">${esc(t.addFloor)}</button></div>`;
  }

  _roomDevicesHtml(room) {
    const t = this._t;
    const devs = room.devices;
    if (!devs.length) return `<span class="muted">${esc(t.wiz.noDevices)}</span>`;
    return (
      devs
        .slice(0, 8)
        .map((d) => `<span class="wdev">${kindIcon(d.speaker ? "voice" : d.what)} ${esc(d.name)}</span>`)
        .join("") + (devs.length > 8 ? `<span class="muted">${esc(t.wiz.more(devs.length - 8))}</span>` : "")
    );
  }

  _wizRooms() {
    const t = this._t;
    const d = this._data;
    const m = d.map;
    const floors = m.floors.filter((f) => f.floor_id);
    const aiRooms = d.ai?.rooms || [];
    const sure = aiRooms.filter((r) => r.confidence >= 0.4);
    const running = d.progress.running && d.progress.phase === "ai";
    const floorName = (id) => floors.find((f) => f.floor_id === id)?.name || id;
    const roomCard = (r) => {
      const ai = aiRooms.find((x) => x.area_id === r.area_id);
      return `<div class="wroom ${ai ? "aisuggest" : ""}">
        <div class="wroomhead"><input class="rname" data-area-name="${esc(r.area_id)}" value="${esc(r.name)}">
          ${this._floorSelect("data-area-floor", r.area_id, r.floor_id)}</div>
        <div class="wdevs">${this._roomDevicesHtml(r)}</div>
        ${ai ? `<div class="ailine">🤖 ${esc(t.wiz.aiMove(floorName(ai.floor_id)))} · ${esc(ai.reason)} · ${Math.round(ai.confidence * 100)} %
          <button data-act="ai-room-take" data-area="${esc(r.area_id)}" data-floor="${esc(ai.floor_id)}" class="flat inline">${esc(t.take)}</button></div>` : ""}
        <div>${this._mergeButton(r)}${this._convertButton(r)}</div>${this._mergeForm(r)}${this._convertForm(r)}
      </div>`;
    };
    const group = (title, rooms, floorId, warn) => `<div class="card ${warn ? "warnline" : ""}">
        <div class="floorhead"><h2>${esc(title)}</h2><span class="muted">${esc(t.roomsCount(rooms.length))}</span></div>
        ${rooms.map(roomCard).join("")}
        ${floorId ? `<div class="row addrow"><input data-new-room="${esc(floorId)}" placeholder="${esc(t.newRoomPh)}">
          <button data-act="room-add" class="secondary">${esc(t.addRoom)}</button></div>` : ""}
      </div>`;
    const loose = m.rooms.filter((r) => !r.floor_id);
    const aiBar = d.llm
      ? `<div class="card aicard row">${
          running
            ? `<span class="running">${esc(t.wiz.aiRoomsRunning)}</span>`
            : `${sure.length ? `<button data-act="ai-rooms-all">${esc(t.wiz.takeAll(sure.length))}</button>` : ""}
               <button data-act="ai-rooms" class="secondary ai">${esc(t.wiz.aiRooms)}</button>
               <span class="muted grow">${esc(aiRooms.length ? t.wiz.aiRoomsCount(aiRooms.length) : t.wiz.aiRoomsInfo)}</span>`
        }</div>`
      : "";
    return `<div class="info">${esc(t.wiz.roomsInfo)}</div>${aiBar}
      <div class="muted">${esc(t.wiz.savedNow)}</div>
      ${loose.length ? group(t.noFloor, loose, null, true) : ""}
      ${floors.map((f) => group(f.name, m.rooms.filter((r) => r.floor_id === f.floor_id), f.floor_id)).join("")}
      ${this._groupsHtml()}`;
  }

  _wizPlan() {
    const t = this._t;
    const floors = this._data.map.floors.filter((f) => f.floor_id);
    this._edit = true;
    return `<div class="info">${esc(t.wiz.planInfo)}</div>${this._modeChips()}
      ${floors
        .map((f, i) => `<details class="card" ${i === 0 || f.image ? "open" : ""}><summary><b>${esc(f.name)}</b></summary>${this._floorHtml(f)}</details>`)
        .join("")}`;
  }

  _wizDevices() {
    const t = this._t;
    const d = this._data;
    const dupDevices = new Set(d.duplicates.flatMap((g) => g.members.map((m) => m.device_id)).filter(Boolean));
    const all = d.devices.flatMap((g) => g.devices.map((x) => ({ ...x, integration: g.integration })));
    const todo = all.filter((x) => !x.area_id && !x.disabled && !dupDevices.has(x.device_id));
    const placed = all.filter((x) => x.area_id).length;
    const aiBtn = d.llm
      ? `<div class="card aicard row">
          <button data-act="scan" class="secondary ai" ${d.progress.running ? "disabled" : ""}>${esc(t.wiz.aiDevices)}</button>
          ${d.progress.running ? `<span class="running">${esc(t.running)}</span>` : ""}</div>`
      : "";
    if (!todo.length) {
      return `<div class="info">${esc(t.wiz.devicesInfo)}</div><p class="muted">${esc(t.wiz.noneLeft)}</p>
        <p class="muted">${esc(t.wiz.withRoom(placed))}</p>`;
    }
    const rows = todo.map((x) => {
      const prop = d.proposals.find((p) => p.id === `device:${x.device_id}`);
      const area = prop?.proposed.area_id && prop.proposed.area_id !== prop.current.area_id ? prop.proposed.area_id : "";
      let why = "";
      if (area) {
        const note = prop.reasons.find((r) => r.code === "llm_note")?.text;
        const byName = prop.reasons.some((r) => r.code === "area_from_name");
        why =
          prop.source === "llm" && !byName
            ? `🤖 ${this._areaName(area)}${note ? ` · ${note}` : ""} · ${Math.round(prop.confidence * 100)} %`
            : `${this._areaName(area)} · ${t.wiz.byName(this._areaName(area))}`;
      }
      return { x, area, why };
    });
    const groups = new Map();
    for (const r of rows) {
      if (!groups.has(r.area)) groups.set(r.area, []);
      groups.get(r.area).push(r);
    }
    const ordered = [...groups.entries()].sort(
      (a, b) => (a[0] === "") - (b[0] === "") || this._areaName(a[0]).localeCompare(this._areaName(b[0])),
    );
    const html = ordered
      .map(
        ([area, items]) => `<div class="card"><h3 class="wizsec">${esc(area ? t.wiz.suggestedFor(this._areaName(area), items.length) : t.wiz.noSuggestion(items.length))}</h3>
          ${items
            .map(
              ({ x, area: a, why }) => `<div class="devrow"><span class="kicon">${kindIcon(x.kind)}</span>
                <div class="ename"><b>${esc(x.name)}</b>
                  <span class="muted">${esc([t.kinds[x.kind], x.model, x.integration].filter(Boolean).join(" · "))}</span>
                  ${x.entity_names?.length ? `<span class="muted small">${esc(t.wiz.entities(x.entity_names.join(", ")))}</span>` : ""}
                  ${why ? `<span class="ailine">${esc(why)}
                    <button data-act="ai-dev-take" data-device="${esc(x.device_id)}" data-area="${esc(a)}" class="flat inline">${esc(t.take)}</button></span>` : ""}</div>
                <select data-dev-area="${esc(x.device_id)}" class="devarea">${this._areaOptions("")}</select></div>`,
            )
            .join("")}</div>`,
      )
      .join("");
    const withSuggestion = rows.filter((r) => r.area).length;
    const takeAll = withSuggestion
      ? `<div class="actions"><button data-act="ai-devs-all" class="wide">${esc(t.wiz.takeAll(withSuggestion))}</button></div>`
      : "";
    return `<div class="info">${esc(t.wiz.devicesInfo)}</div>${aiBtn}${takeAll}${html}
      <p class="muted">${esc(t.wiz.withRoom(placed))}</p>`;
  }

  _wizDups() {
    const t = this._t;
    const d = this._data;
    return `<div class="info">${esc(t.wiz.dupsInfo)}</div>
      ${d.duplicates.length ? d.duplicates.map((g) => this._dupCard(g, true)).join("") : `<p class="muted">${esc(t.wiz.dupsNone)}</p>`}`;
  }

  _wizCheck() {
    const t = this._t;
    const m = this._data.map;
    const c = this._counts();
    const floors = [
      ...m.floors.filter((f) => f.floor_id),
      ...(m.rooms.some((r) => !r.floor_id) ? [{ floor_id: null, name: t.noFloor }] : []),
    ];
    return `<div class="info">${esc(t.wiz.checkInfo)}</div>
      ${floors
        .map((f) => {
          const rooms = m.rooms.filter((r) => (r.floor_id || null) === f.floor_id);
          return `<details class="card ${f.floor_id ? "" : "warnline"}" open><summary><b>${esc(f.name)}</b> · ${esc(t.roomsCount(rooms.length))}</summary>
            ${rooms
              .map(
                (r) => `<div class="wroom"><div class="wroomhead"><b>${esc(r.name)}</b><span class="counts">${this._countsHtml(r.counts)}</span></div>
                  <div class="wdevs">${r.devices.length ? this._roomDevicesHtml(r) : `<span class="muted">${esc(t.wiz.empty)}</span>`}</div></div>`,
              )
              .join("")}</details>`;
        })
        .join("")}
      <p class="muted">${esc(t.wiz.rest({ open: c.open, orphans: c.orphans, silent: c.silent }))}</p>`;
  }

  _wizDone() {
    const t = this._t;
    const d = this._data;
    const c = this._counts();
    const summary = t.wiz.summary({
      floors: d.map.floors.filter((f) => f.floor_id).length,
      rooms: d.map.rooms.length,
      loose: c.rooms,
      open: c.open,
      dups: c.duplicates,
      unassigned: d.map.unassigned_total,
    });
    return `<div class="card"><h2>🎉 ${esc(t.wiz.labels.done)}</h2><p>${esc(t.wiz.doneInfo)}</p><p><b>${esc(summary)}</b></p></div>
      ${this._descriptionHtml()}`;
  }

  // ---- map ---------------------------------------------------------------

  _floorKey(f) {
    return f.floor_id ?? "";
  }

  _place(p, cols, rows) {
    return `left:${(p.x / cols) * 100}%;top:${(p.y / rows) * 100}%;width:${(p.w / cols) * 100}%;height:${(p.h / rows) * 100}%`;
  }

  _modeChips() {
    const t = this._t;
    return `<div class="modechips"><div class="chips">
        <button data-editmode="rooms" class="chip ${this._editMode === "rooms" ? "active" : ""}">${esc(t.modeRooms)}</button>
        <button data-editmode="devices" class="chip ${this._editMode === "devices" ? "active" : ""}">${esc(t.modeDevices)}</button></div>
      <span class="muted">${esc(this._editMode === "rooms" ? t.hintRooms : t.hintDevices)}</span></div>`;
  }

  _renderMap(list) {
    const t = this._t;
    const m = this._data.map;
    let html = `<div class="maptools">
      <button data-act="map-edit" class="${this._edit ? "" : "secondary"}">${esc(this._edit ? t.editDone : t.edit)}</button>
      ${this._edit ? "" : `<label class="check" title="${esc(t.tapHint)}"><input type="checkbox" id="tap-toggle" ${this._tap ? "checked" : ""}> ${esc(t.tapToggle)}</label>`}
      <span class="grow"></span></div>${this._edit ? this._modeChips() : ""}`;
    if (m.speakers_without_area.length) {
      html += `<div class="info warn">🎙️ ${esc(t.speakersNoArea)}: ${m.speakers_without_area.map((s) => esc(s.name)).join(", ")}</div>`;
    }
    if (!m.floors.some((f) => f.floor_id)) html += `<div class="info">${esc(t.noFloors)}</div>`;
    if (m.unassigned_total && !this._edit) html += `<div class="muted">${esc(t.trayHint(m.unassigned_total))}</div>`;
    if (m.unassigned_total && this._edit && this._editMode === "devices") {
      html += `<div class="card tray"><b>${esc(t.tray)}</b> <span class="muted">(${m.unassigned_total})</span>
        <div class="traylist">${m.unassigned.map((d) => this._pinHtml(d, null, "traypin")).join("")}</div></div>`;
    }
    if (this._edit) {
      html += `<div class="muted">🏠 <button data-section-go="rooms" class="flat inline">${esc(t.allRooms)}</button></div>`;
    }
    html += m.floors.map((f) => this._floorHtml(f)).join("");
    html += `<details class="card" ${this._edit ? "open" : ""}><summary><b>${esc(t.notes)}</b></summary>
      <label class="note">${esc(t.houseNote)}<textarea data-note="_house" rows="2">${esc(m.house_note)}</textarea></label>
      ${m.rooms.map((r) => `<label class="note">${esc(r.name)}<input data-note="${esc(r.area_id)}" value="${esc(r.note)}"></label>`).join("")}
    </details>`;
    html += this._descriptionHtml();
    list.innerHTML = html;
    this._applyImages();
    this._live();
  }

  _floorHtml(f) {
    const t = this._t;
    const m = this._data.map;
    const cols = m.columns;
    const rows = f.rows;
    const key = this._floorKey(f);
    const rooms = m.rooms.filter((r) => (r.floor_id ?? "") === key);
    const placed = rooms.filter((r) => r.position);
    const unplaced = rooms.filter((r) => !r.position);
    const title = f.floor_id ? f.name + (f.level != null ? ` · ${t.level} ${f.level}` : "") : t.noFloor;
    const tools = this._edit && this._editMode === "rooms"
      ? `<button data-act="map-add-room" class="secondary">${esc(t.addRoom)}</button>
        <label class="filebtn">${esc(t.upload)}<input type="file" accept="image/*" data-upload="${esc(key)}" hidden></label>
        ${f.image ? `<button data-act="map-detect" class="secondary" ${this._detecting !== null ? "disabled" : ""}>${esc(t.detect)}</button>` : ""}
        ${f.image ? `<button data-act="map-remove-image" class="flat">${esc(t.removeImage)}</button>` : ""}
        <span class="muted">${esc(t.gridSize)}</span>
        <button data-act="map-rows-minus" class="small secondary">−</button><button data-act="map-rows-plus" class="small secondary">+</button>`
      : "";
    const pending = this._pending && this._pending.floor === key;
    let html = `<section class="floor" data-floor="${esc(key)}">
      <div class="floorhead"><h2>${esc(title)}</h2><span class="grow"></span>${tools}</div>
      ${this._detecting === key ? `<div class="info running">${esc(t.detecting)}</div>` : ""}
      <div class="floorbody ${rooms.some((r) => r.sensors?.length) ? "" : "nosensors"}">
      <div class="gridwrap"><div class="grid ${this._edit ? `editing mode-${this._editMode}` : ""}" data-grid="${esc(key)}" data-rows="${rows}"
        style="aspect-ratio:${cols}/${rows};--cols:${cols};--rows:${rows}">
        ${this._groupFrames(placed, cols, rows)}
        ${placed.map((r) => this._roomHtml(r, cols, rows)).join("")}
        ${f.detected.map((d) => `<div class="room detected" style="${this._place(d, cols, rows)}"><b>${esc(d.name)}</b></div>`).join("")}
        ${pending ? `<div class="room pending" style="${this._place(this._pending, cols, rows)}"></div>` : ""}
      </div></div>
      ${this._sensorsHtml(rooms)}
      </div>`;
    if (this._iconFor && rooms.some((r) => r.devices.some((d) => d.id === this._iconFor.id))) html += this._iconForm();
    if (pending) html += this._pendingForm();
    if (f.detected.length) html += this._detectedForm(f);
    if (unplaced.length) {
      html += `<div class="unplaced"><span class="muted">${esc(t.unplaced)}:</span>
        ${unplaced.map((r) => `<button class="chip" data-act="map-place-unplaced" data-area="${esc(r.area_id)}" ${this._edit ? "" : "disabled"}>${esc(r.name)}</button>`).join("")}</div>`;
    }
    const hidden = rooms.flatMap((r) => r.devices.filter((d) => !d.visible));
    if (this._edit && hidden.length) {
      html += `<div class="unplaced"><span class="muted">${esc(t.hidden)}:</span>
        ${hidden.map((d) => `<button class="chip dim" data-act="map-show" data-id="${esc(d.id)}">👁 ${esc(d.name)}</button>`).join("")}</div>`;
    }
    return html + "</section>";
  }

  _pinHtml(d, pos, extraClass = "") {
    const style = pos ? `style="left:${pos.x * 100}%;top:${pos.y * 100}%"` : "";
    const tip = [d.name, this._t.kinds[d.what]].filter(Boolean).join(" · ");
    const twin = d.twins?.length ? `<span class="twin" title="${esc(this._t.twinsVia(d.twins.join(", ")))}">⧉</span>` : "";
    let inner = kindIcon(d.speaker ? "voice" : d.what);
    if (d.icon?.image) inner = `<img src="${esc(d.icon.image)}" alt="">`;
    else if (d.icon?.mdi && customElements.get("ha-icon")) inner = `<ha-icon icon="${esc(d.icon.mdi)}"></ha-icon>`;
    return `<button class="pin ${extraClass} ${d.exposed ? "" : "dim"} ${d.speaker ? "spk" : ""}" data-act="map-open"
        data-kind="${d.kind}" data-id="${esc(d.id)}" data-entity="${esc(d.entity_id || "")}" data-name="${esc(d.name)}" title="${esc(tip)}" ${style}>
      <span class="ico" ${d.icon ? "" : "data-hydrate"}>${inner}${twin}</span><span class="lbl">${esc(d.name)}</span>
      ${this._edit && !extraClass
        ? `<span class="hide" data-hide="${esc(d.id)}" title="${esc(this._t.hide)}">×</span>
           <span class="iconedit" data-iconedit="${esc(d.id)}" data-name="${esc(d.name)}" title="${esc(this._t.iconFor(d.name))}">🎨</span>`
        : ""}</button>`;
  }

  _roomHtml(r, cols, rows) {
    const t = this._t;
    const visible = r.devices.filter((d) => d.visible && d.physical !== false);
    const speaker = visible.some((d) => d.speaker);
    const head = ["temperature", "humidity"]
      .map((k) => (r.sensors || []).find((s) => s.what === k))
      .filter(Boolean)
      .map((s) => `<span class="rval">${kindIcon(s.what)}<span data-state-entity="${esc(s.entity_id)}"></span></span>`)
      .join("");
    const open = r.devices.filter((d) => d.open).length;
    // devices without a chosen spot are spread evenly below the room name
    const gc = Math.max(1, Math.ceil(Math.sqrt(visible.length)));
    const gr = Math.max(1, Math.ceil(visible.length / gc));
    const pins = visible
      .map((d, i) => {
        const pos = d.pos || { x: ((i % gc) + 0.5) / gc, y: 0.22 + (0.74 * (Math.floor(i / gc) + 0.5)) / gr };
        return this._pinHtml(d, pos);
      })
      .join("");
    return `<div class="room" data-area="${esc(r.area_id)}" data-name="${esc(r.name)}" style="${this._place(r.position, cols, rows)}">
      <div class="roomhead"><b>${esc(r.name)}</b>${speaker ? " 🎙️" : ""}${open ? `<span class="badge">${open}</span>` : ""}${head}
        ${this._edit ? `<button class="x" data-act="map-unplace" title="${esc(t.removeFromMap)}">×</button>` : ""}</div>
      ${pins}
      ${this._edit ? `<div class="handle"></div>` : ""}
    </div>`;
  }

  // A dashed frame around the drawn rooms of each room group on this floor.
  _groupFrames(placed, cols, rows) {
    return (this._data.groups || [])
      .map((g) => {
        const rs = placed.filter((r) => g.area_ids.includes(r.area_id)).map((r) => r.position);
        if (rs.length < 1) return "";
        const x = Math.min(...rs.map((p) => p.x));
        const y = Math.min(...rs.map((p) => p.y));
        const w = Math.max(...rs.map((p) => p.x + p.w)) - x;
        const h = Math.max(...rs.map((p) => p.y + p.h)) - y;
        return `<div class="groupframe" style="${this._place({ x, y, w, h }, cols, rows)}"><span>${esc(g.name)}</span></div>`;
      })
      .join("");
  }

  _sensorsHtml(rooms) {
    const withValues = rooms.filter((r) => r.sensors?.length);
    if (!withValues.length) return "";
    return `<aside class="sensors"><b>${esc(this._t.sensorsTitle)}</b>
      ${withValues
        .map(
          (r) => `<div class="sroom"><span class="sname">${esc(r.name)}</span>
            ${r.sensors
              .map(
                (s) => `<button class="sval" data-more-info="${esc(s.entity_id)}" title="${esc(s.name)}">${kindIcon(s.what)}
                  <span class="sn">${esc(s.name)}</span><span class="sv" data-state-entity="${esc(s.entity_id)}"></span></button>`,
              )
              .join("")}</div>`,
        )
        .join("")}</aside>`;
  }

  _iconForm() {
    const t = this._t;
    const f = this._iconFor;
    return `<div class="card row iconform"><b>${esc(t.iconFor(f.name))}</b>
      <input id="icon-mdi" placeholder="${esc(t.iconMdi)}" value="${esc(f.mdi || "")}">
      <button data-act="map-icon-apply">${esc(t.iconApply)}</button>
      <label class="filebtn">${esc(t.iconUpload)}<input type="file" accept="image/*" data-iconfile hidden></label>
      <button data-act="map-icon-reset" class="flat">${esc(t.iconReset)}</button>
      <a href="https://pictogrammers.com/library/mdi/" target="_blank" rel="noopener" class="muted">${esc(t.iconSearch)} ↗</a>
      <button data-act="map-icon-cancel" class="flat">${esc(t.cancel)}</button></div>`;
  }

  async _uploadIcon(input) {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const img = await this._loadImage(URL.createObjectURL(file));
      const size = 96;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const scale = Math.min(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      canvas.getContext("2d").drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      await this._ws("item_icon", { item_id: this._iconFor.id, image: canvas.toDataURL("image/png") });
      this._iconFor = null;
      await this._load();
    } catch (err) {
      this._toast(err.message || String(err));
    }
  }

  _roomOptions(selected, firstLabel) {
    const floors = Object.fromEntries(this._data.map.floors.map((f) => [this._floorKey(f), f.name]));
    const rooms = [...this._data.map.rooms].sort((a, b) => !!a.position - !!b.position || a.name.localeCompare(b.name));
    return (
      `<option value="">${esc(firstLabel)}</option>` +
      rooms
        .map((r) => {
          const floor = floors[r.floor_id ?? ""];
          return `<option value="${esc(r.area_id)}" ${r.area_id === selected ? "selected" : ""}>${esc(r.name)}${floor ? ` (${esc(floor)})` : ""}${r.position ? " ✓" : ""}</option>`;
        })
        .join("")
    );
  }

  _pendingForm() {
    const t = this._t;
    return `<div class="card row"><b>${esc(t.placeWhich)}</b>
      <select id="pending-area">${this._roomOptions(null, "–")}</select>
      <input id="pending-name" placeholder="${esc(t.newRoomName)}">
      <button data-act="map-place-pending">${esc(t.place)}</button>
      <button data-act="map-cancel-pending" class="flat">${esc(t.cancel)}</button></div>`;
  }

  _detectedForm(f) {
    const t = this._t;
    return `<div class="card"><b>${esc(t.detected)}</b>
      ${f.detected
        .map(
          (d, i) => `<div class="detrow" data-i="${i}">
            <label class="check"><input type="checkbox" data-f="take" checked> ${esc(t.take)}</label>
            <input data-f="name" value="${esc(d.name)}">
            <select data-f="area">${this._roomOptions(d.area_id, t.newRoom)}</select></div>`,
        )
        .join("")}
      <div class="actions"><button data-act="map-accept-detected">${esc(t.acceptDetected)}</button>
        <button data-act="map-discard-detected" class="flat">${esc(t.discard)}</button></div></div>`;
  }

  async _applyImages() {
    for (const f of this._data.map.floors) {
      if (!f.image) continue;
      const key = this._floorKey(f);
      let cached = this._images[key];
      if (!cached || cached.version !== f.image) {
        try {
          const r = await this._ws("floor_image", { floor_id: f.floor_id });
          cached = this._images[key] = { version: f.image, data: r.image };
        } catch (err) {
          continue;
        }
      }
      const grid = this.shadowRoot.querySelector(`[data-grid="${CSS.escape(key)}"]`);
      if (grid && cached.data) {
        grid.style.backgroundImage = `url("${cached.data}")`;
        grid.classList.add("has-image");
      }
    }
  }

  _freeSpot(key, rows) {
    const cols = this._data.map.columns;
    const taken = this._data.map.rooms.filter((r) => (r.floor_id ?? "") === key && r.position).map((r) => r.position);
    const w = 4;
    const h = 3;
    for (let y = 0; y + h <= rows; y++) {
      for (let x = 0; x + w <= cols; x++) {
        if (!taken.some((p) => x < p.x + p.w && p.x < x + w && y < p.y + p.h && p.y < y + h)) return { x, y, w, h };
      }
    }
    return { x: 0, y: 0, w, h };
  }

  _loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("image"));
      img.src = src;
    });
  }

  async _upload(input) {
    const file = input.files?.[0];
    if (!file) return;
    const t = this._t;
    try {
      const img = await this._loadImage(URL.createObjectURL(file));
      const scale = Math.min(1, 1600 / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const data = canvas.toDataURL("image/jpeg", 0.85);
      if (data.length > 2_900_000) {
        this._toast(t.tooLarge);
        return;
      }
      const cols = this._data.map.columns;
      const rows = Math.min(60, Math.max(4, Math.round((cols * h) / w)));
      const key = input.dataset.upload;
      await this._ws("floor_plan", { floor_id: key || null, image: data, rows });
      await this._load();
    } catch (err) {
      this._toast(err.message || String(err));
    }
  }

  // The vision model gets the plan with the numbered grid drawn on, so it can name cells.
  async _gridded(key, rows) {
    const img = await this._loadImage(this._images[key].data);
    const cols = this._data.map.columns;
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const cw = img.width / cols;
    const ch = img.height / rows;
    ctx.strokeStyle = "rgba(220,0,0,0.5)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cw, 0);
      ctx.lineTo(i * cw, img.height);
      ctx.stroke();
    }
    for (let j = 0; j <= rows; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * ch);
      ctx.lineTo(img.width, j * ch);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(200,0,0,0.9)";
    ctx.font = `${Math.max(9, Math.floor(Math.min(cw, ch) * 0.45))}px sans-serif`;
    ctx.textBaseline = "top";
    for (let i = 0; i < cols; i++) ctx.fillText(String(i), i * cw + 2, 2);
    for (let j = 1; j < rows; j++) ctx.fillText(String(j), 2, j * ch + 2);
    return canvas.toDataURL("image/jpeg", 0.85);
  }

  _cell(grid, ev) {
    const r = grid.getBoundingClientRect();
    const cols = this._data.map.columns;
    const rows = Number(grid.dataset.rows);
    return {
      x: Math.min(cols - 1, Math.max(0, Math.floor(((ev.clientX - r.left) / r.width) * cols))),
      y: Math.min(rows - 1, Math.max(0, Math.floor(((ev.clientY - r.top) / r.height) * rows))),
      cols,
      rows,
    };
  }

  _pointerDown(ev) {
    if (!this._edit) {
      // long press on a symbol: Home Assistant's own controls instead of switching
      const pin = ev.target.closest?.(".pin[data-entity]");
      if (pin?.dataset.entity && !pin.classList.contains("traypin")) {
        clearTimeout(this._press);
        this._pressAt = [ev.clientX, ev.clientY];
        this._press = setTimeout(() => {
          this._press = null;
          this._suppressClick = true;
          this._moreInfo(pin.dataset.entity);
        }, 550);
      }
      return;
    }
    if (!["map", "wizard"].includes(this._tab) || ev.button > 0) return;
    const pin = ev.target.closest?.(".pin");
    if (pin && this._editMode !== "devices") return; // rooms mode: devices are not handled
    if (pin && !ev.target.closest("[data-hide]")) {
      pin.setPointerCapture(ev.pointerId);
      this._pinDrag = { el: pin, sx: ev.clientX, sy: ev.clientY, moved: false, ghost: null };
      ev.preventDefault();
      return;
    }
    const grid = ev.target.closest?.("[data-grid]");
    if (!grid || ev.target.closest("button")) return;
    if (this._editMode === "devices") return; // devices mode: rooms stay where they are
    const c = this._cell(grid, ev);
    const roomEl = ev.target.closest(".room:not(.detected):not(.pending)");
    if (roomEl) {
      const room = this._data.map.rooms.find((r) => r.area_id === roomEl.dataset.area);
      const start = { ...room.position };
      this._drag = {
        mode: ev.target.classList.contains("handle") ? "resize" : "move",
        grid,
        el: roomEl,
        area: room.area_id,
        start,
        pos: { ...start },
        off: { x: c.x - start.x, y: c.y - start.y },
      };
    } else {
      const el = document.createElement("div");
      el.className = "room pending";
      grid.appendChild(el);
      this._drag = { mode: "draw", grid, el, key: grid.dataset.grid, from: c, moved: false, pos: { x: c.x, y: c.y, w: 1, h: 1 } };
      el.style.cssText = this._place(this._drag.pos, c.cols, c.rows);
    }
    grid.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  }

  _pointerMove(ev) {
    if (this._press && Math.hypot(ev.clientX - this._pressAt[0], ev.clientY - this._pressAt[1]) > 8) {
      clearTimeout(this._press);
      this._press = null;
    }
    const p = this._pinDrag;
    if (p) {
      if (!p.moved && Math.hypot(ev.clientX - p.sx, ev.clientY - p.sy) < 5) return;
      if (!p.moved) {
        p.moved = true;
        p.ghost = document.createElement("div");
        p.ghost.className = "ghost";
        p.ghost.innerHTML = p.el.querySelector(".ico").outerHTML + p.el.querySelector(".lbl").outerHTML;
        this.shadowRoot.appendChild(p.ghost);
        p.el.classList.add("dragging");
      }
      p.ghost.style.left = `${ev.clientX}px`;
      p.ghost.style.top = `${ev.clientY}px`;
      return;
    }
    const d = this._drag;
    if (!d) return;
    const c = this._cell(d.grid, ev);
    if (d.mode === "move") {
      d.pos.x = Math.min(c.cols - d.pos.w, Math.max(0, c.x - d.off.x));
      d.pos.y = Math.min(c.rows - d.pos.h, Math.max(0, c.y - d.off.y));
    } else if (d.mode === "resize") {
      d.pos.w = Math.min(c.cols - d.pos.x, Math.max(1, c.x - d.pos.x + 1));
      d.pos.h = Math.min(c.rows - d.pos.y, Math.max(1, c.y - d.pos.y + 1));
    } else {
      d.moved = d.moved || c.x !== d.from.x || c.y !== d.from.y;
      d.pos = {
        x: Math.min(d.from.x, c.x),
        y: Math.min(d.from.y, c.y),
        w: Math.abs(c.x - d.from.x) + 1,
        h: Math.abs(c.y - d.from.y) + 1,
      };
    }
    d.el.style.cssText = this._place(d.pos, c.cols, c.rows);
  }

  async _pointerUp(ev) {
    clearTimeout(this._press);
    this._press = null;
    const pin = this._pinDrag;
    if (pin) {
      this._pinDrag = null;
      if (!pin.moved) return;
      this._suppressClick = true;
      setTimeout(() => (this._suppressClick = false), 0);
      pin.ghost.remove();
      pin.el.classList.remove("dragging");
      await this._dropPin(pin.el, ev.clientX, ev.clientY);
      return;
    }
    const d = this._drag;
    if (!d) return;
    this._drag = null;
    if (d.mode === "draw") {
      let pos = d.pos;
      if (!d.moved) {
        // a plain click: start with a medium sized room there
        const cols = this._data.map.columns;
        const rows = Number(d.grid.dataset.rows);
        pos = { x: Math.min(pos.x, cols - 4), y: Math.min(pos.y, rows - 3), w: Math.min(4, cols), h: Math.min(3, rows) };
      }
      this._pending = { floor: d.key, ...pos };
      this._renderList();
      return;
    }
    const s = d.start;
    const p = d.pos;
    if (s.x === p.x && s.y === p.y && s.w === p.w && s.h === p.h) return;
    try {
      await this._ws("position", { area_id: d.area, position: p });
    } catch (err) {
      this._toast(err.message || String(err));
    }
    await this._load();
  }

  async _itemVisible(id, visible) {
    try {
      await this._ws("item_visible", { item_id: id, visible });
      await this._load();
    } catch (err) {
      this._toast(err.message || String(err));
    }
  }

  async _dropPin(pin, cx, cy) {
    const t = this._t;
    const room = this.shadowRoot
      .elementsFromPoint(cx, cy)
      .map((e) => e.closest?.(".room[data-area]"))
      .find((r) => r && !r.classList.contains("detected") && !r.classList.contains("pending"));
    if (!room) {
      this._toast(t.dropOnRoom);
      return;
    }
    const rect = room.getBoundingClientRect();
    try {
      const r = await this._ws("place_item", {
        item_id: pin.dataset.id,
        kind: pin.dataset.kind,
        area_id: room.dataset.area,
        x: (cx - rect.left) / rect.width,
        y: (cy - rect.top) / rect.height,
      });
      if (r.moved_room) this._toast(t.movedTo(pin.dataset.name, room.dataset.name));
    } catch (err) {
      this._toast(err.message || String(err));
    }
    await this._load();
  }

  async _mapAction(act, el) {
    const t = this._t;
    const key = el.closest("[data-floor]")?.dataset.floor ?? "";
    const floorId = key || null;
    const floor = this._data.map.floors.find((f) => this._floorKey(f) === key);
    if (act === "map-edit") {
      this._edit = !this._edit;
      this._pending = null;
      this._renderList();
      return;
    }
    if (act === "map-open") {
      if (this._edit) return;
      const entity = el.dataset.entity;
      if (entity) {
        if (this._tap && TOGGLE_DOMAINS.has(entity.split(".")[0])) {
          await this._hass.callService("homeassistant", "toggle", { entity_id: entity });
        } else {
          this._moreInfo(entity);
        }
        return;
      }
      if (el.dataset.kind === "device") {
        history.pushState(null, "", `/config/devices/device/${el.dataset.id}`);
        window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
      } else {
        this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId: el.dataset.id } }));
      }
      return;
    }
    if (act === "map-icon-cancel") {
      this._iconFor = null;
      this._renderList();
      return;
    }
    if (act === "map-icon-apply" || act === "map-icon-reset") {
      const mdi = act === "map-icon-apply" ? this.shadowRoot.querySelector("#icon-mdi").value.trim() : null;
      try {
        await this._ws("item_icon", { item_id: this._iconFor.id, ...(mdi ? { mdi } : {}) });
        this._iconFor = null;
        await this._load();
      } catch (err) {
        this._toast(err.message || String(err));
      }
      return;
    }
    if (act === "map-show") {
      await this._itemVisible(el.dataset.id, true);
      return;
    }
    if (act === "map-add-room") {
      // touch friendly: a medium room at the first free spot, then pick which room it is
      this._pending = { floor: key, ...this._freeSpot(key, floor.rows) };
      this._renderList();
      this.shadowRoot.querySelector("#pending-area")?.scrollIntoView({ block: "center" });
      return;
    }
    if (act === "map-cancel-pending") {
      this._pending = null;
      this._renderList();
      return;
    }
    if (act === "map-copy") {
      try {
        await navigator.clipboard.writeText(el.dataset.copy);
        this._toast(t.copied);
      } catch (err) {
        const range = document.createRange();
        range.selectNodeContents(el.parentElement.querySelector("code"));
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      return;
    }
    this._busy = true;
    try {
      if (act === "map-remove-image") {
        await this._ws("remove_floor_image", { floor_id: floorId });
      } else if (act === "map-rows-plus" || act === "map-rows-minus") {
        await this._ws("floor_plan", { floor_id: floorId, rows: floor.rows + (act === "map-rows-plus" ? 1 : -1) });
      } else if (act === "map-detect") {
        this._detecting = key;
        this._renderList();
        const image = await this._gridded(key, floor.rows);
        const r = await this._ws("detect_plan", { floor_id: floorId, image });
        if (!r.rooms.length) this._toast(t.empty);
      } else if (act === "map-unplace") {
        await this._ws("position", { area_id: el.closest(".room").dataset.area, position: null });
      } else if (act === "map-place-unplaced") {
        const pos = this._freeSpot(key, floor.rows);
        await this._ws("place_rooms", { floor_id: floorId, rooms: [{ area_id: el.dataset.area, ...pos }] });
      } else if (act === "map-place-pending") {
        const areaId = this.shadowRoot.querySelector("#pending-area").value || null;
        const name = this.shadowRoot.querySelector("#pending-name").value.trim() || null;
        if (!areaId && !name) return;
        const { x, y, w, h } = this._pending;
        await this._ws("place_rooms", { floor_id: floorId, rooms: [{ area_id: areaId, name, x, y, w, h }] });
        this._pending = null;
      } else if (act === "map-accept-detected") {
        const rooms = [];
        el.closest(".card").querySelectorAll(".detrow").forEach((row) => {
          if (!row.querySelector('[data-f="take"]').checked) return;
          const d = floor.detected[Number(row.dataset.i)];
          rooms.push({
            area_id: row.querySelector('[data-f="area"]').value || null,
            name: row.querySelector('[data-f="name"]').value.trim() || d.name,
            x: d.x,
            y: d.y,
            w: d.w,
            h: d.h,
          });
        });
        if (rooms.length) await this._ws("place_rooms", { floor_id: floorId, rooms, detected: true });
        else await this._ws("discard_detected", { floor_id: floorId });
      } else if (act === "map-discard-detected") {
        await this._ws("discard_detected", { floor_id: floorId });
      }
      this._detecting = null;
      await this._load();
    } catch (err) {
      this._toast(err.message || String(err));
      if (this._detecting !== null) {
        this._detecting = null;
        this._renderList();
      }
    } finally {
      this._busy = false;
    }
  }

  _areaOptions(selected) {
    const t = this._t;
    let html = `<option value="">${esc(t.noArea)}</option>`;
    let floor;
    for (const a of this._data.areas) {
      if (a.floor !== floor) {
        if (floor !== undefined) html += "</optgroup>";
        floor = a.floor;
        html += `<optgroup label="${esc(a.floor ?? "–")}">`;
      }
      html += `<option value="${esc(a.area_id)}" ${a.area_id === selected ? "selected" : ""}>${esc(a.name)}</option>`;
    }
    return html + (floor !== undefined ? "</optgroup>" : "");
  }

  _entityRow(e) {
    const t = this._t;
    const cur = e.current;
    const pro = e.proposed;
    const changed = pro.remove || pro.exposed !== cur.exposed || pro.aliases.join("|") !== cur.aliases.join("|");
    const reasons = e.reasons.map((r) => this._reason(r)).join(" · ");
    return `<div class="entity ${changed ? "changed" : ""}" data-entity="${esc(e.entity_id)}">
      <label class="check"><input type="checkbox" data-f="exposed" ${pro.exposed ? "checked" : ""}> ${esc(t.exposed)}</label>
      <div class="ename"><b>${e.what ? kindIcon(e.what) + " " : ""}${esc(e.title)}</b><span class="muted">${esc(e.entity_id)}</span>
        ${reasons ? `<span class="reason">${esc(reasons)}</span>` : ""}</div>
      <input data-f="aliases" placeholder="${esc(t.aliases)}" value="${esc(pro.aliases.join(", "))}">
      ${pro.remove || e.reasons.some((r) => r.code === "orphaned")
        ? `<label class="check danger"><input type="checkbox" data-f="remove" ${pro.remove ? "checked" : ""}> ${esc(t.remove)}</label>`
        : ""}
    </div>`;
  }

  _changesHtml(p) {
    const t = this._t;
    const lines = [];
    const areaName = (id) => (id ? this._areaName(id) : "–");
    if (p.proposed.area_id !== p.current.area_id) lines.push(["📍", t.changeRaum(areaName(p.current.area_id), areaName(p.proposed.area_id))]);
    else if (p.flags.includes("area_missing")) lines.push(["📍", t.needRoom, "need"]);
    if (p.proposed.name !== p.current.name) lines.push(["✏️", t.changeName(p.current.name || p.title, p.proposed.name || p.title)]);
    else if (p.flags.includes("name_technical")) lines.push(["✏️", t.needName, "need"]);
    if (p.flags.includes("speaker")) lines.push(["🎙️", t.speakerNoRoom, "need"]);
    const list = (rows) => {
      const names = rows.map((e) => e.title);
      return names.slice(0, 3).join(", ") + (names.length > 3 ? ` (+${names.length - 3})` : "");
    };
    const hide = p.entities.filter((e) => e.current.exposed && !e.proposed.exposed);
    const show = p.entities.filter((e) => !e.current.exposed && e.proposed.exposed);
    if (hide.length) lines.push(["🙈", t.hideFor(list(hide))]);
    if (show.length) lines.push(["🗣️", t.showFor(list(show))]);
    for (const e of p.entities) {
      if (e.proposed.aliases.join("|") !== e.current.aliases.join("|") && e.proposed.aliases.length) {
        lines.push(["🏷️", t.aliasesSet(e.proposed.aliases.join(", "))]);
      }
    }
    if (!lines.length) lines.push(["✓", t.nothingChanges]);
    return `<ul class="changes">${lines.map(([i, txt, cls]) => `<li class="${cls || ""}"><span>${i}</span>${esc(txt)}</li>`).join("")}</ul>`;
  }

  _card(p) {
    const t = this._t;
    const meta = [t.kinds[p.what], p.manufacturer, p.model, p.integration].filter(Boolean).join(" · ");
    const notes = p.reasons.filter((r) => r.code === "llm_note").map((r) => this._reason(r));
    const changedRows = p.entities.filter(
      (e) => e.proposed.remove || e.proposed.exposed !== e.current.exposed || e.proposed.aliases.join("|") !== e.current.aliases.join("|") || e.entity_id === p.main_entity,
    );
    const otherRows = p.entities.filter((e) => !changedRows.includes(e));
    const needInput =
      (p.flags.includes("area_missing") && !p.proposed.area_id) || (p.flags.includes("name_technical") && !p.proposed.name);
    const badges = [
      p.safe ? `<span class="badge safe">${esc(t.safe)}</span>` : "",
      p.source === "llm" ? `<span class="badge ai">${esc(t.ai)}</span>` : "",
    ].join("");
    return `<div class="card prop" data-id="${esc(p.id)}">
      <div class="head"><span class="kicon">${kindIcon(p.what)}</span>
        <div class="htxt"><h2>${esc(p.title)}</h2><div class="muted">${esc(meta)}</div></div>
        <span class="grow"></span>${badges}</div>
      ${this._changesHtml(p)}
      ${notes.length ? `<div class="muted small">${esc(notes.join(" · "))}</div>` : ""}
      <details class="edit" ${needInput ? "open" : ""}><summary>${esc(t.adjust)}</summary>
        <div class="fields">
          <label>${esc(t.area)}<select data-f="area">${this._areaOptions(p.proposed.area_id)}</select></label>
          <label>${esc(t.name)}<input data-f="name" value="${esc(p.proposed.name ?? "")}" placeholder="${esc(p.title)}"></label>
        </div>
        <label class="check maptoggle"><input type="checkbox" data-f="on_map" ${p.on_map ? "checked" : ""}> 🗺️ ${esc(t.onMap)}</label>
        <div class="entities">${changedRows.map((e) => this._entityRow(e)).join("")}
          ${otherRows.length ? `<details><summary>${otherRows.length} ${esc(t.more)}</summary>${otherRows.map((e) => this._entityRow(e)).join("")}</details>` : ""}
        </div>
      </details>
      <div class="actions">
        <button data-act="accept">${esc(t.accept)}</button>
        <button data-act="not-for-assistant" class="secondary">${esc(t.notForAssistant)}</button>
        <span class="grow"></span>
        ${p.status === "open" ? `<button data-act="later" class="flat">${esc(t.postpone)}</button>` : ""}
        <button data-act="ignore" class="flat">${esc(t.ignore)}</button>
      </div>
    </div>`;
  }

  _values(card, notForAssistant) {
    const entities = {};
    card.querySelectorAll("[data-entity]").forEach((row) => {
      const aliases = row
        .querySelector('[data-f="aliases"]')
        .value.split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      entities[row.dataset.entity] = {
        exposed: notForAssistant ? false : row.querySelector('[data-f="exposed"]').checked,
        aliases,
        remove: !!row.querySelector('[data-f="remove"]')?.checked,
      };
    });
    if (notForAssistant) return { entities, on_map: false };
    return {
      area_id: card.querySelector('[data-f="area"]').value || null,
      name: card.querySelector('[data-f="name"]').value.trim() || null,
      on_map: card.querySelector('[data-f="on_map"]').checked,
      entities,
    };
  }

  async _click(ev) {
    if (this._suppressClick) {
      this._suppressClick = false;
      return;
    }
    if (ev.target.closest?.('[data-act="reload"]')) {
      location.reload();
      return;
    }
    const iconEdit = ev.target.closest?.("[data-iconedit]");
    if (iconEdit && this._edit) {
      const item = this._data.map.rooms.flatMap((r) => r.devices).find((d) => d.id === iconEdit.dataset.iconedit);
      this._iconFor = { id: iconEdit.dataset.iconedit, name: iconEdit.dataset.name, mdi: item?.icon?.mdi };
      this._renderList();
      this.shadowRoot.querySelector("#icon-mdi")?.focus();
      return;
    }
    const sensor = ev.target.closest?.("[data-more-info]");
    if (sensor) {
      this._moreInfo(sensor.dataset.moreInfo);
      return;
    }
    const hide = ev.target.closest?.("[data-hide]");
    if (hide && this._edit && !this._busy) {
      await this._itemVisible(hide.dataset.hide, false);
      return;
    }
    const el = ev.target.closest("button");
    if (!el || this._busy) return;
    if (el.id === "menu") {
      this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true }));
      return;
    }
    const nav = el.dataset.section || el.dataset.sectionGo;
    if (nav) {
      this._section = nav;
      this._search = "";
      this._edit = false;
      this._shown = PAGE;
      this._render();
      window.scrollTo({ top: 0 });
      return;
    }
    if (el.dataset.wiz || el.dataset.wizGo) {
      const steps = this._wizSteps();
      const i = this._wizIndex(steps);
      const cur = steps[i].id;
      if (el.dataset.wizGo) return this._wizGo(el.dataset.wizGo);
      if (el.dataset.wiz === "next") return this._wizGo(steps[Math.min(i + 1, steps.length - 1)].id, cur);
      if (el.dataset.wiz === "prev") return this._wizGo(steps[Math.max(i - 1, 0)].id);
      if (el.dataset.wiz === "later" || el.dataset.wiz === "finish") {
        const finish = el.dataset.wiz === "finish";
        await this._ws("wizard", finish ? { finished: true, done: cur } : { dismissed: true, pos: cur });
        this._section = "clean";
        this._edit = false;
        await this._load();
        window.scrollTo({ top: 0 });
      }
      return;
    }
    if (el.dataset.step) {
      this._step = el.dataset.step;
      this._search = "";
      this._shown = PAGE;
      this._render();
      return;
    }
    if (el.dataset.pfilter) {
      this._propFilter = el.dataset.pfilter;
      this._shown = PAGE;
      this._render();
      return;
    }
    if (el.dataset.groupToggle) {
      const g = (this._data.groups || []).find((x) => x.label_id === el.dataset.groupToggle);
      if (!g) return;
      const area = el.dataset.area;
      const area_ids = g.area_ids.includes(area) ? g.area_ids.filter((a) => a !== area) : [...g.area_ids, area];
      return this._save("group_update", { label_id: g.label_id, area_ids });
    }
    if (el.dataset.convertMember) {
      const cv = this._convert;
      const id = el.dataset.convertMember;
      cv.members = cv.members.includes(id) ? cv.members.filter((m) => m !== id) : [...cv.members, id];
      cv.preview = cv.members.length ? await this._ws("group_convert_preview", { area_id: cv.area_id, member_ids: cv.members }) : null;
      this._renderList();
      return;
    }
    if (el.dataset.editmode) {
      this._editMode = el.dataset.editmode;
      this._pending = null;
      this._iconFor = null;
      this._renderList();
      return;
    }
    if (el.dataset.devgroup) {
      this._devGroup = el.dataset.devgroup;
      this._render();
      return;
    }
    const t = this._t;
    const act = el.dataset.act;
    if (act?.startsWith("map-")) {
      if (!this._busy) await this._mapAction(act, el);
      return;
    }
    const card = el.closest("[data-id]");
    const id = card?.dataset.id;
    this._busy = true;
    try {
      if (act === "scan" || act === "scan-rules") {
        await this._ws("scan", { use_llm: act === "scan" });
      } else if (act === "more") {
        this._shown += PAGE;
        this._renderList();
        return;
      } else if (act === "apply-safe") {
        const n = this._data.proposals.filter((p) => p.safe && p.status === "open").length;
        if (!confirm(t.confirmSafe(n))) return;
        const r = await this._ws("apply_safe");
        this._toast(t.applied(r.changes));
      } else if (act === "dev-toggle") {
        const row = el.closest("[data-device]");
        await this._ws("device_disabled", { device_id: row.dataset.device, disabled: row.dataset.disabled !== "1" });
      } else if (act === "dev-delete") {
        const row = el.closest("[data-device]");
        if (!confirm(t.confirmDelete(row.dataset.name))) return;
        // HA's own removal: it asks the integration first and refuses if it may not.
        try {
          await this._hass.callWS({ type: "config/device_registry/remove", device_id: row.dataset.device });
        } catch (err) {
          if (err.code !== "unknown_command") throw err;
          await this._hass.callWS({
            type: "config/device_registry/remove_config_entry",
            device_id: row.dataset.device,
            config_entry_id: row.dataset.entry,
          });
        }
        this._toast(t.deleted(row.dataset.name));
      } else if (act === "group-add") {
        const name = this.shadowRoot.querySelector("#group-name").value.trim();
        if (!name) return;
        await this._ws("group_create", { name, area_ids: [] });
      } else if (act === "group-delete") {
        await this._ws("group_delete", { label_id: el.dataset.label });
      } else if (act === "convert-start") {
        this._convert = { area_id: el.dataset.area, name: el.dataset.name, members: [], preview: null };
        this._merge = null;
        this._renderList();
        return;
      } else if (act === "convert-cancel") {
        this._convert = null;
        this._renderList();
        return;
      } else if (act === "convert-do") {
        const cv = this._convert;
        const pick = (attr) =>
          Object.fromEntries([...this.shadowRoot.querySelectorAll(`[${attr}]`)].map((sel) => [sel.getAttribute(attr), sel.value]));
        await this._ws("group_convert", {
          area_id: cv.area_id,
          member_ids: cv.members,
          devices: pick("data-convert-dev"),
          entities: pick("data-convert-ent"),
        });
        this._toast(t.convertDone(cv.name));
        this._convert = null;
      } else if (act === "merge-start") {
        this._merge = { source: el.dataset.area, name: el.dataset.name, refs: null };
        this._renderList();
        this._merge.refs = await this._ws("area_references", { area_id: el.dataset.area });
        this._renderList();
        this.shadowRoot.querySelector("#merge-target")?.focus();
        return;
      } else if (act === "merge-cancel") {
        this._merge = null;
        this._renderList();
        return;
      } else if (act === "merge-do") {
        const target = this.shadowRoot.querySelector("#merge-target").value;
        if (!target) return;
        const targetName = this._data.map.rooms.find((x) => x.area_id === target)?.name || "";
        await this._ws("merge_areas", { source_id: this._merge.source, target_id: target });
        this._toast(t.mergedInto(this._merge.name, targetName));
        this._merge = null;
      } else if (act === "ai-room-take") {
        await this._ws("area_update", { area_id: el.dataset.area, floor_id: el.dataset.floor });
        this._toast(t.saved);
      } else if (act === "ai-rooms-all") {
        const rooms = (this._data.ai?.rooms || [])
          .filter((r) => r.confidence >= 0.4)
          .map((r) => ({ area_id: r.area_id, floor_id: r.floor_id }));
        this._toast(t.applied((await this._ws("apply_floor_plan", { rooms })).changes));
      } else if (act === "ai-dev-take") {
        await this._ws("device_area", { device_id: el.dataset.device, area_id: el.dataset.area });
        this._toast(t.saved);
      } else if (act === "ai-devs-all") {
        const items = [...this.shadowRoot.querySelectorAll('[data-act="ai-dev-take"]')].map((b) => ({
          device_id: b.dataset.device,
          area_id: b.dataset.area,
        }));
        this._toast(t.applied((await this._ws("device_areas", { items })).changes));
      } else if (act === "ai-rooms") {
        await this._ws("ai_review", { only: ["floors"] });
      } else if (act === "ai-review") {
        await this._ws("ai_review");
      } else if (act === "ai-floors-apply") {
        const taken = (sel) => [...this.shadowRoot.querySelectorAll(sel)].filter((row) => row.querySelector("[data-ai-take]").checked);
        const floors = taken("[data-ai-floor]").map((row) => {
          const level = row.querySelector("[data-ai-level]").value;
          return { floor_id: row.dataset.aiFloor, name: row.querySelector("[data-ai-name]").value.trim(), level: level === "" ? null : Number(level) };
        });
        const rooms = taken("[data-ai-room]").map((row) => ({
          area_id: row.dataset.aiRoom,
          floor_id: row.querySelector("[data-ai-room-floor]").value || null,
        }));
        const r = await this._ws("apply_floor_plan", { floors, rooms });
        this._toast(t.applied(r.changes));
      } else if (act === "ai-orphans-pick") {
        this.shadowRoot.querySelectorAll("details[data-group]").forEach((g) => {
          const yes = g.dataset.aiAdvice === "remove";
          if (yes) g.open = true;
          g.querySelectorAll("[data-orphan], [data-orphan-group]").forEach((c) => (c.checked = yes));
        });
        return;
      } else if (act === "ai-kind") {
        await this._ws("kind_override", { entity_id: el.dataset.entity, kind: el.dataset.kind });
      } else if (act === "dup-merge" || act === "dup-different") {
        const box = el.closest("[data-key]");
        if (act === "dup-merge") {
          const primary = box.querySelector("input[type=radio]:checked")?.value;
          const area = box.querySelector("[data-dup-area]")?.value;
          await this._ws("merge", { key: box.dataset.key, primary, ...(area ? { area_id: area } : {}) });
          this._toast(t.merged);
        } else {
          await this._ws("not_duplicate", { key: box.dataset.key });
        }
      } else if (act === "dup-unmerge") {
        await this._ws("unmerge", { key: el.closest("[data-key]").dataset.key });
      } else if (act === "floor-add") {
        const name = this.shadowRoot.querySelector("#floor-name").value.trim();
        const level = this.shadowRoot.querySelector("#floor-level").value;
        if (!name) return;
        await this._ws("create_floor", { name, level: level === "" ? null : Number(level) });
      } else if (act === "room-add") {
        const input = el.closest(".addrow").querySelector("[data-new-room]");
        if (!input.value.trim()) return;
        await this._ws("area_create", { name: input.value.trim(), floor_id: input.dataset.newRoom || null });
      } else if (act === "remove-orphans") {
        const ids = [...this.shadowRoot.querySelectorAll("[data-orphan]:checked")].map((c) => c.dataset.orphan);
        if (!ids.length || !confirm(t.confirmOrphans(ids.length))) return;
        const r = await this._ws("remove_orphans", { entity_ids: ids });
        this._toast(t.removed(r.removed));
      } else if (act === "undo") {
        const r = await this._ws("undo");
        this._toast(r.title ? t.undone(r) : t.nothingToUndo);
      } else if (act === "accept" || act === "not-for-assistant") {
        const values = this._values(card, act === "not-for-assistant");
        if (Object.values(values.entities).some((e) => e.remove) && !confirm(t.confirmRemove)) return;
        const r = await this._ws("apply", { proposal_id: id, values });
        card.remove();
        this._toast(t.applied(r.changes));
      } else if (act === "later" || act === "ignore" || act === "show-again") {
        const status = { later: "later", ignore: "ignored", "show-again": "open" }[act];
        await this._ws("decide", { proposal_id: id, status });
        card.remove();
      }
      await this._load();
    } catch (err) {
      const msg = err.message || String(err);
      this._toast(/already in use/i.test(msg) ? t.wiz.nameTaken : msg);
    } finally {
      this._busy = false;
    }
  }
}

const STYLE = `
  :host { display: block; min-height: 100vh; background: var(--primary-background-color); color: var(--primary-text-color);
    font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif); }
  header { display: flex; align-items: center; gap: 8px; height: 56px; padding: 0 16px; position: sticky; top: 0; z-index: 2;
    background: var(--app-header-background-color, var(--primary-color)); color: var(--app-header-text-color, #fff); }
  header h1 { font-size: 20px; font-weight: 400; margin: 0; }
  main { max-width: 1000px; margin: 0 auto; padding: 16px; }
  .grow { flex: 1; }
  .muted { color: var(--secondary-text-color); font-size: 13px; }
  .version { float: right; margin-top: -18px; }
  .info { padding: 8px 12px; border-radius: 8px; background: var(--secondary-background-color); margin-bottom: 8px; }
  .info.error { background: var(--error-color, #db4437); color: #fff; }
  button { font: inherit; cursor: pointer; border: none; border-radius: 18px; padding: 8px 16px;
    background: var(--primary-color); color: var(--text-primary-color, #fff); }
  button.secondary { background: transparent; color: var(--primary-color); border: 1px solid var(--divider-color); }
  header button.secondary { color: inherit; border-color: currentColor; }
  button.flat { background: transparent; color: var(--secondary-text-color); }
  button.icon { background: transparent; color: inherit; font-size: 20px; padding: 4px 8px; }
  button:disabled { opacity: .5; cursor: default; }
  button.wide { width: 100%; margin-top: 8px; }
  nav { display: flex; gap: 4px; margin: 12px 0; border-bottom: 1px solid var(--divider-color); flex-wrap: wrap; }
  .tab { background: transparent; color: var(--secondary-text-color); border-radius: 0; border-bottom: 2px solid transparent; }
  .tab.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
  #tools { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }
  input, select { font: inherit; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--divider-color);
    background: var(--card-background-color); color: var(--primary-text-color); box-sizing: border-box; }
  #search { min-width: 200px; flex: 1; }
  .card { background: var(--card-background-color); border-radius: 12px; padding: 16px; margin-bottom: 12px;
    box-shadow: var(--ha-card-box-shadow, 0 1px 3px rgba(0,0,0,.15)); }
  .card.row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .head { display: flex; align-items: flex-start; gap: 6px; flex-wrap: wrap; }
  .head h2 { font-size: 17px; margin: 0 0 2px; font-weight: 500; overflow-wrap: anywhere; }
  .badge { font-size: 12px; padding: 2px 8px; border-radius: 10px; background: var(--secondary-background-color); }
  .badge.safe { background: var(--success-color, #43a047); color: #fff; }
  .badge.ai { background: var(--info-color, #039be5); color: #fff; }
  .reasons { margin: 8px 0; padding-left: 18px; color: var(--secondary-text-color); font-size: 13px; }
  .fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 12px 0; }
  .fields label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--secondary-text-color); }
  .fields label.changed select, .fields label.changed input { border-color: var(--primary-color); border-width: 2px; }
  .entity { display: grid; grid-template-columns: 140px 1fr minmax(160px, 260px) auto; gap: 8px; align-items: center;
    padding: 6px 8px; border-radius: 8px; }
  .entity.changed { background: var(--secondary-background-color); }
  .ename { display: flex; flex-direction: column; min-width: 0; overflow-wrap: anywhere; }
  .reason { font-size: 12px; color: var(--primary-color); }
  .check { display: flex; gap: 6px; align-items: center; font-size: 13px; white-space: nowrap; }
  .danger { color: var(--error-color, #db4437); }
  details summary { cursor: pointer; color: var(--secondary-text-color); font-size: 13px; padding: 6px 8px; }
  .actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; align-items: center; }
  #toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); padding: 10px 18px; border-radius: 8px;
    background: var(--primary-text-color); color: var(--primary-background-color); z-index: 5; max-width: 90vw; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .maptools { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }
  .info.warn { background: var(--warning-color, #ffa600); color: #000; }
  .floor { margin-bottom: 24px; }
  .floorhead { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 8px 0; }
  .floorhead h2 { font-size: 18px; font-weight: 500; margin: 0; }
  .grid { position: relative; width: 100%; border-radius: 12px; border: 1px solid var(--divider-color);
    background: var(--card-background-color) center / 100% 100% no-repeat; overflow: hidden; }
  .grid.editing { touch-action: none; cursor: crosshair; }
  .grid.editing::after { content: ""; position: absolute; inset: 0; pointer-events: none;
    background-image: linear-gradient(to right, var(--divider-color) 1px, transparent 1px),
      linear-gradient(to bottom, var(--divider-color) 1px, transparent 1px);
    background-size: calc(100% / var(--cols)) calc(100% / var(--rows)); }
  .room { position: absolute; box-sizing: border-box; padding: 4px 6px; border: 2px solid var(--primary-color);
    border-radius: 8px; background: color-mix(in srgb, var(--card-background-color) 85%, transparent);
    overflow: hidden; display: flex; flex-direction: column; gap: 3px; font-size: 12px; z-index: 1; }
  .grid.has-image .room:not(.detected):not(.pending) { background: color-mix(in srgb, var(--card-background-color) 40%, transparent); }
  .grid.editing .room { cursor: move; }
  .room.detected { border-style: dashed; border-color: var(--info-color, #039be5); pointer-events: none;
    background: color-mix(in srgb, var(--info-color, #039be5) 15%, transparent); z-index: 2; }
  .room.pending { border-style: dashed; border-color: var(--warning-color, #ff9800); z-index: 3;
    background: color-mix(in srgb, var(--warning-color, #ff9800) 18%, transparent); }
  .roomhead { display: flex; align-items: center; gap: 4px; font-size: 13px; min-width: 0; }
  .roomhead b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .room .x { margin-left: auto; padding: 0 6px; background: transparent; color: var(--secondary-text-color); font-size: 16px; }
  .devs { display: flex; flex-wrap: wrap; gap: 3px; overflow: hidden; }
  .dev { background: var(--secondary-background-color); color: var(--primary-text-color); border-radius: 10px;
    padding: 1px 7px; font-size: 11px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .grid.editing .dev { pointer-events: none; }
  .dev.dim { opacity: .45; }
  .handle { position: absolute; right: 0; bottom: 0; width: 16px; height: 16px; cursor: nwse-resize;
    background: linear-gradient(135deg, transparent 50%, var(--primary-color) 50%); }
  .pin { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center;
    gap: 1px; padding: 0; background: transparent; color: var(--primary-text-color); max-width: 92px; z-index: 2; border-radius: 0; }
  .pin .ico { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 14px; background: var(--card-background-color); border: 1.5px solid var(--primary-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, .3); }
  .pin.spk .ico { border-color: var(--warning-color, #ff9800); }
  .pin.dim { opacity: .5; }
  .pin .lbl { font-size: 10px; line-height: 1.15; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    padding: 0 3px; border-radius: 4px; background: color-mix(in srgb, var(--card-background-color) 75%, transparent); }
  .grid.editing .pin, .tray .pin { cursor: grab; touch-action: none; }
  .pin.dragging { opacity: .25; }
  .pin .hide { position: absolute; top: -6px; right: 50%; margin-right: -22px; width: 16px; height: 16px; border-radius: 50%;
    background: var(--error-color, #db4437); color: #fff; font-size: 12px; line-height: 16px; text-align: center; }
  .ghost { position: fixed; pointer-events: none; transform: translate(-50%, -50%); z-index: 20;
    display: flex; flex-direction: column; align-items: center; }
  .ghost .ico { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    background: var(--card-background-color); border: 2px solid var(--primary-color); box-shadow: 0 2px 8px rgba(0, 0, 0, .4); }
  .ghost .lbl { font-size: 11px; background: var(--card-background-color); padding: 0 4px; border-radius: 4px; }
  .tray .pin { position: static; transform: none; }
  /* stays in view while scrolling to the floor where a device belongs */
  .tray { position: sticky; top: 108px; z-index: 6; box-shadow: 0 4px 12px rgba(0, 0, 0, .35); }
  .traylist { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; max-height: 110px; overflow: auto; padding: 4px; }
  .maptoggle { margin: 4px 0 8px; }
  .chip.dim { opacity: .7; }
  .wiz { display: flex; flex-direction: column; gap: 4px; }
  .wizhead { margin-bottom: 8px; }
  .wizbar { height: 6px; border-radius: 3px; background: var(--secondary-background-color); overflow: hidden; margin-bottom: 6px; }
  .wizbar span { display: block; height: 100%; background: var(--primary-color); transition: width .3s; }
  .wiznav { display: flex; gap: 8px; position: sticky; bottom: 0; padding: 10px 0; z-index: 3;
    background: linear-gradient(transparent, var(--primary-background-color) 30%); }
  .wiznav button { min-width: 120px; }
  .wizall summary { color: var(--secondary-text-color); }
  .wizstep { display: flex; gap: 10px; width: 100%; text-align: left; background: transparent; color: var(--primary-text-color);
    border-radius: 6px; padding: 6px 8px; }
  .wizstep span { width: 22px; color: var(--secondary-text-color); }
  .wizstep.active { background: var(--secondary-background-color); color: var(--primary-color); }
  .wizplan { padding-left: 20px; line-height: 1.6; }
  .wizai { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
  .wizsec { font-size: 15px; margin: 14px 0 6px; color: var(--secondary-text-color); font-weight: 500; }
  .wizdev { margin-bottom: 8px; }
  .wizdev > .devrow { background: var(--card-background-color); border-radius: 12px; padding: 10px 12px; border-top: none; }
  .wizdev > .card { margin: 4px 0 0 18px; }
  .roomchips { margin: 8px 0; }
  .groupcard { border-left: 4px solid var(--accent-color, #ff9800); }
  .grouprow { border-top: 1px solid var(--divider-color); padding: 8px 0; display: flex; flex-direction: column; gap: 6px; }
  .roomacts { display: flex; flex-wrap: wrap; gap: 2px; }
  /* drawn over the rooms (clicks go through), a little outside them so both borders stay visible */
  .groupframe { position: absolute; box-sizing: content-box; border: 2px dashed var(--accent-color, #ff9800); border-radius: 14px;
    pointer-events: none; z-index: 3; margin: -6px; padding: 4px; }
  .groupframe span { position: absolute; right: 10px; bottom: 4px; font-size: 11px; line-height: 16px; padding: 0 8px;
    border-radius: 8px; background: var(--accent-color, #ff9800); color: #000; white-space: nowrap; }
  .modechips { display: flex; flex-direction: column; gap: 6px; margin: 4px 0 12px; }
  .grid.editing.mode-rooms .pin { opacity: .28; pointer-events: none; z-index: 1; }
  .grid.editing.mode-rooms .pin .lbl, .grid.editing.mode-rooms .pin .hide, .grid.editing.mode-rooms .pin .iconedit { display: none; }
  .grid.editing.mode-rooms .handle, .grid.editing.mode-rooms .room .x { z-index: 5; position: absolute; }
  .grid.editing.mode-rooms .room .x { top: 2px; right: 2px; position: absolute; }
  .grid.editing.mode-rooms .handle { width: 20px; height: 20px; }
  .grid.editing.mode-devices { cursor: default; }
  .grid.editing.mode-devices .room { cursor: default; }
  .grid.editing.mode-devices .handle, .grid.editing.mode-devices .room .x { display: none; }
  .mergeform { display: flex; flex-direction: column; gap: 6px; padding: 8px; margin: 4px 0 8px; border-radius: 8px;
    background: var(--secondary-background-color); grid-column: 1 / -1; }
  .floorbody { display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: 12px; align-items: start; }
  .floorbody.nosensors { grid-template-columns: minmax(0, 1fr); }
  .sensors { background: var(--card-background-color); border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column;
    gap: 8px; max-height: 70vh; overflow: auto; font-size: 13px; }
  .sroom { display: flex; flex-direction: column; gap: 2px; border-top: 1px solid var(--divider-color); padding-top: 6px; }
  .sname { font-weight: 500; }
  .sval { display: grid; grid-template-columns: 22px minmax(0, 1fr) auto; gap: 6px; align-items: center; background: transparent;
    color: var(--primary-text-color); padding: 2px 4px; min-height: 0; border-radius: 6px; text-align: left; font-size: 13px; }
  .sval:hover { background: var(--secondary-background-color); }
  .sval .sn { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--secondary-text-color); }
  .sval .sv { font-weight: 500; white-space: nowrap; }
  .rval { font-size: 11px; color: var(--secondary-text-color); margin-left: 6px; white-space: nowrap; }
  .pin.on .ico { background: color-mix(in srgb, var(--state-active-color, #ffc107) 35%, var(--card-background-color));
    border-color: var(--state-active-color, #ffc107); box-shadow: 0 0 10px color-mix(in srgb, var(--state-active-color, #ffc107) 70%, transparent); }
  .pin .ico ha-state-icon, .pin .ico ha-icon { --mdc-icon-size: 17px; display: flex; }
  .pin .ico img { width: 20px; height: 20px; object-fit: contain; }
  .pin { -webkit-touch-callout: none; user-select: none; }
  .pin .iconedit { position: absolute; top: -6px; left: 50%; margin-left: -22px; font-size: 11px; width: 16px; height: 16px;
    line-height: 16px; text-align: center; border-radius: 50%; background: var(--card-background-color); }
  .iconform { margin-top: 8px; }
  .iconform input#icon-mdi { flex: 1; min-width: 200px; }
  .orderlist { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; margin-top: 8px; font-size: 15px; }
  .orderitem { padding: 4px 10px; border-radius: 8px; background: var(--secondary-background-color); }
  .wroom { border-top: 1px solid var(--divider-color); padding: 8px 0; display: flex; flex-direction: column; gap: 6px; }
  .wroom.aisuggest { background: color-mix(in srgb, var(--info-color, #039be5) 6%, transparent); border-radius: 8px; padding: 8px; }
  .wroomhead { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 220px); gap: 8px; align-items: center; }
  .wroomhead select, .wroomhead input { width: 100%; }
  .wdevs { display: flex; flex-wrap: wrap; gap: 4px 10px; font-size: 13px; }
  .wdev { white-space: nowrap; }
  .duproom { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--secondary-text-color); margin-top: 8px; }
  button.ai { border-color: var(--info-color, #039be5); color: var(--info-color, #039be5); }
  .ainote { margin: -4px 0 10px; }
  .ailine { display: block; font-size: 13px; margin: 4px 0; padding: 4px 8px; border-radius: 6px;
    background: color-mix(in srgb, var(--info-color, #039be5) 12%, transparent); }
  .ailine.yes { background: color-mix(in srgb, var(--success-color, #43a047) 15%, transparent); }
  .ailine.no { background: color-mix(in srgb, var(--warning-color, #ff9800) 15%, transparent); }
  .aibadge { font-size: 12px; margin-left: 6px; padding: 1px 8px; border-radius: 10px; background: var(--secondary-background-color); }
  .aibadge.remove { background: color-mix(in srgb, var(--success-color, #43a047) 25%, transparent); }
  .aibadge.keep { background: color-mix(in srgb, var(--warning-color, #ff9800) 25%, transparent); }
  .aicard { border-left: 4px solid var(--info-color, #039be5); }
  .airow { display: flex; gap: 10px; align-items: flex-start; padding: 6px 0; border-top: 1px solid var(--divider-color); }
  .devrow { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding: 6px 4px; border-top: 1px solid var(--divider-color); }
  .devrow .ename { flex: 1; min-width: 180px; }
  .orphan { display: flex; gap: 10px; align-items: flex-start; padding: 6px 4px; border-top: 1px solid var(--divider-color); }
  button.danger { color: var(--error-color, #db4437); border-color: var(--error-color, #db4437); }
  .unplaced { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 8px; }
  .chip { padding: 4px 12px; font-size: 13px; background: var(--secondary-background-color); color: var(--primary-text-color); }
  .filebtn { cursor: pointer; padding: 7px 14px; border-radius: 18px; border: 1px solid var(--divider-color); color: var(--primary-color); }
  button.small { padding: 2px 12px; font-size: 16px; }
  input.level { width: 5.5em; }
  .detrow { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin: 6px 0; }
  .note { display: flex; flex-direction: column; gap: 4px; margin: 8px 0; font-size: 13px; color: var(--secondary-text-color); }
  textarea { font: inherit; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--divider-color);
    background: var(--card-background-color); color: var(--primary-text-color); }
  summary { cursor: pointer; }
  pre.desc { white-space: pre-wrap; background: var(--secondary-background-color); padding: 12px; border-radius: 8px; font-size: 13px; }
  code.tpl { display: block; padding: 8px; background: var(--secondary-background-color); border-radius: 6px; overflow-wrap: anywhere; }
  /* sections: tabs on wide screens, bottom bar on phones */
  #tabs { border-bottom: none; margin: 4px 0 0; }
  .sections { margin: 0; flex-wrap: nowrap; display: flex; gap: 4px; padding: 0 16px; max-width: 1000px; margin: 0 auto; border-bottom: 1px solid var(--divider-color);
    background: var(--primary-background-color); position: sticky; top: 56px; z-index: 4; }
  .sections button { background: transparent; color: var(--secondary-text-color); border-radius: 0; display: flex; gap: 6px;
    align-items: center; padding: 12px 14px; border-bottom: 3px solid transparent; position: relative; }
  .sections button.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
  .sbadge { background: var(--primary-color); color: var(--text-primary-color, #fff); border-radius: 10px; font-size: 11px;
    padding: 0 6px; min-width: 18px; text-align: center; }
  .hver { opacity: .7; font-size: 12px; }
  .reloadbtn { background: var(--warning-color, #ff9800); color: #000; font-size: 13px; padding: 4px 12px; min-height: 0; }
  .hver:has(.reloadbtn) { opacity: 1; }
  .card.scan { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .running { color: var(--primary-color); }
  .steps { display: flex; gap: 6px; overflow-x: auto; padding: 4px 0 10px; scrollbar-width: thin; }
  .step { display: flex; align-items: center; gap: 6px; white-space: nowrap; background: var(--card-background-color);
    color: var(--primary-text-color); border: 1px solid var(--divider-color); padding: 8px 12px; }
  .step.active { border-color: var(--primary-color); color: var(--primary-color); box-shadow: inset 0 0 0 1px var(--primary-color); }
  .step .num { width: 20px; height: 20px; border-radius: 50%; background: var(--secondary-background-color); color: var(--secondary-text-color);
    display: inline-flex; align-items: center; justify-content: center; font-size: 12px; }
  .step .count { background: var(--warning-color, #ff9800); color: #000; border-radius: 10px; font-size: 12px; padding: 0 7px; }
  .step .ok { color: var(--success-color, #43a047); }
  .chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .chip { background: var(--card-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color);
    padding: 6px 12px; font-size: 14px; }
  .chip.active { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: var(--primary-color); }
  .kicon { font-size: 22px; width: 36px; height: 36px; flex: 0 0 36px; display: inline-flex; align-items: center; justify-content: center;
    border-radius: 10px; background: var(--secondary-background-color); }
  .kicon.small { font-size: 16px; width: 28px; height: 28px; flex-basis: 28px; }
  .head .htxt { min-width: 0; }
  .card.prop .head, .card.dup .head { align-items: center; gap: 10px; flex-wrap: nowrap; }
  .changes { list-style: none; margin: 10px 0 4px; padding: 0; display: flex; flex-direction: column; gap: 4px; }
  .changes li { display: flex; gap: 8px; align-items: baseline; }
  .changes li.need { color: var(--warning-color, #ff9800); font-weight: 500; }
  details.edit { margin-top: 8px; border-top: 1px solid var(--divider-color); padding-top: 6px; }
  details.edit > summary { color: var(--primary-color); padding: 6px 0; }
  .small { font-size: 12px; }
  .dupm { display: flex; gap: 10px; align-items: center; padding: 8px 6px; border-radius: 8px; cursor: pointer; }
  .dupm:has(input:checked) { background: var(--secondary-background-color); }
  .dupm input { width: 20px; height: 20px; }
  .roomrow { display: grid; grid-template-columns: minmax(120px, 1fr) minmax(140px, 220px) auto auto minmax(0, auto); gap: 8px; align-items: center;
    padding: 6px 0; border-top: 1px solid var(--divider-color); }
  .counts { display: flex; gap: 6px; flex-wrap: wrap; font-size: 13px; }
  .cnt { white-space: nowrap; }
  .fname { font-size: 17px; font-weight: 500; flex: 1; min-width: 140px; }
  .warnline { border-left: 4px solid var(--warning-color, #ff9800); }
  .addrow { margin-top: 8px; }
  .addrow input:not(.level) { flex: 1; min-width: 140px; }
  .devrow .devarea { max-width: 200px; }
  .devbtns { display: flex; gap: 6px; }
  .pin .twin { position: absolute; bottom: -4px; right: -6px; font-size: 11px; background: var(--card-background-color);
    border-radius: 50%; width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; }
  .pin .ico { position: relative; }
  button.inline { padding: 2px 6px; color: var(--primary-color); }
  .gridwrap { width: 100%; }
  .grid.editing { touch-action: pan-x pan-y; }
  .grid.editing .room, .grid.editing .pin, .grid.editing .handle { touch-action: none; }
  input, select, button { min-height: 36px; }
  select, input:not([type=checkbox]):not([type=radio]) { max-width: 100%; box-sizing: border-box; }
  .roomrow > * { min-width: 0; }
  .roomrow select, .roomrow input { width: 100%; }
  .steps { scrollbar-width: none; }
  .steps::-webkit-scrollbar { display: none; }
  main { overflow-x: clip; }
  input[type=checkbox], input[type=radio] { min-height: 0; }
  @media (max-width: 700px) {
    main { padding: 12px 12px 88px; }
    .sections { position: fixed; bottom: 0; top: auto; left: 0; right: 0; max-width: none; padding: 0 0 env(safe-area-inset-bottom);
      border-top: 1px solid var(--divider-color); border-bottom: none; background: var(--card-background-color); justify-content: space-around;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, .2); }
    .sections button { flex-direction: column; gap: 2px; padding: 8px 4px 10px; font-size: 12px; flex: 1; border-bottom: none; border-top: 3px solid transparent; }
    .sections button.active { border-top-color: var(--primary-color); }
    .sicon { font-size: 20px; }
    .sbadge { position: absolute; top: 4px; left: 55%; }
    #toast { bottom: 84px; }
    .tray { top: 60px; }
    .wiznav { bottom: 64px; }
    .wroomhead { grid-template-columns: 1fr; }
    .floorbody { grid-template-columns: minmax(0, 1fr); }
    .sensors { max-height: none; }
    .wiznav button { flex: 1; min-width: 0; }
    .wizdev > .card { margin-left: 6px; }
    .roomrow { grid-template-columns: 1fr 1fr; }
    .roomrow .counts { grid-column: 1 / -1; }
    .devrow .devarea { max-width: none; flex: 1; }
    .devrow .ename { flex-basis: calc(100% - 50px); }
    .devbtns { width: 100%; justify-content: flex-end; }
    .gridwrap { overflow-x: auto; }
    .gridwrap .grid { min-width: 600px; }
    .card.scan .grow { flex-basis: 100%; }
    .card.scan button { flex: 1; }
    .actions button:not(.flat) { flex: 1; }
    #tools #search { flex: 1 1 100%; min-width: 0; }
    #tools select { flex: 1 1 45%; }
    header { padding: 0 8px; gap: 6px; }
    header h1 { font-size: 18px; }
    header button { padding: 6px 10px; font-size: 14px; white-space: nowrap; }
    .entity { grid-template-columns: 1fr; }
  }
`;

// After an update the browser may load the new file while the old one is still defined: keep the old one
// running (it shows a reload hint) instead of failing.
if (!customElements.get("hauskarte-panel")) customElements.define("hauskarte-panel", HauskartePanel);
