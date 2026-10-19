// Hauskarte review panel. Plain web component, no build step.

const TEXT = {
  de: {
    title: "Hauskarte",
    scan: "Bestand prüfen",
    scanRules: "Nur Regeln",
    applySafe: "Alle sicheren übernehmen",
    undo: "Letzte Änderung zurücknehmen",
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
    showMore: "Mehr anzeigen",
    changes: "Änderungen",
    confirmSafe: (n) => `${n} sichere Vorschläge ohne Einzelprüfung übernehmen?`,
    undone: (r) => `${r.reverted} Änderungen an „${r.title}“ zurückgenommen` + (r.skipped ? `, ${r.skipped} nicht möglich` : ""),
    nothingToUndo: "Nichts zum Zurücknehmen.",
    applied: (n) => `${n} Änderungen gespeichert`,
    edit: "Grundriss bearbeiten",
    editDone: "Fertig",
    onMap: "Auf der Karte zeigen",
    wiz: {
      noDevices: "noch keine Geräte",
      more: (n) => `+${n} weitere`,
      nameTaken: "Diesen Raumnamen gibt es schon. Home Assistant erlaubt jeden Namen nur einmal – z. B. „Bad oben“ und „Bad unten“.",
      fnAsk: (n) => `🤖 Die ${n} Geräte dieses Raums durchsehen`,
    },
    aiReview: "🤖 KI-Durchsicht",
    aiAt: "KI-Durchsicht",
    aiTasks: {
      floors: "Etagen",
      duplicates: "Doppelte",
      orphans: "Verwaist",
      silent: "Ohne Lebenszeichen",
      functions: "Funktionen",
    },
    aiRunning: (task, n, total) => `KI prüft: ${task} (${n}/${total})`,
    aiNone: "Noch keine KI-Durchsicht. „🤖 KI-Durchsicht“ fragt dein Sprachmodell zu Etagen, Dubletten, Verwaistem und Geräten ohne Lebenszeichen – nacheinander, damit der Sprachassistent frei bleibt.",
    aiFloorsTitle: "🤖 KI-Vorschlag: Räume zu Etagen",
    applySelected: "Ausgewählte übernehmen",
    levelClash: "Achtung: Zwei Etagen hätten dieselbe Nummer. Bitte Nummern prüfen (0 = Erdgeschoss, höher = weiter oben) und dann anhaken.",
    aiSame: (name) => `KI: dasselbe – „${name}“ nutzen`,
    aiDifferent: "KI: verschieden",
    advice: {
      remove: "entfernen",
      keep: "behalten",
      check: "prüfen",
      disable: "deaktivieren",
      delete: "löschen",
    },
    aiAdvice: (a) => `KI: ${a}`,
    aiPick: "🤖 Nach KI auswählen",
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
    iconTip: (name) => `Eigenes Symbol für „${name}“ wählen – HA-Icon oder Bild`,
    iconMdi: "HA-Icon, z. B. mdi:ceiling-light",
    iconSearch: "Icons suchen",
    iconUpload: "Bild hochladen",
    iconReset: "Standard",
    iconApply: "Übernehmen",
    assist: {
      allStatuses: "Alle Stufen",
      summary: (seen, all) => `Der Assistent sieht ${seen} von ${all} Entitäten.`,
      sees: "👁 Sieht",
      notSees: "🚫 Sieht nicht",
      hide: "Verbergen",
      show: "Freigeben",
      hideAll: (n) => `Alle ${n} verbergen`,
      showAll: (n) => `Alle ${n} freigeben`,
      confirmAll: (n, on) => `${n} Entitäten ${on ? "für den Assistenten freigeben" : "vor dem Assistenten verbergen"}?`,
      technical: "Technische zeigen (Diagnose, ausgeblendete)",
      techLbl: "technisch",
      twinLbl: "Zweitweg einer zusammengeführten Doublette",
      loading: "Lade Entitäten …",
      none: "Nichts – mit diesen Filtern.",
      noRoom: "Ohne Raum",
      changed: (n) => `${n} geändert`,
    },
    stepInfo: {
      duplicates: "Dasselbe Gerät über zwei Systeme (z. B. Loxone und Shelly, KNX, Zigbee, MQTT). Zusammenführen heißt: Der Assistent nutzt nur die gewählte Entität, die anderen werden ausgeblendet und nicht freigegeben. Sie laufen weiter – Automationen und die Systeme selbst bleiben unberührt. Lässt sich jederzeit trennen.",
    },
    allDone: "Hier ist alles erledigt.",
    allRooms: "Alle Räume und Etagen",
    kinds: {
      light: "Licht",
      shading: "Beschattung",
      window: "Fenster",
      door: "Tür/Tor",
      socket: "Steckdose",
      switch: "Schalter",
      heating: "Heizung/Klima",
      fan: "Lüftung",
      water: "Wasser",
      lock: "Schloss",
      media: "Medien",
      voice: "Sprachgerät",
      camera: "Kamera",
      vacuum: "Sauger",
      garden: "Garten",
      contact: "Kontakt",
      motion: "Bewegung",
      alarm: "Melder",
      temperature: "Temperatur",
      humidity: "Luftfeuchte",
      energy: "Strom",
      battery: "Batterie",
      sensor: "Messwert",
      scene: "Szene",
      script: "Skript",
      automation: "Automation",
      weather: "Wetter",
      list: "Liste",
      presence: "Anwesenheit",
      button: "Taster",
      setting: "Einstellung",
      update: "Update",
      other: "Sonstiges",
    },
    allKinds: "Alle Kategorien",
    allRoomsFilter: "Alle Räume",
    withoutRoom: "Ohne Raum",
    byRoom: "nach Raum",
    byIntegration: "nach System",
    adjust: "Anpassen",
    dupTitle: (name) => `Vermutlich dasselbe: ${name}`,
    dupHistory: (n, of) => `schalten ${n} von ${of} Mal gleichzeitig (letzte 7 Tage)`,
    dupName: "gleiche Kategorie, ähnlicher Name, gleicher Raum",
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
    silent: "meldet nichts",
    st: {
      assistant: "Assistent",
      ha: "Nur HA",
      hidden: "Ausgeblendet",
      disabled: "Deaktiviert",
      legendTitle: "ⓘ Was bedeuten die Stufen?",
      legendHead: [
        "Stufe",
        "Assistent",
        "in HA sichtbar",
        "zeichnet Daten auf",
      ],
      legendNote: "Jede Stufe schließt die vorige ein: Was HA ausblendet, bekommt auch der Assistent nicht. „Deaktiviert“ spart Datenbank und Rechenzeit – Automationen, die so eine Funktion nutzen, laufen dann aber ins Leere. Am Gerät ist der Status eine Obergrenze für alle seine Funktionen; „Deaktiviert“ schaltet dort das ganze Gerät ab.",
      deviceTip: "Status für das ganze Gerät – eine Obergrenze für alle seine Funktionen. Deaktiviert = Gerät in HA abschalten.",
      confirmDevice: (n) => `„${n}“ in Home Assistant deaktivieren? Es liefert dann keine Werte mehr; Automationen damit laufen ins Leere. Rückgängig machbar.`,
      change: (name, from, to) => `${name}: ${from} → ${to}`,
      because: (r) => `Grund: ${r}`,
    },
    role: {
      control: "steuert",
      measure: "misst",
      technical: "Technik",
      other: "Sonstiges",
    },
    roleCount: {
      control: (n) => `${n} ${n === 1 ? "steuert" : "steuern"}`,
      measure: (n) => `${n} ${n === 1 ? "misst" : "messen"}`,
      technical: (n) => `${n} Technik`,
      other: (n) => `${n} sonstige`,
    },
    writes: (n) => `~${n} Werte/Tag`,
    deviceFns: (n) => `${n} Funktionen`,
    nav: {
      sections: {
        overview: "Übersicht",
        focus: "Aufräumen",
        inventory: "Bestand",
        map: "Karte",
        house: "Haus",
      },
      subs: {
        devices: "Geräte",
        functions: "Funktionen",
        duplicates: "Dubletten",
        orphans: "Verwaist",
        history: "Verlauf",
      },
    },
    ov: {
      title: "So weit bist du",
      intro: "Vier Schritte, in dieser Reihenfolge. Du kannst jederzeit aufhören – alles bleibt gespeichert und lässt sich rückgängig machen.",
      floors: "1. Etagen anlegen",
      floorsDetail: (n) => (n ? `${n} Etagen` : "noch keine Etage"),
      rooms: "2. Räume den Etagen zuordnen",
      roomsDetail: (loose, all) => (loose ? `${loose} von ${all} Räumen ohne Etage` : `alle ${all} Räume haben eine Etage`),
      plan: "3. Grundriss zeichnen (optional)",
      planDetail: (placed, all) => `${placed} von ${all} Räumen auf der Karte`,
      clean: "4. Geräte aufräumen – eins nach dem anderen",
      cleanDetail: (done, total, dups) => `${done} von ${total} erledigt${dups ? ` · ${dups} Dubletten offen` : ""}`,
      toHouse: "Zum Haus",
      toMap: "Zur Karte",
      toFocus: "Weiter aufräumen",
      toFocusDone: "Ansehen",
      glance: "Auf einen Blick",
      statAssistant: "Funktionen sieht der Assistent",
      statDups: "Dubletten offen",
      statSilent: "Geräte ohne Lebenszeichen",
      statOrphans: "verwaiste Einträge",
      toFunctions: "Was sieht der Assistent?",
      toOrphans: "Verwaiste ansehen",
      toHistory: "Verlauf",
      check: "Bestand prüfen & KI",
      checkInfo: "„Bestand prüfen“ liest alle Geräte neu ein und macht Vorschläge (mit Sprachmodell auch Räume und Namen). „KI-Durchsicht“ fragt das Modell zu Etagen, Dubletten, Verwaistem und Geräten ohne Lebenszeichen. „Was ist das?“ an jedem Gerät erklärt es und schlägt Status und Kategorie seiner Funktionen vor.",
    },
    fc: {
      room: "Raum",
      progress: (done, total, left) => `${done} von ${total} erledigt · noch ${left} offen`,
      unlater: (n) => `${n} zurückgestellte wieder zeigen`,
      dupInfo: (n) => `Zuerst die Dubletten (${n}): dasselbe Gerät über zwei Systeme. Wähle, welche Entität bleibt – die anderen werden ausgeblendet, laufen aber weiter.`,
      next: (names, n) => `Danach: ${names}${n > 3 ? ` … (${n})` : ""}`,
      roomDone: "In diesem Raum ist alles erledigt",
      allDone: "Alles erledigt",
      allDoneInfo: "Neue Geräte kommen von selbst hierher. Erledigte findest du unter Bestand → Geräte.",
      toInventory: "Zum Bestand",
      later: "Später",
      laterTip: "Für diesen Besuch zurückstellen – nichts wird gespeichert.",
      skip: "Ohne Änderung erledigt",
      skipTip: "Nichts übernehmen; die Vorschläge kommen erst wieder, wenn sich am Gerät etwas ändert.",
      apply: "Übernehmen & weiter",
      done: "Erledigt & weiter",
      marked: "Erledigt",
    },
    dc: {
      status: "Gerät",
      inDups: "Teil einer Dublette",
      reviewed: "erledigt",
      apply: (n) => `${n} Vorschläge übernehmen`,
      reset: "↺ Erneut prüfen",
      resetTip: "Wieder in die Aufräum-Liste nehmen und abgelehnte Vorschläge zurückholen.",
      standalone: (i) => `Funktionen ohne Gerät: ${i}`,
      standaloneInfo: (n) => `${n} Szenen, Skripte, Helfer … – je Funktion Raum, Status, Name`,
      suggestions: (n) => `💡 ${n} Vorschläge – angehakt wird übernommen`,
      sArea: (r) => `Raum → ${r}`,
      sName: (n) => `Name → ${n}`,
      sKind: (k) => `Kategorie → ${k}`,
      sAliases: (a) => `Aliase → ${a}`,
      sConvert: (name, d) => `„${name}“ in HA als ${d} führen – erst dann versteht der Assistent „${d} …“`,
      domains: {
        light: "Licht",
        cover: "Beschattung",
        fan: "Lüfter",
        lock: "Schloss",
        valve: "Ventil",
      },
      convertHint: (d) => `HA kennt das nur als Schalter. Als ${d} geführt versteht der Assistent „${d} …“; der Schalter bleibt dahinter, Automationen laufen weiter.`,
      convertDo: (d) => `In HA als ${d} führen`,
      converted: (id) => `In HA neu: ${id}`,
      shownAs: (id) => `In HA geführt als ${id}`,
      wraps: (id) => `Zeigt den Schalter ${id}`,
      whatSwitches: "Was schaltet das?",
    },
    dl: {
      filter: {
        "": "Alle Geräte",
        todo: "Noch nicht erledigt",
        sug: "Mit Vorschlägen",
        silent: "Ohne Lebenszeichen",
      },
      standalone: "Funktionen ohne Gerät",
    },
    fl: {
      info: "Jede Funktion mit ihrem Status: was der Sprachassistent sieht – und alles andere, auch Ausgeblendetes und Deaktiviertes. „nach Schreibrate“ zeigt, was die Datenbank am meisten füllt. Haken setzen und oben auf einen Status stellen – oder einzeln über „Anpassen“.",
      byRoom: "nach Raum",
      byWrites: "nach Schreibrate",
      selectAll: (n) => `alle ${n} gezeigten auswählen`,
      askAi: "🤖 KI zu Auswahl fragen",
    },
    house: {
      info: "Das Gerüst des Hauses: Etagen (oben → unten über die Ebene), Räume je Etage – mit den Geräten darin, damit klar ist, welches Bad welches ist –, Raumgruppen und Notizen für den Assistenten.",
      notesInfo: "Kurze Hinweise, die in die Hausbeschreibung für den Assistenten kommen.",
      aiRooms: "🤖 KI: Räume den Etagen zuordnen",
      aiRoomsInfo: "Die KI sieht sich jeden Raum mit seinen Geräten an und schlägt die Etage vor – mit Grund. Übernommen wird nur, was du anhakst.",
      aiRunning: "🤖 KI ordnet Räume zu …",
      levelClash: "Zwei Etagen haben dieselbe Ebene – dann weiß der Assistent nicht, was oben und unten ist. Ebene: oben höher, unten niedriger (Erdgeschoss 0).",
    },
    dupRoom: "Raum für die Hauptentität",
    fnAi: {
      ask: "🤖 Was ist das?",
      again: "🤖 Neu fragen",
      running: "🤖 KI sieht sich die Funktionen an …",
    },
    tele: {
      apply: "Für Auswahl setzen",
      none: "Nichts ausgewählt.",
      used: (n) => `⚠️ ${n}× in Automationen/Skripten benutzt`,
      confirmUsed: (n) => `${n} der ausgewählten Funktionen werden in Automationen oder Skripten benutzt. Deaktiviert liefern sie keine Werte mehr. Trotzdem deaktivieren?`,
    },
    devNamePh: "Name in Home Assistant, z. B. Licht Flur",
    aliasPh: "weitere Namen, mit Komma getrennt – z. B. Licht oben, Deckenlicht",
    fn: {
      title: "⚙️ Funktionen",
      kindAuto: (k) => `Kategorie: automatisch (${k})`,
      namePh: (n) => `Name – jetzt: ${n}`,
      technical: (n) => `Technische Werte (${n})`,
    },
    devNameTip: "Eigener Name für das Gerät in Home Assistant (leer = Name der Integration). Entitäten, die nach dem Gerät heißen, übernehmen ihn – so versteht ihn auch der Assistent. Rückgängig machbar.",
    originalName: (n) => `Original: ${n}`,
    del: "Löschen",
    noDelete: "Diese Integration erlaubt kein Löschen einzelner Geräte – deaktivieren oder in der Integration entfernen.",
    confirmDelete: (name) => `„${name}“ endgültig löschen? Das lässt sich nicht zurücknehmen.`,
    deleted: (name) => `„${name}“ gelöscht`,
    orphansInfo: "Verwaist = einzelne Entitäten, die keine Integration mehr liefert (das Gerät oder der Wert ist aus HA verschwunden, nur der Eintrag ist übrig). Oft nur vorübergehend: Gerät aus, Zubehör ab, Wert kommt nur bei Meldung. Drei Wege: „Entfernen“ – landet im Archiv und lässt sich dort samt Name, Raum und Aliasen wiederherstellen. „Ins Archiv“ – bleibt in HA, taucht hier aber nicht mehr auf. Oder einfach stehen lassen.",
    archiveIn: "📦 Ins Archiv",
    archiveTip: "Behalten, aber hier nicht mehr zeigen. Im Archiv jederzeit zurückholbar.",
    archiveChip: (n) => `📦 Archiv ${n}`,
    openChip: (n) => `Offen ${n}`,
    archiveInfo: "Was du behalten oder entfernt hast. Behaltenes kommt mit „Zurück in die Liste“ wieder; Entferntes legt „Wiederherstellen“ wieder an – mit Name, Raum, Aliasen und Status. Liefert die Integration es später wieder, findet sie es über dieselbe ID.",
    archiveKept: "behalten",
    archiveRemoved: "entfernt",
    archiveBack: "Zurück in die Liste",
    archiveRestore: "Wiederherstellen",
    archiveEmpty: "Das Archiv ist leer.",
    archived: (n) => `${n} ins Archiv`,
    restoredOk: "Wiederhergestellt – nach dem nächsten HA-Neustart steht es wieder als verwaist da, bis die Integration es liefert.",
    restoredNo: "Nicht nötig – der Eintrag ist schon wieder da.",
    deviceLive: "Gerät ist da, nur dieser Wert fehlt",
    deviceGone: "ganzes Gerät meldet nichts",
    integrationDown: "Integration läuft gerade nicht",
    all: "alle",
    removeSelected: "Ausgewählte entfernen",
    confirmOrphans: (n) => `${n} Entitäten aus der Registry entfernen? Sie landen im Archiv und lassen sich dort wiederherstellen.`,
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
      convert: "HA kennt es nur als Schalter",
    },
  },
  en: {
    title: "Hauskarte",
    scan: "Scan",
    scanRules: "Rules only",
    applySafe: "Apply all safe",
    undo: "Undo last change",
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
    showMore: "Show more",
    changes: "changes",
    confirmSafe: (n) => `Apply ${n} safe proposals without reviewing each?`,
    undone: (r) => `Reverted ${r.reverted} changes to “${r.title}”` + (r.skipped ? `, ${r.skipped} not possible` : ""),
    nothingToUndo: "Nothing to undo.",
    applied: (n) => `${n} changes saved`,
    edit: "Edit floor plan",
    editDone: "Done",
    onMap: "Show on map",
    wiz: {
      noDevices: "no devices yet",
      more: (n) => `+${n} more`,
      nameTaken: "This room name exists already. Home Assistant allows every name only once – e.g. “Upstairs bath” and “Downstairs bath”.",
      fnAsk: (n) => `🤖 Look through the ${n} devices of this room`,
    },
    aiReview: "🤖 AI review",
    aiAt: "AI review",
    aiTasks: {
      floors: "floors",
      duplicates: "duplicates",
      orphans: "orphaned",
      silent: "silent",
      functions: "functions",
    },
    aiRunning: (task, n, total) => `AI checks: ${task} (${n}/${total})`,
    aiNone: "No AI review yet. “🤖 AI review” asks your language model about floors, duplicates, orphaned and silent devices – one question at a time, so the voice assistant stays free.",
    aiFloorsTitle: "🤖 AI proposal: rooms to floors",
    applySelected: "Apply selected",
    levelClash: "Careful: two floors would get the same number. Please check the numbers (0 = ground floor, higher = further up), then tick.",
    aiSame: (name) => `AI: same – use “${name}”`,
    aiDifferent: "AI: different",
    advice: {
      remove: "remove",
      keep: "keep",
      check: "check",
      disable: "disable",
      delete: "delete",
    },
    aiAdvice: (a) => `AI: ${a}`,
    aiPick: "🤖 Select as AI says",
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
    iconTip: (name) => `Choose an own symbol for “${name}” – HA icon or image`,
    iconMdi: "HA icon, e.g. mdi:ceiling-light",
    iconSearch: "Find icons",
    iconUpload: "Upload picture",
    iconReset: "Default",
    iconApply: "Apply",
    assist: {
      allStatuses: "All levels",
      summary: (seen, all) => `The assistant sees ${seen} of ${all} entities.`,
      sees: "👁 Sees",
      notSees: "🚫 Does not see",
      hide: "Hide",
      show: "Expose",
      hideAll: (n) => `Hide all ${n}`,
      showAll: (n) => `Expose all ${n}`,
      confirmAll: (n, on) => `${on ? "Expose" : "Hide"} ${n} entities ${on ? "to" : "from"} the assistant?`,
      technical: "Show technical ones (diagnostic, hidden)",
      techLbl: "technical",
      twinLbl: "second path of a merged duplicate",
      loading: "Loading entities …",
      none: "Nothing – with these filters.",
      noRoom: "Without room",
      changed: (n) => `${n} changed`,
    },
    stepInfo: {
      duplicates: "The same device through two systems (e.g. Loxone and Shelly, KNX, Zigbee, MQTT). Merging means: the assistant only uses the chosen entity; the others are hidden and not exposed. They keep running – automations and the systems themselves stay untouched. Can be split again any time.",
    },
    allDone: "All done here.",
    allRooms: "All rooms and floors",
    kinds: {
      light: "Light",
      shading: "Shading",
      window: "Window",
      door: "Door/gate",
      socket: "Socket",
      switch: "Switch",
      heating: "Heating/climate",
      fan: "Ventilation",
      water: "Water",
      lock: "Lock",
      media: "Media",
      voice: "Voice device",
      camera: "Camera",
      vacuum: "Vacuum",
      garden: "Garden",
      contact: "Contact",
      motion: "Motion",
      alarm: "Detector",
      temperature: "Temperature",
      humidity: "Humidity",
      energy: "Power",
      battery: "Battery",
      sensor: "Reading",
      scene: "Scene",
      script: "Script",
      automation: "Automation",
      weather: "Weather",
      list: "List",
      presence: "Presence",
      button: "Button",
      setting: "Setting",
      update: "Update",
      other: "Other",
    },
    allKinds: "All categories",
    allRoomsFilter: "All rooms",
    withoutRoom: "No room",
    byRoom: "by room",
    byIntegration: "by system",
    adjust: "Adjust",
    dupTitle: (name) => `Probably the same: ${name}`,
    dupHistory: (n, of) => `switch together ${n} of ${of} times (last 7 days)`,
    dupName: "same category, similar name, same room",
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
    silent: "reports nothing",
    st: {
      assistant: "Assistant",
      ha: "HA only",
      hidden: "Hidden",
      disabled: "Disabled",
      legendTitle: "ⓘ What do the levels mean?",
      legendHead: [
        "Level",
        "Assistant",
        "visible in HA",
        "records data",
      ],
      legendNote: "Each level includes the one before: what HA hides, the assistant does not get either. “Disabled” saves database and CPU – automations using such a function then run into nothing. On a device the status is a ceiling for all its functions; “Disabled” switches off the whole device there.",
      deviceTip: "Status for the whole device – a ceiling for all its functions. Disabled = switch the device off in HA.",
      confirmDevice: (n) => `Disable “${n}” in Home Assistant? It sends no more values; automations using it run into nothing. Can be undone.`,
      change: (name, from, to) => `${name}: ${from} → ${to}`,
      because: (r) => `reason: ${r}`,
    },
    role: {
      control: "controls",
      measure: "measures",
      technical: "technical",
      other: "other",
    },
    roleCount: {
      control: (n) => `${n} ${n === 1 ? "controls" : "control"}`,
      measure: (n) => `${n} ${n === 1 ? "measures" : "measure"}`,
      technical: (n) => `${n} technical`,
      other: (n) => `${n} other`,
    },
    writes: (n) => `~${n} values/day`,
    deviceFns: (n) => `${n} functions`,
    nav: {
      sections: {
        overview: "Overview",
        focus: "Clean up",
        inventory: "Inventory",
        map: "Map",
        house: "House",
      },
      subs: {
        devices: "Devices",
        functions: "Functions",
        duplicates: "Duplicates",
        orphans: "Orphaned",
        history: "History",
      },
    },
    ov: {
      title: "Where you are",
      intro: "Four steps, in this order. You can stop any time – everything is kept and can be undone.",
      floors: "1. Create floors",
      floorsDetail: (n) => (n ? `${n} floors` : "no floor yet"),
      rooms: "2. Rooms to floors",
      roomsDetail: (loose, all) => (loose ? `${loose} of ${all} rooms without floor` : `all ${all} rooms have a floor`),
      plan: "3. Draw the floor plan (optional)",
      planDetail: (placed, all) => `${placed} of ${all} rooms on the map`,
      clean: "4. Clean up devices – one after the other",
      cleanDetail: (done, total, dups) => `${done} of ${total} done${dups ? ` · ${dups} duplicates open` : ""}`,
      toHouse: "To the house",
      toMap: "To the map",
      toFocus: "Continue cleaning up",
      toFocusDone: "View",
      glance: "At a glance",
      statAssistant: "functions the assistant sees",
      statDups: "duplicates open",
      statSilent: "silent devices",
      statOrphans: "orphaned entries",
      toFunctions: "What does the assistant see?",
      toOrphans: "View orphaned",
      toHistory: "History",
      check: "Scan & AI",
      checkInfo: "“Scan” reads all devices again and makes proposals (with a language model also rooms and names). “AI review” asks the model about floors, duplicates, orphaned and silent devices. “What is this?” on each device explains it and suggests status and category of its functions.",
    },
    fc: {
      room: "Room",
      progress: (done, total, left) => `${done} of ${total} done · ${left} left`,
      unlater: (n) => `show ${n} postponed again`,
      dupInfo: (n) => `Duplicates first (${n}): the same device through two systems. Choose which entity stays – the others are hidden but keep running.`,
      next: (names, n) => `Next: ${names}${n > 3 ? ` … (${n})` : ""}`,
      roomDone: "Everything in this room is done",
      allDone: "All done",
      allDoneInfo: "New devices show up here by themselves. Done ones are under Inventory → Devices.",
      toInventory: "To the inventory",
      later: "Later",
      laterTip: "Put aside for this visit – nothing is saved.",
      skip: "Done without changes",
      skipTip: "Take nothing; the proposals only come back when something about the device changes.",
      apply: "Apply & next",
      done: "Done & next",
      marked: "Done",
    },
    dc: {
      status: "Device",
      inDups: "part of a duplicate",
      reviewed: "done",
      apply: (n) => `Apply ${n} proposals`,
      reset: "↺ Check again",
      resetTip: "Back into the clean-up list, with rejected proposals.",
      standalone: (i) => `Functions without device: ${i}`,
      standaloneInfo: (n) => `${n} scenes, scripts, helpers … – room, status, name per function`,
      suggestions: (n) => `💡 ${n} proposals – ticked ones are applied`,
      sArea: (r) => `room → ${r}`,
      sName: (n) => `name → ${n}`,
      sKind: (k) => `category → ${k}`,
      sAliases: (a) => `aliases → ${a}`,
      sConvert: (name, d) => `show “${name}” as a ${d} in HA – only then the assistant understands “${d} …”`,
      domains: {
        light: "light",
        cover: "cover",
        fan: "fan",
        lock: "lock",
        valve: "valve",
      },
      convertHint: (d) => `HA only knows this as a switch. Shown as a ${d}, the assistant understands “${d} …”; the switch stays behind it, automations keep working.`,
      convertDo: (d) => `Show as ${d} in HA`,
      converted: (id) => `New in HA: ${id}`,
      shownAs: (id) => `Shown in HA as ${id}`,
      wraps: (id) => `Shows the switch ${id}`,
      whatSwitches: "What does it switch?",
    },
    dl: {
      filter: {
        "": "All devices",
        todo: "Not done yet",
        sug: "With proposals",
        silent: "Silent",
      },
      standalone: "Functions without device",
    },
    fl: {
      info: "Every function with its status: what the voice assistant sees – and everything else, hidden and disabled too. “by write rate” shows what fills the database most. Tick and set a status above – or one by one under “Adjust”.",
      byRoom: "by room",
      byWrites: "by write rate",
      selectAll: (n) => `select all ${n} shown`,
      askAi: "🤖 Ask the AI about the selection",
    },
    house: {
      info: "The frame of the house: floors (top → bottom by level), rooms per floor – with the devices in them, so it is clear which bathroom is which –, room groups and notes for the assistant.",
      notesInfo: "Short hints that go into the house description for the assistant.",
      aiRooms: "🤖 AI: rooms to floors",
      aiRoomsInfo: "The AI looks at each room with its devices and suggests the floor – with a reason. Only what you tick is applied.",
      aiRunning: "🤖 AI places rooms …",
      levelClash: "Two floors share a level – then the assistant cannot tell up from down. Level: higher above, lower below (ground floor 0).",
    },
    dupRoom: "Room for the main entity",
    fnAi: {
      ask: "🤖 What is this?",
      again: "🤖 Ask again",
      running: "🤖 The AI is looking at the functions …",
    },
    tele: {
      apply: "Set for selection",
      none: "Nothing selected.",
      used: (n) => `⚠️ used ${n}× in automations/scripts`,
      confirmUsed: (n) => `${n} of the selected functions are used in automations or scripts. Disabled, they send no values. Disable anyway?`,
    },
    devNamePh: "Name in Home Assistant, e.g. Hall light",
    aliasPh: "more names, separated by commas – e.g. ceiling light, top light",
    fn: {
      title: "⚙️ Functions",
      kindAuto: (k) => `Category: automatic (${k})`,
      namePh: (n) => `Name – now: ${n}`,
      technical: (n) => `Technical values (${n})`,
    },
    devNameTip: "Own name for the device in Home Assistant (empty = the integration's name). Entities named after the device follow – so the assistant understands it too. Can be undone.",
    originalName: (n) => `Original: ${n}`,
    del: "Delete",
    noDelete: "This integration does not allow deleting single devices – disable it or remove it in the integration.",
    confirmDelete: (name) => `Delete “${name}” for good? This cannot be undone.`,
    deleted: (name) => `“${name}” deleted`,
    orphansInfo: "Orphaned = single entities no integration provides any more (the device or value is gone from HA, only the entry is left). Often only for a while: device off, accessory unplugged, value only while reporting. Three ways: “Remove” – goes to the archive and can be restored there with name, area and aliases. “To archive” – stays in HA but no longer shows here. Or just leave it.",
    archiveIn: "📦 To archive",
    archiveTip: "Keep it, but stop showing it here. Can be brought back from the archive any time.",
    archiveChip: (n) => `📦 Archive ${n}`,
    openChip: (n) => `Open ${n}`,
    archiveInfo: "What you kept or removed. Kept items return with “Back to the list”; removed ones are created again by “Restore” – with name, area, aliases and status. If the integration provides them again later, it finds them by the same id.",
    archiveKept: "kept",
    archiveRemoved: "removed",
    archiveBack: "Back to the list",
    archiveRestore: "Restore",
    archiveEmpty: "The archive is empty.",
    archived: (n) => `${n} archived`,
    restoredOk: "Restored – after the next HA restart it shows as orphaned again until the integration provides it.",
    restoredNo: "Not needed – the entry is back already.",
    deviceLive: "device is there, only this value is missing",
    deviceGone: "the whole device reports nothing",
    integrationDown: "integration is not running",
    all: "all",
    removeSelected: "Remove selected",
    confirmOrphans: (n) => `Remove ${n} entities from the registry? They go to the archive and can be restored there.`,
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
      convert: "HA only knows it as a switch",
    },
  },
};

// Set by the release script together with manifest.json; compared with the server to spot a stale page.
const PANEL_VERSION = "0.16.1";

const KIND_ICON = {
  light: "💡", shading: "⛱️", window: "🪟", door: "🚪", socket: "🔌", switch: "🔘", heating: "🌡️", fan: "🌀",
  water: "💧", lock: "🔒", media: "🔊", voice: "🎙️", camera: "📷", vacuum: "🧹", garden: "🌱", contact: "🚪",
  motion: "🏃", alarm: "🚨", temperature: "🌡️", humidity: "💧", energy: "⚡", battery: "🔋", sensor: "📈",
  scene: "🎬", script: "📜", automation: "⚙️", weather: "⛅", list: "📝", presence: "👤", button: "🔘",
  setting: "🎚️", update: "⬆️", other: "▫️",
};
const kindIcon = (kind) => KIND_ICON[kind] || "▫️";
// Union of rectangles {x, y, w, h}: the covered cells and the outer edges (shared edges between members drop out).
const groupOutline = (rects) => {
  const xs = [...new Set(rects.flatMap((r) => [r.x, r.x + r.w]))].sort((a, b) => a - b);
  const ys = [...new Set(rects.flatMap((r) => [r.y, r.y + r.h]))].sort((a, b) => a - b);
  const inside = (i, j) =>
    i >= 0 && j >= 0 && i < xs.length - 1 && j < ys.length - 1 &&
    rects.some((r) => r.x <= xs[i] && xs[i + 1] <= r.x + r.w && r.y <= ys[j] && ys[j + 1] <= r.y + r.h);
  const cells = [];
  const h = new Map(); // y -> [x1, x2][]
  const v = new Map(); // x -> [y1, y2][]
  const add = (m, k, a, b) => (m.has(k) ? m.get(k) : m.set(k, []).get(k)).push([a, b]);
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      if (!inside(i, j)) continue;
      cells.push([xs[i], ys[j], xs[i + 1] - xs[i], ys[j + 1] - ys[j]]);
      if (!inside(i, j - 1)) add(h, ys[j], xs[i], xs[i + 1]);
      if (!inside(i, j + 1)) add(h, ys[j + 1], xs[i], xs[i + 1]);
      if (!inside(i - 1, j)) add(v, xs[i], ys[j], ys[j + 1]);
      if (!inside(i + 1, j)) add(v, xs[i + 1], ys[j], ys[j + 1]);
    }
  }
  const merge = (segs) =>
    segs.sort((a, b) => a[0] - b[0]).reduce((out, s) => {
      const last = out[out.length - 1];
      if (last && last[1] === s[0]) last[1] = s[1];
      else out.push([...s]);
      return out;
    }, []);
  const lines = [
    ...[...h].flatMap(([y, segs]) => merge(segs).map(([a, b]) => [a, y, b, y])),
    ...[...v].flatMap(([x, segs]) => merge(segs).map(([a, b]) => [x, a, x, b])),
  ];
  return { cells, lines };
};
const STATUSES = ["assistant", "ha", "hidden", "disabled"];
// a few common symbols to pick with one click in the symbol popup
const ICON_PICKS = ["mdi:ceiling-light", "mdi:lamp", "mdi:floor-lamp", "mdi:led-strip-variant", "mdi:power-socket-de", "mdi:blinds",
  "mdi:window-shutter", "mdi:radiator", "mdi:air-conditioner", "mdi:fan", "mdi:speaker", "mdi:television", "mdi:robot-vacuum",
  "mdi:water-pump", "mdi:garage", "mdi:door", "mdi:thermometer", "mdi:motion-sensor", "mdi:washing-machine", "mdi:coffee-maker"];
const STATUS_ICON = { assistant: "🗣️", ha: "🏠", hidden: "🙈", disabled: "⛔" };
const ROLE_ICON = { control: "🎛️", measure: "📈", technical: "🔧", other: "▫️" };
// the same split as status.py on the server
const CONTROL_DOMAINS = new Set(["alarm_control_panel", "button", "climate", "cover", "fan", "humidifier", "input_boolean", "input_button",
  "input_number", "input_select", "lawn_mower", "light", "lock", "media_player", "number", "remote", "scene", "script", "select", "siren",
  "switch", "text", "vacuum", "valve", "water_heater"]);
const MEASURE_DOMAINS = new Set(["binary_sensor", "camera", "device_tracker", "event", "image", "person", "sensor", "weather"]);
const roleOf = (domain, category) =>
  category ? "technical" : CONTROL_DOMAINS.has(domain) ? "control" : MEASURE_DOMAINS.has(domain) ? "measure" : "other";
// attributes for a <details> whose open state is kept across re-renders
const keepOpen = (key, open) => `data-keep="${esc(key)}" data-def="${open ? 1 : 0}" ${open ? "open" : ""}`;

// Tapping a symbol switches these directly; everything else opens Home Assistant's own controls.
const TOGGLE_DOMAINS = new Set(["light", "switch", "fan", "input_boolean", "siren", "humidifier"]);
const ACTIVE_STATES = new Set(["on", "open", "opening", "closing", "playing", "heat", "cool", "heat_cool", "auto", "dry", "fan_only", "unlocked", "unlocking"]);

const SECTIONS = ["overview", "focus", "inventory", "map", "house"];
const SECTION_ICON = { overview: "🏁", focus: "🧹", inventory: "📦", map: "🗺️", house: "🏠" };
const SUBS = ["devices", "functions", "duplicates", "orphans", "history"];
// kinds HA can show a switch as (its own "Show as"); only then does the assistant understand "light …"
const KIND_DOMAIN = { light: "light", shading: "cover", fan: "fan", lock: "lock", water: "valve" };
const SWITCH_PICKS = ["light", "socket", "shading", "fan", "heating", "water"];

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
    this._sub = "devices";
    this._devFilter = "";
    this._lazy = new Map();
    this._fnSort = "room";
    this._devGroup = "room";
    this._devKind = "";
    this._devRoom = "";
    this._edit = false;
    this._images = {};
    this._pending = null;
    this._detecting = null;
    this._search = "";
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
    // a background run just finished: lists loaded on their own fetch its results again
    if (this._wasRunning && !this._data.progress.running) this._exposure = null;
    this._wasRunning = this._data.progress.running;
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
      <div id="toast" hidden></div>
      <dialog id="icondlg"></dialog>`;
    this.shadowRoot.addEventListener("click", (ev) => this._click(ev));
    this.shadowRoot.addEventListener("input", (ev) => {
      if (ev.target.id === "icon-mdi") {
        this._iconPreview();
        return;
      }
      if (ev.target.id === "search") {
        this._search = ev.target.value.toLowerCase();
        this._renderList();
      }
    });
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" && ev.target.id === "icon-mdi") {
        ev.preventDefault(); // Enter takes the symbol instead of just closing the popup
        this.shadowRoot.querySelector('#icondlg [data-act="map-icon-apply"]')?.click();
        return;
      }
      if (ev.key === "Enter" && ev.target.id === "pending-name" && ev.target.value.trim()) {
        this.shadowRoot.querySelector('[data-act="map-place-pending"]')?.click();
      }
    });
    // a lazy card opened: build it now (toggle does not bubble, so listen while it travels down)
    this.shadowRoot.addEventListener(
      "toggle",
      (ev) => {
        if (ev.target.matches?.("details[data-lazy]") && ev.target.open) {
          this._fillLazy(ev.target.parentElement);
          this._live();
        }
      },
      true,
    );
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
      if (ev.target.id === "fsel-all") {
        this.shadowRoot.querySelectorAll("[data-fsel]").forEach((c) => (c.checked = ev.target.checked));
        return;
      }
      if (ev.target.dataset.sug !== undefined) return; // ticks are read when applying
      if (["focus-room", "dev-filter", "fn-sort"].includes(ev.target.id)) {
        const key = { "focus-room": "_focusRoom", "dev-filter": "_devFilter", "fn-sort": "_fnSort" }[ev.target.id];
        this[key] = ev.target.value;
        this._renderList();
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
      if (tg.dataset.devName !== undefined) return this._save("device_name", { device_id: tg.dataset.devName, name: tg.value });
      if (tg.dataset.devMap !== undefined) return this._save("item_visible", { item_id: tg.dataset.devMap, visible: tg.checked });
      if (tg.dataset.entArea !== undefined)
        return this._save("entity_update", { entity_id: tg.dataset.entArea, changes: { area: tg.value || null } });
      const listed = (id) => this._exposure?.entities.find((e) => e.entity_id === id) || {};
      if (tg.dataset.fnStatus !== undefined) {
        return this._setStatus([tg.dataset.fnStatus], tg.value).catch((err) => this._toast(err.message || String(err)));
      }
      if (tg.dataset.devStatus !== undefined) {
        if (tg.value === "disabled" && !confirm(t.st.confirmDevice(tg.dataset.name))) {
          this._render();
          return;
        }
        return this._save("device_status", { device_id: tg.dataset.devStatus, status: tg.value });
      }
      if (tg.dataset.fnName !== undefined) {
        const e = listed(tg.dataset.fnName);
        e.own_name = tg.value.trim() || null;
        if (e.own_name) e.name = e.own_name;
        return this._save("entity_update", { entity_id: tg.dataset.fnName, changes: { name: tg.value } });
      }
      if (tg.dataset.fnKind !== undefined) {
        const e = listed(tg.dataset.fnKind);
        e.kind_override = tg.value || null;
        if (tg.value) e.kind = tg.value;
        return this._save("entity_update", { entity_id: tg.dataset.fnKind, changes: { kind: tg.value || null } });
      }
      if (tg.dataset.alias !== undefined) {
        const aliases = [...new Set(tg.value.split(",").map((a) => a.trim()).filter(Boolean))];
        listed(tg.dataset.alias).aliases = aliases;
        return this._save("entity_aliases", { entity_id: tg.dataset.alias, aliases });
      }
      if (tg.id === "dev-kind" || tg.id === "dev-room") {
        if (tg.id === "dev-kind") this._devKind = tg.value;
        else this._devRoom = tg.value;
        this._renderList();
        return;
      }
      if (ev.target.id === "assist-status") {
        this._assistStatus = ev.target.value;
        this._renderList();
        return;
      }
      if (ev.target.id === "assist-tech") {
        this._assistTech = ev.target.checked;
        this._renderList();
        return;
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
    this._keepDetails(() => this._renderAll());
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

  // Rooms too narrow for their name show it in full on hover.
  _markCutNames() {
    this.shadowRoot?.querySelectorAll(".room[data-area]").forEach((el) => {
      const b = el.querySelector(".roomhead b");
      el.classList.toggle("cut", !!b && b.scrollWidth > b.clientWidth + 1);
    });
  }

  // Open/closed state the user chose survives re-rendering, as long as the default did not change.
  _keepDetails(render) {
    const root = this.shadowRoot;
    const opened = new Map([...root.querySelectorAll("details[data-keep]")].map((el) => [el.dataset.keep, [el.dataset.def, el.open]]));
    render();
    root.querySelectorAll("details[data-keep]").forEach((el) => {
      const prev = opened.get(el.dataset.keep);
      if (prev && prev[0] === el.dataset.def) el.open = prev[1];
    });
    this._fillLazy();
    this._live();
    requestAnimationFrame(() => this._markCutNames());
  }

  _renderList() {
    this._keepDetails(() => this._renderListNow());
  }

  _counts() {
    const d = this._data;
    const devices = d.devices.flatMap((g) => g.devices);
    // what can be gone through: devices with functions that are not hidden or switched off as a whole
    const units = devices.filter((x) => x.functions.length && x.status !== "hidden" && x.status !== "disabled");
    const fns = [...devices.flatMap((x) => x.functions), ...d.standalone.flatMap((s) => s.functions)];
    return {
      floors: d.map.floors.filter((f) => f.floor_id).length,
      loose: d.map.rooms.filter((r) => !r.floor_id).length,
      rooms: d.map.rooms.length,
      placed: d.map.rooms.filter((r) => r.position).length,
      dups: d.duplicates.length,
      queue: d.queue.length,
      unitsTotal: units.length + d.standalone.length,
      unitsDone: units.filter((x) => x.reviewed).length + d.standalone.filter((s) => s.reviewed).length,
      orphans: d.orphans.reduce((n, g) => n + g.entities.length, 0),
      silent: devices.filter((x) => x.silent).length,
      safe: d.proposals.filter((p) => p.safe && p.status === "open").length,
      assistant: fns.filter((f) => f.status === "assistant").length,
    };
  }

  _view() {
    return this._section === "inventory" ? this._sub || "devices" : this._section;
  }

  _progressHtml() {
    const t = this._t;
    const p = this._data.progress;
    let html = "";
    if (p.running) {
      const phase = p.phase === "llm" ? `${t.phaseLlm} ${p.done}/${p.total}` : p.phase === "duplicates" ? t.nav.subs.duplicates : t.phaseRules;
      html += `<div class="info running">${esc(p.phase === "ai" ? t.aiRunning(t.aiTasks[p.task] || "…", p.done + 1, p.total) : `${t.running} ${phase}`)}</div>`;
    }
    if (p.error) html += `<div class="info error">${esc(p.error)}</div>`;
    return html;
  }

  _renderAll() {
    const t = this._t;
    const d = this._data;
    const c = this._counts();
    if (!this._section) this._section = "overview";
    this._tab = this._view();
    const stale = d.version !== PANEL_VERSION;
    this.shadowRoot.querySelector("#ver").innerHTML = stale
      ? `<button data-act="reload" class="reloadbtn">${esc(t.reloadNew(d.version))}</button>`
      : esc(d.version);
    const badges = { focus: c.queue + c.dups, house: c.loose };
    this.shadowRoot.querySelector("#sections").innerHTML = SECTIONS.map(
      (sec) => `<button data-section="${sec}" class="${this._section === sec ? "active" : ""}">
        <span class="sicon">${SECTION_ICON[sec]}</span><span class="slabel">${esc(t.nav.sections[sec])}</span>
        ${badges[sec] ? `<span class="sbadge">${badges[sec]}</span>` : ""}</button>`,
    ).join("");
    this.shadowRoot.querySelector("#status").innerHTML = this._progressHtml();
    const subCount = { duplicates: c.dups, orphans: c.orphans };
    this.shadowRoot.querySelector("#tabs").innerHTML =
      this._section === "inventory"
        ? `<div class="chips subs">${SUBS.map(
            (s) => `<button data-sub="${s}" class="chip ${this._tab === s ? "active" : ""}">${esc(t.nav.subs[s])}${subCount[s] ? ` <span class="count">${subCount[s]}</span>` : ""}</button>`,
          ).join("")}</div>`
        : "";
    this.shadowRoot.querySelector("#tools").innerHTML = this._toolsHtml(c);
    const search = this.shadowRoot.querySelector("#search");
    if (search) search.value = this._search;
    this._renderList();
  }

  _roomFilter(id, selected) {
    const t = this._t;
    return `<select id="${id}"><option value="">${esc(t.allRoomsFilter)}</option>
      <option value="-" ${selected === "-" ? "selected" : ""}>${esc(t.withoutRoom)}</option>
      ${this._data.areas.map((a) => `<option value="${esc(a.area_id)}" ${selected === a.area_id ? "selected" : ""}>${esc(a.name)}${a.floor ? ` · ${esc(a.floor)}` : ""}</option>`).join("")}</select>`;
  }

  _kindFilter(kindsPresent) {
    const t = this._t;
    const sorted = [...new Set(kindsPresent)].sort((a, b) => (t.kinds[a] || a).localeCompare(t.kinds[b] || b));
    return `<select id="dev-kind"><option value="">${esc(t.allKinds)}</option>${sorted
      .map((k) => `<option value="${k}" ${this._devKind === k ? "selected" : ""}>${kindIcon(k)} ${esc(t.kinds[k] || k)}</option>`)
      .join("")}</select>`;
  }

  _toolsHtml(c) {
    const t = this._t;
    const d = this._data;
    const search = `<input id="search" type="search" placeholder="${esc(t.search)}">`;
    switch (this._tab) {
      case "focus":
        return `<label class="fld inline"><span>${esc(t.fc.room)}</span>${this._roomFilter("focus-room", this._focusRoom || "")}</label>`;
      case "devices":
        return `${search}${this._kindFilter(d.devices.flatMap((g) => g.devices.map((x) => x.kind)))}${this._roomFilter("dev-room", this._devRoom)}
          <select id="dev-filter">${["", "todo", "sug", "silent", ...STATUSES]
            .map((f) => `<option value="${f}" ${this._devFilter === f ? "selected" : ""}>${f && STATUS_ICON[f] ? `${STATUS_ICON[f]} ` : ""}${esc(t.dl.filter[f] || t.st[f])}</option>`)
            .join("")}</select>
          <div class="chips"><button data-devgroup="room" class="chip ${this._devGroup === "room" ? "active" : ""}">${esc(t.byRoom)}</button>
            <button data-devgroup="integration" class="chip ${this._devGroup === "integration" ? "active" : ""}">${esc(t.byIntegration)}</button></div>`;
      case "functions": {
        const ents = this._exposure?.entities || [];
        return `${search}${this._kindFilter(ents.map((x) => x.kind))}${this._roomFilter("dev-room", this._devRoom)}
          <select id="assist-status"><option value="">${esc(t.assist.allStatuses)}</option>
            ${STATUSES.map((st) => `<option value="${st}" ${this._assistStatus === st ? "selected" : ""}>${STATUS_ICON[st]} ${esc(t.st[st])}</option>`).join("")}</select>
          <select id="fn-sort"><option value="room">${esc(t.fl.byRoom)}</option><option value="writes" ${this._fnSort === "writes" ? "selected" : ""}>${esc(t.fl.byWrites)}</option></select>
          <label class="check"><input id="assist-tech" type="checkbox" ${this._assistTech ? "checked" : ""}> ${esc(t.assist.technical)}</label>`;
      }
      case "orphans":
        return this._archiveView
          ? this._archiveChips("entity", c.orphans)
          : `${this._archiveChips("entity", c.orphans)}
          ${d.orphans.some((g) => g.ai) ? `<button data-act="ai-orphans-pick" class="secondary ai">${esc(t.aiPick)}</button>` : ""}
          <span class="grow"></span>
          <button data-act="archive-orphans" class="secondary" title="${esc(t.archiveTip)}">${esc(t.archiveIn)}</button>
          <button data-act="remove-orphans" class="secondary danger">${esc(t.removeSelected)}</button>`;
      case "history":
        return `<span class="grow"></span><button data-act="undo" class="secondary">${esc(t.undo)}</button>`;
      default:
        return "";
    }
  }

  _renderListNow() {
    const list = this.shadowRoot.querySelector("#list");
    const views = {
      overview: () => this._overviewHtml(),
      focus: () => this._focusHtml(),
      devices: () => this._devicesHtml(),
      duplicates: () => `<div class="info">${esc(this._t.stepInfo.duplicates)}</div>${this._duplicatesHtml()}`,
      orphans: () => (this._archiveView ? this._archiveHtml("entity") : this._orphansHtml()),
      history: () => this._historyHtml(),
      house: () => this._houseHtml(),
    };
    if (this._tab === "map") return this._renderMap(list);
    if (this._tab === "functions") return this._renderFunctions(list);
    list.innerHTML = (views[this._tab] || views.overview)();
  }

  // ---- overview: where things stand and what comes next ----------------------

  _overviewHtml() {
    const t = this._t;
    const d = this._data;
    const p = d.progress;
    const c = this._counts();
    const step = (done, title, detail, go, label, primary = false) => `<div class="ovstep ${done ? "done" : ""}">
        <span class="ovmark">${done ? "✓" : "•"}</span>
        <div class="ename"><b>${esc(title)}</b><span class="muted small">${esc(detail)}</span></div>
        <button data-section-go="${go}" class="${primary ? "" : "secondary"}">${esc(label)}</button></div>`;
    const left = c.queue + c.dups;
    let html = `<div class="card"><h2>${esc(t.ov.title)}</h2><p class="muted">${esc(t.ov.intro)}</p>
      ${step(c.floors > 0, t.ov.floors, t.ov.floorsDetail(c.floors), "house", t.ov.toHouse)}
      ${step(c.floors > 0 && !c.loose, t.ov.rooms, t.ov.roomsDetail(c.loose, c.rooms), "house", t.ov.toHouse)}
      ${step(c.placed > 0, t.ov.plan, t.ov.planDetail(c.placed, c.rooms), "map", t.ov.toMap)}
      ${step(!left, t.ov.clean, t.ov.cleanDetail(c.unitsDone, c.unitsTotal, c.dups), "focus", left ? t.ov.toFocus : t.ov.toFocusDone, !!left)}
      </div>`;
    html += `<div class="card"><h2>${esc(t.ov.glance)}</h2><div class="ovstats">
      <div><b>${c.assistant}</b><span class="muted small">${esc(t.ov.statAssistant)}</span></div>
      <div><b>${c.dups}</b><span class="muted small">${esc(t.ov.statDups)}</span></div>
      <div><b>${c.silent}</b><span class="muted small">${esc(t.ov.statSilent)}</span></div>
      <div><b>${c.orphans}</b><span class="muted small">${esc(t.ov.statOrphans)}</span></div></div>
      <div class="row"><button data-go-sub="functions" class="secondary">${esc(t.ov.toFunctions)}</button>
        <button data-go-sub="orphans" class="secondary">${esc(t.ov.toOrphans)}</button>
        <button data-go-sub="history" class="flat">${esc(t.ov.toHistory)}</button></div></div>`;
    const when = (iso) => new Date(iso).toLocaleString(this._hass.language);
    html += `<div class="card"><h2>${esc(t.ov.check)}</h2>
      <div class="muted">${d.last_scan ? `${esc(t.lastScan)}: ${esc(when(d.last_scan))}` : esc(t.neverScanned)}
        ${d.llm ? (d.ai?.at ? `<br>${esc(t.aiAt)}: ${esc(when(d.ai.at))}` : `<br>${esc(t.aiNone)}`) : `<br>${esc(t.noLlm)}`}</div>
      <div class="row">
        <button data-act="scan" ${p.running ? "disabled" : ""}>${esc(t.scan)}</button>
        ${d.llm ? `<button data-act="ai-review" class="secondary ai" ${p.running ? "disabled" : ""}>${esc(t.aiReview)}</button>` : ""}
        <button data-act="scan-rules" class="secondary" ${p.running ? "disabled" : ""}>${esc(t.scanRules)}</button>
        ${c.safe ? `<button data-act="apply-safe" class="secondary" ${p.running ? "disabled" : ""}>${esc(t.applySafe)} (${c.safe})</button>` : ""}</div>
      <p class="muted small">${esc(t.ov.checkInfo)}</p></div>`;
    html += `<details class="card" ${keepOpen("desc", false)}><summary><b>${esc(t.description)}</b></summary>${this._descriptionHtml(true)}</details>`;
    return html;
  }

  // ---- clean up: one thing at a time -------------------------------------------

  _focusHtml() {
    const t = this._t;
    const d = this._data;
    const c = this._counts();
    const devices = new Map(d.devices.flatMap((g) => g.devices.map((x) => [x.unit, { ...x, integration: g.integration }])));
    const standalone = new Map(d.standalone.map((s) => [s.unit, s]));
    const later = this._later || (this._later = new Set());
    const room = this._focusRoom || "";
    const inRoom = (u) => {
      const x = devices.get(u);
      if (!room) return true;
      if (!x) return room === "-";
      return room === "-" ? !x.area_id : x.area_id === room;
    };
    const units = d.queue.filter((u) => !later.has(u) && inRoom(u));
    const dups = room ? [] : d.duplicates.filter((g) => !later.has(`dup:${g.key}`));
    const pct = c.unitsTotal ? Math.round((c.unitsDone / c.unitsTotal) * 100) : 100;
    const roomDevices = room ? units.map((u) => devices.get(u)).filter(Boolean) : [];
    let html = `<div class="card fchead"><div class="wizbar"><span style="width:${pct}%"></span></div>
      <div class="row"><span class="muted">${esc(t.fc.progress(c.unitsDone, c.unitsTotal, dups.length + units.length))}</span><span class="grow"></span>
        ${roomDevices.length > 1 ? this._fnAiBar(roomDevices) : ""}
        ${later.size ? `<button data-act="focus-unlater" class="flat">${esc(t.fc.unlater(later.size))}</button>` : ""}</div></div>`;
    if (dups.length) {
      html += `<div class="info">${esc(t.fc.dupInfo(dups.length))}</div>
        <div data-unit="dup:${esc(dups[0].key)}">${this._dupCard(dups[0], true)}
          <div class="actions"><button data-act="unit-later" class="flat" title="${esc(t.fc.laterTip)}">${esc(t.fc.later)}</button></div></div>`;
    } else if (units.length) {
      const u = units[0];
      html += devices.has(u) ? this._deviceCard(devices.get(u), true) : this._standaloneCard(standalone.get(u), true);
      const next = units.slice(1, 4).map((n) => devices.get(n)?.name || standalone.get(n)?.integration || n);
      if (next.length) html += `<p class="muted small">${esc(t.fc.next(next.join(" · "), units.length - 1))}</p>`;
    } else {
      html += `<div class="card done"><h2>🎉 ${esc(room ? t.fc.roomDone : t.fc.allDone)}</h2><p class="muted">${esc(t.fc.allDoneInfo)}</p>
        <div class="row"><button data-go-sub="devices" class="secondary">${esc(t.fc.toInventory)}</button>
          <button data-section-go="map" class="secondary">${esc(t.ov.toMap)}</button></div></div>`;
    }
    return html;
  }

  _focusFoot(n) {
    const t = this._t;
    return `<div class="actions focusfoot">
      <button data-act="unit-later" class="flat" title="${esc(t.fc.laterTip)}">${esc(t.fc.later)}</button>
      <span class="grow"></span>
      ${n ? `<button data-act="unit-skip" class="secondary" title="${esc(t.fc.skipTip)}">${esc(t.fc.skip)}</button>` : ""}
      <button data-act="unit-done">${esc(n ? t.fc.apply : t.fc.done)}</button></div>`;
  }

  // ---- the device card: one component for clean-up and inventory ------------

  _deviceCard(x, focus = false) {
    const t = this._t;
    const sugs = x.suggestions || [];
    const where = [t.kinds[x.kind], x.model, x.integration].filter(Boolean).join(" · ");
    const flags = [
      x.silent ? `<span class="reason danger">${esc(t.silent)}</span>` : "",
      x.in_duplicates ? `<span class="reason">${esc(t.dc.inDups)}</span>` : "",
      x.reviewed && !focus ? `<span class="reason ok">✓ ${esc(t.dc.reviewed)}</span>` : "",
    ].join("");
    const main = x.functions.filter((f) => !f.technical);
    const tech = x.functions.filter((f) => f.technical);
    const used = main.filter((f) => f.status === "assistant").map((f) => f.name);
    const roles = ["control", "measure", "technical", "other"]
      .map((r) => [r, x.functions.filter((f) => f.role === r).length])
      .filter(([, n]) => n)
      .map(([r, n]) => t.roleCount[r](n))
      .join(" · ");
    return `<div class="card devcard ${focus ? "focus" : ""}" data-device="${esc(x.device_id)}" data-unit="${esc(x.unit)}"
        data-entry="${esc(x.config_entry_id || "")}" data-name="${esc(x.name)}">
      <div class="dchead"><span class="kicon">${kindIcon(x.kind)}</span>
        <div class="ename">${this._devNameField(x)}<span class="muted small">${esc(where)}</span>${flags}</div></div>
      ${x.what ? `<div class="what">🤖 ${esc(x.what)}</div>` : ""}
      ${x.ai ? `<div class="ailine ${x.ai.advice === "keep" ? "no" : "yes"}">🤖 ${esc(t.aiAdvice(t.advice[x.ai.advice]))} · ${esc(x.ai.reason)}</div>` : ""}
      <div class="dcrow">
        <label class="fld"><span>${esc(t.area)}</span><select data-dev-area="${esc(x.device_id)}" class="devarea">${this._areaOptions(x.area_id || "")}</select></label>
        <label class="fld" title="${esc(t.st.deviceTip)}"><span>${esc(t.dc.status)}</span>
          <select class="stsel" data-dev-status="${esc(x.device_id)}" data-name="${esc(x.name)}">${this._statusOptions(x.status || "ha")}</select></label>
        <label class="check"><input type="checkbox" data-dev-map="${esc(x.device_id)}" ${x.on_map ? "checked" : ""}> 🗺️ ${esc(t.onMap)}</label>
        <span class="grow"></span>${this._fnAiBar([x])}
      </div>
      ${this._suggestionsHtml(sugs, x.functions, x.unit)}
      <details class="fns" ${keepOpen(`fn:${x.device_id}`, focus)}><summary>${esc(`${t.fn.title} · ${t.deviceFns(x.functions.length)}: ${roles}`)}${used.length ? ` · 🗣️ ${esc(used.join(", "))}` : ""}</summary>
        ${this._statusLegend(x.unit)}
        ${main.map((f) => this._fnRow(f)).join("")}
        ${tech.length ? `<details ${keepOpen(`fntech:${x.device_id}`, false)}><summary class="muted small">${esc(t.fn.technical(tech.length))}</summary>${tech.map((f) => this._fnRow(f)).join("")}</details>` : ""}
      </details>
      ${focus ? this._focusFoot(sugs.length) : this._listFoot(x, sugs.length)}
    </div>`;
  }

  _listFoot(x, n) {
    const t = this._t;
    return `<div class="actions">
      ${n ? `<button data-act="unit-apply">${esc(t.dc.apply(n))}</button>` : ""}
      ${x.reviewed ? `<button data-act="unit-reset" class="flat" title="${esc(t.dc.resetTip)}">${esc(t.dc.reset)}</button>` : ""}
      <span class="grow"></span>
      ${x.device_id ? `<button data-act="dev-delete" class="flat danger" ${x.deletable ? "" : `disabled title="${esc(t.noDelete)}"`}>${esc(t.del)}</button>` : ""}</div>`;
  }

  // Functions without a device (scenes, scripts, helpers …) of one integration.
  _standaloneCard(s, focus = false) {
    const t = this._t;
    return `<div class="card devcard ${focus ? "focus" : ""}" data-unit="${esc(s.unit)}">
      <div class="dchead"><span class="kicon">🧩</span>
        <div class="ename"><b>${esc(t.dc.standalone(s.integration))}</b><span class="muted small">${esc(t.dc.standaloneInfo(s.functions.length))}</span></div></div>
      ${this._suggestionsHtml(s.suggestions || [], s.functions, s.unit)}
      <details class="fns" ${keepOpen(`fn:${s.unit}`, focus)}><summary>${esc(`${t.fn.title} · ${t.deviceFns(s.functions.length)}`)}</summary>
        ${this._statusLegend(s.unit)}${s.functions.map((f) => this._fnRow(f, true)).join("")}</details>
      ${focus ? this._focusFoot((s.suggestions || []).length) : this._listFoot(s, (s.suggestions || []).length)}
    </div>`;
  }

  // Everything suggested for a unit, from rules and AI, each with a tick.
  _suggestionsHtml(sugs, functions, unit) {
    const t = this._t;
    if (!sugs.length) return "";
    const fn = (id) => functions.find((f) => f.entity_id === id) || { name: id, status: "ha" };
    const rows = sugs.map((s) => {
      const f = s.entity_id ? fn(s.entity_id) : null;
      const who = f ? `${f.name}: ` : "";
      let icon = "💡";
      let text = "";
      if (s.type === "area") [icon, text] = ["📍", `${who}${t.dc.sArea(this._areaName(s.value))}`];
      else if (s.type === "name") [icon, text] = ["✏️", `${who}${t.dc.sName(s.value)}`];
      else if (s.type === "status") [icon, text] = [`${STATUS_ICON[f.status]}→${STATUS_ICON[s.value]}`, `${who}${t.st[f.status]} → ${t.st[s.value]}`];
      else if (s.type === "kind") [icon, text] = [kindIcon(s.value), `${who}${t.dc.sKind(t.kinds[s.value] || s.value)}`];
      else if (s.type === "convert") [icon, text] = ["💡", t.dc.sConvert(f.name, t.dc.domains[s.value] || s.value)];
      else if (s.type === "aliases") [icon, text] = ["🏷️", `${who}${t.dc.sAliases(s.value.join(", "))}`];
      const why = s.reason || (s.reasons || []).map((r) => this._reason(r)).join(" · ");
      const ai = s.source === "ai" || s.source === "llm";
      return `<label class="sug"><input type="checkbox" data-sug="${esc(`${unit}|${s.id}`)}" ${s.type === "convert" ? "" : "checked"}><span class="sicon">${icon}</span>
        <span>${esc(text)}${ai ? " 🤖" : ""}${why ? `<span class="muted small"> – ${esc(why)}</span>` : ""}</span></label>`;
    });
    return `<div class="sugs"><div class="sugshead">${esc(t.dc.suggestions(sugs.length))}</div>${rows.join("")}</div>`;
  }

  // ---- inventory: devices ------------------------------------------------------

  _devicesHtml() {
    const t = this._t;
    const s = this._search;
    const all = this._data.devices.flatMap((g) => g.devices.map((x) => ({ ...x, integration: g.integration, entryTitle: g.title })));
    const f = this._devFilter || "";
    const shown = all.filter(
      (x) =>
        (!f ||
          (f === "todo" && !x.reviewed && x.functions.length) ||
          (f === "sug" && x.suggestions?.length) ||
          (f === "silent" && x.silent) ||
          x.status === f) &&
        (!this._devKind || x.kind === this._devKind) &&
        (!this._devRoom || (this._devRoom === "-" ? !x.area_id : x.area_id === this._devRoom)) &&
        (!s || [x.name, x.model, x.area, x.integration, x.entryTitle, t.kinds[x.kind]].join(" ").toLowerCase().includes(s)),
    );
    const groups = new Map();
    for (const x of shown) {
      const key = this._devGroup === "integration" ? x.integration : x.area || t.withoutRoom;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(x);
    }
    const ordered = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    // functions without a device: per integration, only without a device filter (they have no kind or room)
    const standalone =
      f === "silent" || STATUSES.includes(f) || this._devKind || this._devRoom
        ? []
        : this._data.standalone.filter(
            (u) => (f !== "todo" || !u.reviewed) && (f !== "sug" || u.suggestions?.length) && (!s || u.integration.toLowerCase().includes(s)),
          );
    if (!ordered.length && !standalone.length) return `<p class="muted">${esc(t.empty)}</p>`;
    this._lazy = new Map();
    const open = ordered.length <= 3 || !!s || !!f || !!this._devKind || !!this._devRoom;
    return (
      ordered
        .map(
          ([key, items]) => `<details class="card" ${keepOpen(`devs:${key}`, open)}>
          <summary><b>${esc(key)}</b> · ${items.length}</summary>
          ${items.sort((a, b) => a.name.localeCompare(b.name)).map((x) => this._deviceItem(x)).join("")}</details>`,
        )
        .join("") +
      (standalone.length
        ? `<details class="card" ${keepOpen("devs:standalone", open)}><summary><b>${esc(t.dl.standalone)}</b> · ${standalone.length}</summary>
          ${standalone.map((u) => this._standaloneItem(u)).join("")}</details>`
        : "")
    );
  }

  // A compact line; opened it is the same card as in clean-up.
  _deviceItem(x) {
    const t = this._t;
    const n = x.suggestions?.length || 0;
    const key = `dev:${x.device_id}`;
    this._lazy.set(key, () => this._deviceCard(x));
    return `<details class="devitem" data-lazy="${esc(key)}" ${keepOpen(key, false)}>
      <summary><span class="kicon small">${kindIcon(x.kind)}</span><span class="grow"><b>${esc(x.name)}</b>
        <span class="muted small">${esc([this._devGroup === "integration" ? x.area : x.integration, x.model].filter(Boolean).join(" · "))}</span></span>
        ${x.status ? `<span title="${esc(t.st[x.status])}">${STATUS_ICON[x.status]}</span>` : ""}
        ${x.on_map ? `<span title="${esc(t.onMap)}">🗺️</span>` : ""}
        ${x.silent ? `<span class="reason danger">${esc(t.silent)}</span>` : ""}
        ${n ? `<span class="count">💡${n}</span>` : ""}
        ${x.reviewed ? `<span class="ok" title="${esc(t.dc.reviewed)}">✓</span>` : ""}</summary>
      <div class="lazybody"></div></details>`;
  }

  _standaloneItem(s) {
    const t = this._t;
    const n = s.suggestions?.length || 0;
    const key = `unit:${s.unit}`;
    this._lazy.set(key, () => this._standaloneCard(s));
    return `<details class="devitem" data-lazy="${esc(key)}" ${keepOpen(key, false)}>
      <summary><span class="kicon small">🧩</span><span class="grow"><b>${esc(s.integration)}</b>
        <span class="muted small">${esc(t.dc.standaloneInfo(s.functions.length))}</span></span>
        ${n ? `<span class="count">💡${n}</span>` : ""}
        ${s.reviewed ? `<span class="ok" title="${esc(t.dc.reviewed)}">✓</span>` : ""}</summary>
      <div class="lazybody"></div></details>`;
  }

  // Fill opened lazy cards (after a render, or when one is opened).
  _fillLazy(root = this.shadowRoot) {
    root.querySelectorAll("details[data-lazy][open] > .lazybody:empty").forEach((body) => {
      const make = this._lazy.get(body.parentElement.dataset.lazy);
      if (make) body.innerHTML = make();
    });
  }

  // ---- inventory: functions (what the assistant sees, and everything else) -------

  _renderFunctions(list) {
    const t = this._t;
    const a = t.assist;
    if (!this._exposure) {
      list.innerHTML = `<div class="info">${esc(t.fl.info)}</div><p class="muted running">${esc(a.loading)}</p>`;
      if (!this._exposureLoading) {
        this._exposureLoading = true;
        this._ws("exposure").then(
          (res) => {
            this._exposure = res;
            this._exposureLoading = false;
            if (this._tab === "functions") this._render();
          },
          (err) => {
            this._exposureLoading = false;
            this._toast(err.message || String(err));
          },
        );
      }
      return;
    }
    const s = this._search;
    const all = this._exposure.entities;
    const shown = all.filter(
      (x) =>
        (this._assistTech || !x.quiet) &&
        (!this._assistStatus || x.status === this._assistStatus) &&
        (!this._devKind || x.kind === this._devKind) &&
        (!this._devRoom || (this._devRoom === "-" ? !x.area_id : x.area_id === this._devRoom)) &&
        (!s || [x.name, x.entity_id, x.area, x.floor, x.device, t.kinds[x.kind], ...x.aliases].join(" ").toLowerCase().includes(s)),
    );
    const byWrites = this._fnSort === "writes";
    if (byWrites) shown.sort((p, q) => (q.writes || 0) - (p.writes || 0));
    const limit = this._assistShown || 150;
    const row = (x) => {
      const tags = [x.twin ? `⧉ ${a.twinLbl}` : "", x.technical ? a.techLbl : ""].filter(Boolean);
      const exposed = x.status === "assistant";
      return `<div class="devrow arow"><label class="check"><input type="checkbox" data-fsel="${esc(x.entity_id)}" data-used="${x.used_in || 0}"></label>
        <span class="kicon">${kindIcon(x.kind)}</span>
        <div class="ename"><b>${STATUS_ICON[x.status]} ${esc(x.name)}</b>
          <span class="muted small">${this._fnWhat(x)}</span>
          <span class="muted small">${esc([x.entity_id, x.device].filter(Boolean).join(" · "))}</span>
          ${tags.length ? `<span class="muted small">${esc(tags.join(" · "))}</span>` : ""}
          ${x.used_in ? `<span class="reason">${esc(t.tele.used(x.used_in))}</span>` : ""}
          <details class="aliases" ${keepOpen(`edit:${x.entity_id}`, false)}><summary>✏️ ${esc(t.adjust)}${x.aliases.length ? ` · 🏷️ ${esc(x.aliases.join(", "))}` : ""}</summary>
            ${this._fnRow(x)}</details></div>
        <button data-act="assist-move" data-eid="${esc(x.entity_id)}" data-to="${exposed ? (x.hidden ? "hidden" : "ha") : "assistant"}" class="${exposed ? "flat" : "secondary"}">${esc(exposed ? a.hide : a.show)}</button></div>`;
    };
    const column = (items, title) => {
      let room;
      const rows = items
        .slice(0, limit)
        .map((x) => {
          const head = !byWrites && x.area !== room ? `<h3 class="wizsec">${esc(x.area ? (x.floor ? `${x.area} · ${x.floor}` : x.area) : a.noRoom)}</h3>` : "";
          room = x.area;
          return head + row(x);
        })
        .join("");
      return `<div class="card acol"><div class="floorhead"><h2>${esc(title)} (${items.length})</h2></div>
        ${rows || `<p class="muted">${esc(a.none)}</p>`}
        ${items.length > limit ? `<button data-act="assist-more" class="secondary wide">${esc(t.showMore)} (${items.length - limit})</button>` : ""}</div>`;
    };
    const seen = all.filter((x) => x.status === "assistant").length;
    const rendered = this._assistStatus || byWrites
      ? Math.min(shown.length, limit)
      : Math.min(shown.filter((x) => x.status === "assistant").length, limit) + Math.min(shown.filter((x) => x.status !== "assistant").length, limit);
    const bulk = `<div class="card row bulkbar"><label class="check"><input type="checkbox" id="fsel-all"> ${esc(t.fl.selectAll(rendered))}</label>
      <span class="grow"></span><select id="fsel-status" class="stsel">${this._statusOptions("hidden")}</select>
      <button data-act="fsel-apply" class="secondary">${esc(t.tele.apply)}</button>
      ${this._data.llm ? `<button data-act="fsel-ai" class="secondary ai" ${this._data.progress.running ? "disabled" : ""}>${esc(t.fl.askAi)}</button>` : ""}</div>`;
    const cols =
      this._assistStatus || byWrites
        ? `<div class="acols one">${column(shown, this._assistStatus ? `${STATUS_ICON[this._assistStatus]} ${t.st[this._assistStatus]}` : t.fl.byWrites)}</div>`
        : `<div class="acols">${column(shown.filter((x) => x.status === "assistant"), a.sees)}${column(shown.filter((x) => x.status !== "assistant"), a.notSees)}</div>`;
    list.innerHTML = `<div class="info">${esc(t.fl.info)}</div>${this._statusLegend("functions")}<p class="muted">${esc(a.summary(seen, all.length))}</p>${bulk}${cols}`;
  }

  // ---- inventory: orphaned, history ----------------------------------------------

  _orphansHtml() {
    const t = this._t;
    const d = this._data;
    return (
      `<div class="info">${esc(t.orphansInfo)}</div>` +
      (d.orphans.length
        ? d.orphans
            .map(
              (g) => `<details class="card" data-group ${keepOpen(`orphans:${g.integration}`, false)} data-ai-advice="${g.ai?.advice || ""}">
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
        : `<p class="muted">${esc(t.empty)}</p>`)
    );
  }

  _historyHtml() {
    const t = this._t;
    const d = this._data;
    return d.history.length
      ? d.history
          .map(
            (h) => `<div class="card row"><b>${esc(h.title)}</b><span class="muted">${h.changes} ${esc(t.changes)}</span>
              <span class="grow"></span><span class="muted">${esc(new Date(h.at).toLocaleString(this._hass.language))}</span></div>`,
          )
          .join("")
      : `<p class="muted">${esc(t.empty)}</p>`;
  }

  // ---- house: floors, rooms, groups, notes ------------------------------------------

  _houseHtml() {
    const t = this._t;
    const m = this._data.map;
    const levels = m.floors.filter((f) => f.floor_id && f.level != null).map((f) => f.level);
    const clash = levels.length !== new Set(levels).size;
    const p = this._data.progress;
    const aiBar = this._data.llm
      ? `<div class="card aicard row">${p.running && p.phase === "ai"
          ? `<span class="running">${esc(t.house.aiRunning)}</span>`
          : `<button data-act="ai-rooms" class="secondary ai" ${p.running ? "disabled" : ""}>${esc(t.house.aiRooms)}</button><span class="muted grow">${esc(t.house.aiRoomsInfo)}</span>`}</div>`
      : "";
    return `<div class="info">${esc(t.house.info)}</div>${clash ? `<div class="info warn">${esc(t.house.levelClash)}</div>` : ""}${aiBar}${this._roomsHtml()}
      <details class="card" ${keepOpen("notes", false)}><summary><b>${esc(t.notes)}</b></summary>
        <p class="muted small">${esc(t.house.notesInfo)}</p>
        <label class="note">${esc(t.houseNote)}<textarea data-note="_house" rows="2">${esc(m.house_note)}</textarea></label>
        ${m.rooms.map((r) => `<label class="note">${esc(r.name)}<input data-note="${esc(r.area_id)}" value="${esc(r.note)}"></label>`).join("")}
      </details>`;
  }

  // One function (entity): what it is, its status, name, kind, aliases – and, for a switch, how HA shows it.
  // The same block wherever an entity is edited; withArea for functions without a device.
  _fnRow(e, withArea = false) {
    const t = this._t;
    const kindChoices = Object.keys(t.kinds).sort((a, b) => t.kinds[a].localeCompare(t.kinds[b]));
    const kind = e.kind_override || e.kind;
    let shownAs = "";
    if (e.wrapped_as) shownAs = `<div class="muted small">💡 ${esc(t.dc.shownAs(e.wrapped_as))}</div>`;
    else if (e.wraps) shownAs = `<div class="muted small">💡 ${esc(t.dc.wraps(e.wraps))}</div>`;
    else if (e.domain === "switch" && !e.technical && kind === "switch" && e.status !== "disabled") {
      // a plain switch: what does it switch? one click sets the category (and offers "show as" next)
      shownAs = `<div class="kindpick"><span class="muted small">${esc(t.dc.whatSwitches)}</span>
        ${SWITCH_PICKS.map((k) => `<button data-act="fn-kind-pick" data-eid="${esc(e.entity_id)}" data-kind="${k}" class="chip">${kindIcon(k)} ${esc(t.kinds[k])}</button>`).join("")}</div>`;
    } else if (e.domain === "switch" && !e.technical && KIND_DOMAIN[kind] && (e.status === "assistant" || e.status === "ha")) {
      shownAs = `<div class="ailine">💡 ${esc(t.dc.convertHint(t.dc.domains[KIND_DOMAIN[kind]]))}
        <button data-act="fn-convert" data-eid="${esc(e.entity_id)}" data-domain="${KIND_DOMAIN[kind]}" class="flat inline">${esc(t.dc.convertDo(t.dc.domains[KIND_DOMAIN[kind]]))}</button></div>`;
    }
    return `<div class="fnrow st-${e.status}">
        <div class="fnhead"><select class="stsel" data-fn-status="${esc(e.entity_id)}">${this._statusOptions(e.status)}</select>
          <span>${this._fnWhat(e)}</span>
          <span class="muted small">${esc(e.entity_id)}</span></div>
        ${shownAs}
        <div class="fnfields">
          <input data-fn-name="${esc(e.entity_id)}" value="${esc(e.own_name || "")}" placeholder="${esc(t.fn.namePh(e.name))}">
          <select data-fn-kind="${esc(e.entity_id)}"><option value="">${esc(t.fn.kindAuto(t.kinds[e.auto_kind || e.kind] || e.auto_kind || e.kind))}</option>
            ${kindChoices.map((k) => `<option value="${k}" ${e.kind_override === k ? "selected" : ""}>${kindIcon(k)} ${esc(t.kinds[k])}</option>`).join("")}</select>
          ${withArea ? `<select data-ent-area="${esc(e.entity_id)}">${this._areaOptions(e.area_id || "")}</select>` : ""}
          ${this._aliasInput(e.entity_id, e.aliases)}</div></div>`;
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

  _roomsHtml() {
    const t = this._t;
    const m = this._data.map;
    const roomRow = (r) => `<div class="roomrow">
        <input class="rname" data-area-name="${esc(r.area_id)}" value="${esc(r.name)}">
        ${this._floorSelect("data-area-floor", r.area_id, r.floor_id)}
        <span class="counts">${this._countsHtml(r.counts)}</span>
        ${r.position ? `<span class="muted" title="${esc(t.onMapShort)}">🗺️</span>` : ""}
        <span class="roomacts">${this._mergeButton(r)}${this._convertButton(r)}</span>
      </div>${r.devices.length ? `<div class="wdevs">${this._roomDevicesHtml(r)}</div>` : ""}${this._mergeForm(r)}${this._convertForm(r)}`;
    const loose = m.rooms.filter((r) => !r.floor_id);
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
      ${withRoom ? `<label class="duproom">${esc(t.dupRoom)}
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

  // Device name, editable in place; saved on Enter or when leaving the field.
  _devNameField(x) {
    const t = this._t;
    const own = x.original_name && x.name !== x.original_name;
    return `<input class="dname" data-dev-name="${esc(x.device_id)}" value="${esc(x.name)}" placeholder="${esc(t.devNamePh)}" title="${esc(t.devNameTip)}">
      ${own ? `<span class="muted small">${esc(t.originalName(x.original_name))}</span>` : ""}`;
  }

  _aliasInput(entityId, aliases) {
    return `<input class="alias" data-alias="${esc(entityId)}" value="${esc(aliases.join(", "))}" placeholder="${esc(this._t.aliasPh)}">`;
  }

  _statusOptions(selected) {
    const t = this._t;
    return STATUSES.map((s) => `<option value="${s}" ${s === selected ? "selected" : ""}>${STATUS_ICON[s]} ${esc(t.st[s])}</option>`).join("");
  }

  // The same legend wherever a status can be chosen.
  _statusLegend(where = "") {
    const t = this._t;
    const yes = (b) => (b ? "✓" : "–");
    const rows = [
      ["assistant", true, true, true],
      ["ha", false, true, true],
      ["hidden", false, false, true],
      ["disabled", false, false, false],
    ];
    return `<details class="legend" ${keepOpen(`legend:${where}`, false)}><summary>${esc(t.st.legendTitle)}</summary>
      <table class="legendtab"><tr>${t.st.legendHead.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>
        ${rows.map(([s, a, v, d]) => `<tr><td>${STATUS_ICON[s]} ${esc(t.st[s])}</td><td>${yes(a)}</td><td>${yes(v)}</td><td>${yes(d)}</td></tr>`).join("")}</table>
      <p class="muted small">${esc(t.st.legendNote)}</p></details>`;
  }

  // What a function is, in words: what it does, its value now and how much it writes.
  _fnWhat(e) {
    const t = this._t;
    const role = e.role || "other";
    const kind = t.kinds[e.kind] || e.kind || "";
    const value = e.status === "disabled" ? "" : ` · <span data-state-entity="${esc(e.entity_id)}"></span>`;
    const writes = e.writes != null ? ` · ${esc(t.writes(Number(e.writes).toLocaleString(this._hass?.language)))}` : "";
    return `<span class="fnwhat">${ROLE_ICON[role]} ${esc(t.role[role])}${kind ? ` ${esc(kind)}` : ""}</span>${value}${writes}`;
  }

  // AI for one or more devices: explain them and suggest a status per function; take the suggestions.
  _fnAiBar(devices) {
    const t = this._t;
    const d = this._data;
    if (!d.llm || !devices.length) return "";
    const ids = devices.map((x) => x.device_id).join(",");
    if (d.progress.running && d.progress.task === "functions") return `<div class="ailine running">${esc(t.fnAi.running)}</div>`;
    const asked = devices.some((x) => x.what);
    return `<div class="row aibar">
      <button data-act="ai-fn" data-devices="${esc(ids)}" class="secondary ai small" ${d.progress.running ? "disabled" : ""}>${esc(devices.length > 1 ? t.wiz.fnAsk(devices.length) : asked ? t.fnAi.again : t.fnAi.ask)}</button>
</div>`;
  }

  // One status for several functions; lists already loaded (Assistant tab, telemetry) follow at once.
  async _setStatus(ids, status) {
    const res = await this._ws("set_status", { entity_ids: ids, status });
    for (const x of this._exposure?.entities || []) if (ids.includes(x.entity_id)) this._patchStatus(x, status);
    this._toast(this._t.assist.changed(res.changes));
    await this._load();
  }

  _patchStatus(x, status) {
    x.status = status;
    x.exposed = status === "assistant";
    if (status === "assistant" || status === "ha") x.hidden = false;
    if (status === "hidden") x.hidden = true;
  }

  // Open / archive switch of the orphaned and silent steps – the same pattern as "Rejected" for proposals.
  _archiveChips(kind, open) {
    const t = this._t;
    const n = (this._data.archive || []).filter((i) => i.kind === kind).length;
    return `<div class="chips"><button data-archive-view="0" class="chip ${this._archiveView ? "" : "active"}">${esc(t.openChip(open))}</button>
      <button data-archive-view="1" class="chip ${this._archiveView ? "active" : ""}">${esc(t.archiveChip(n))}</button></div>`;
  }

  _archiveHtml(kind) {
    const t = this._t;
    const items = (this._data.archive || []).filter((i) => i.kind === kind);
    const when = (iso) => new Date(iso).toLocaleDateString(this._hass?.language);
    return `<div class="info">${esc(t.archiveInfo)}</div>
      ${items.length
        ? items
            .map(
              (i) => `<div class="card row archrow"><span>${i.how === "removed" ? "🗑️" : "📦"}</span>
                <div class="ename"><b>${esc(i.title)}</b>
                  <span class="muted small">${esc([i.kind === "entity" ? i.id : null, i.integration, `${i.how === "removed" ? t.archiveRemoved : t.archiveKept} ${when(i.at)}`].filter(Boolean).join(" · "))}</span></div>
                <span class="grow"></span>
                <button data-act="unarchive" data-key="${esc(i.key)}" class="secondary">${esc(i.how === "removed" ? t.archiveRestore : t.archiveBack)}</button></div>`,
            )
            .join("")
        : `<p class="muted">${esc(t.archiveEmpty)}</p>`}`;
  }

  // ---- start assistant ---------------------------------------------------

  _descriptionHtml() {
    const t = this._t;
    const tpl = `{{ state_attr('${this._data.sensor || "sensor.hauskarte_beschreibung"}', 'text') }}`;
    return `<pre class="desc">${esc(this._data.description)}</pre>
      <div class="muted">${esc(t.descriptionHint)}</div>
      <div class="row"><code class="tpl grow">${esc(tpl)}</code>
        <button data-act="map-copy" data-copy="${esc(tpl)}" class="secondary">${esc(t.copy)}</button></div>`;
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
      html += `<div class="muted">🏠 <button data-section-go="house" class="flat inline">${esc(t.allRooms)}</button></div>`;
    }
    html += m.floors.map((f) => this._floorHtml(f)).join("");
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
           <span class="iconedit" data-iconedit="${esc(d.id)}" data-name="${esc(d.name)}" title="${esc(this._t.iconTip(d.name))}">🎨</span>`
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
    const side = r.position.x + r.position.w / 2 > cols / 2 ? "east" : "";
    return `<div class="room ${side}" data-area="${esc(r.area_id)}" data-name="${esc(r.name)}" style="${this._place(r.position, cols, rows)}">
      <span class="fullname">${esc(r.name)}</span>
      <div class="roomhead"><b>${esc(r.name)}</b>${speaker ? " 🎙️" : ""}${open ? `<span class="badge">${open}</span>` : ""}${head}
        ${this._edit ? `<button class="x" data-act="map-unplace" title="${esc(t.removeFromMap)}">×</button>` : ""}</div>
      ${pins}
      ${this._edit ? `<div class="handle"></div>` : ""}
    </div>`;
  }

  // A dashed outline around exactly the drawn rooms of each room group on this floor (not their bounding box).
  _groupFrames(placed, cols, rows) {
    return (this._data.groups || [])
      .map((g) => {
        const rs = placed.filter((r) => g.area_ids.includes(r.area_id)).map((r) => r.position);
        if (!rs.length) return "";
        const { cells, lines } = groupOutline(rs);
        const fill = cells.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join("");
        const path = lines.map(([x1, y1, x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`).join("");
        // name at the bottom right of the lowest room
        const [lx, ly, lw, lh] = cells.reduce((a, c) => (c[1] + c[3] > a[1] + a[3] || (c[1] + c[3] === a[1] + a[3] && c[0] + c[2] > a[0] + a[2]) ? c : a));
        return `<svg class="groupframe" viewBox="0 0 ${cols} ${rows}" preserveAspectRatio="none">
            <g class="gfill">${fill}</g><path d="${path}" vector-effect="non-scaling-stroke"/></svg>
          <span class="grouplabel" style="right:${(1 - (lx + lw) / cols) * 100}%;bottom:${(1 - (ly + lh) / rows) * 100}%">${esc(g.name)}</span>`;
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

  // Own symbol for a device, in a popup with a live preview of the icon name being typed.
  _openIconDialog() {
    const t = this._t;
    const f = this._iconFor;
    const dlg = this.shadowRoot.querySelector("#icondlg");
    const canIcon = !!customElements.get("ha-icon");
    dlg.innerHTML = `<form method="dialog" class="iconform">
      <h2>${esc(t.iconFor(f.name))}</h2>
      <div class="iconrow"><span class="iconpreview" id="icon-preview"></span>
        <input id="icon-mdi" placeholder="${esc(t.iconMdi)}" value="${esc(f.mdi || "")}" autocomplete="off"></div>
      ${canIcon
        ? `<div class="iconpicks">${ICON_PICKS.map((i) => `<button type="button" class="iconpick" data-icon-pick="${i}" title="${i}"><ha-icon icon="${i}"></ha-icon></button>`).join("")}</div>`
        : ""}
      <a href="https://pictogrammers.com/library/mdi/" target="_blank" rel="noopener" class="muted small">${esc(t.iconSearch)} ↗</a>
      <div class="row">
        <button type="button" data-act="map-icon-apply">${esc(t.iconApply)}</button>
        <label class="filebtn">${esc(t.iconUpload)}<input type="file" accept="image/*" data-iconfile hidden></label>
        <span class="grow"></span>
        <button type="button" data-act="map-icon-reset" class="flat">${esc(t.iconReset)}</button>
        <button type="button" data-act="map-icon-cancel" class="flat">${esc(t.cancel)}</button></div></form>`;
    dlg.onclose = () => (this._iconFor = null);
    this._iconPreview();
    if (!dlg.open) dlg.showModal();
    dlg.querySelector("#icon-mdi").focus();
  }

  _iconName(value) {
    const v = (value || "").trim();
    return v && !v.includes(":") ? `mdi:${v}` : v;
  }

  _iconPreview() {
    const root = this.shadowRoot;
    const box = root.querySelector("#icon-preview");
    if (!box) return;
    const name = this._iconName(root.querySelector("#icon-mdi")?.value);
    box.innerHTML = name && customElements.get("ha-icon") ? `<ha-icon icon="${esc(name)}"></ha-icon>` : "🎨";
  }

  _closeIconDialog() {
    this._iconFor = null;
    this.shadowRoot.querySelector("#icondlg")?.close();
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
      this._closeIconDialog();
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
    if (this._tab !== "map" || ev.button > 0) return;
    const pin = ev.target.closest?.(".pin");
    if (pin && this._editMode !== "devices") return; // rooms mode: devices are not handled
    // the small buttons on a pin (× hide, 🎨 symbol) are clicks, not the start of a drag
    if (pin && !ev.target.closest("[data-hide], [data-iconedit]")) {
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
      this._closeIconDialog();
      return;
    }
    if (act === "map-icon-apply" || act === "map-icon-reset") {
      const mdi = act === "map-icon-apply" ? this._iconName(this.shadowRoot.querySelector("#icon-mdi").value) : null;
      try {
        await this._ws("item_icon", { item_id: this._iconFor.id, ...(mdi ? { mdi } : {}) });
        this._closeIconDialog();
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

  async _click(ev) {
    if (this._suppressClick) {
      this._suppressClick = false;
      return;
    }
    if (ev.target.closest?.('[data-act="reload"]')) {
      location.reload();
      return;
    }
    const pick = ev.target.closest?.("[data-icon-pick]");
    if (pick) {
      this.shadowRoot.querySelector("#icon-mdi").value = pick.dataset.iconPick;
      this._iconPreview();
      return;
    }
    const iconEdit = ev.target.closest?.("[data-iconedit]");
    if (iconEdit && this._edit) {
      const item = this._data.map.rooms.flatMap((r) => r.devices).find((d) => d.id === iconEdit.dataset.iconedit);
      this._iconFor = { id: iconEdit.dataset.iconedit, name: iconEdit.dataset.name, mdi: item?.icon?.mdi };
      this._openIconDialog();
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
    const nav = el.dataset.section || el.dataset.sectionGo || (el.dataset.goSub ? "inventory" : null);
    if (nav) {
      this._section = nav;
      if (el.dataset.goSub) this._sub = el.dataset.goSub;
      if (this._view() === "functions") this._exposure = null;
      this._search = "";
      this._edit = false;
      this._archiveView = false;
      this._render();
      window.scrollTo({ top: 0 });
      return;
    }
    if (el.dataset.sub) {
      this._sub = el.dataset.sub;
      if (el.dataset.sub === "functions") this._exposure = null;
      this._search = "";
      this._archiveView = false;
      this._render();
      return;
    }
    if (el.dataset.archiveView !== undefined) {
      this._archiveView = el.dataset.archiveView === "1";
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
    this._busy = true;
    try {
      if (act === "scan" || act === "scan-rules") {
        await this._ws("scan", { use_llm: act === "scan" });
      } else if (act === "unit-done" || act === "unit-skip" || act === "unit-apply") {
        const unitCard = el.closest("[data-unit]");
        const ticked =
          act === "unit-skip"
            ? []
            : [...unitCard.querySelectorAll("[data-sug]:checked")].map((c) => c.dataset.sug.slice(c.dataset.sug.indexOf("|") + 1));
        // in the inventory taking proposals is just that; in clean-up it also marks the unit as gone through
        const r = await this._ws("review", { unit: unitCard.dataset.unit, apply: ticked, done: act !== "unit-apply" });
        this._toast(r.changes ? t.applied(r.changes) : t.fc.marked);
        if (this._tab === "focus") window.scrollTo({ top: 0 });
      } else if (act === "unit-later") {
        (this._later || (this._later = new Set())).add(el.closest("[data-unit]").dataset.unit);
        this._renderList();
        window.scrollTo({ top: 0 });
        return;
      } else if (act === "focus-unlater") {
        this._later = new Set();
        this._renderList();
        return;
      } else if (act === "unit-reset") {
        await this._ws("review_reset", { unit: el.closest("[data-unit]").dataset.unit });
        this._toast(t.saved);
      } else if (act === "fn-kind-pick") {
        await this._ws("entity_update", { entity_id: el.dataset.eid, changes: { kind: el.dataset.kind } });
        this._exposure = null;
      } else if (act === "fn-convert") {
        const r = await this._ws("convert", { entity_id: el.dataset.eid, domain: el.dataset.domain });
        this._toast(t.dc.converted(r.entity_id || ""));
        this._exposure = null;
      } else if (act === "fsel-ai") {
        const ids = [...this.shadowRoot.querySelectorAll("[data-fsel]:checked")].map((b) => b.dataset.fsel);
        const devices = [...new Set(ids.map((id) => this._exposure.entities.find((x) => x.entity_id === id)?.device_id).filter(Boolean))];
        if (!devices.length) return this._toast(t.tele.none);
        await this._ws("ai_functions", { device_ids: devices });
      } else if (act === "fsel-apply") {
        const boxes = [...this.shadowRoot.querySelectorAll("[data-fsel]:checked")];
        if (!boxes.length) return this._toast(t.tele.none);
        const status = this.shadowRoot.querySelector("#fsel-status").value;
        const used = boxes.filter((b) => Number(b.dataset.used)).length;
        if (status === "disabled" && used && !confirm(t.tele.confirmUsed(used))) return;
        await this._setStatus(boxes.map((b) => b.dataset.fsel), status);
        return;
      } else if (act === "apply-safe") {
        const n = this._data.proposals.filter((p) => p.safe && p.status === "open").length;
        if (!confirm(t.confirmSafe(n))) return;
        const r = await this._ws("apply_safe");
        this._toast(t.applied(r.changes));
      } else if (act === "assist-move") {
        await this._setStatus([el.dataset.eid], el.dataset.to);
        return;
      } else if (act === "assist-more") {
        this._assistShown = (this._assistShown || 150) + 150;
        this._renderList();
        return;
      } else if (act === "ai-fn") {
        await this._ws("ai_functions", { device_ids: el.dataset.devices.split(",") });
        await this._load();
        return;
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
      } else if (act === "archive-orphans") {
        const ids = [...this.shadowRoot.querySelectorAll("[data-orphan]:checked")].map((c) => c.dataset.orphan);
        if (!ids.length) return this._toast(t.tele.none);
        const r = await this._ws("archive", { items: ids.map((id) => ({ kind: "entity", id })) });
        this._toast(t.archived(r.archived));
      } else if (act === "unarchive") {
        const r = await this._ws("unarchive", { key: el.dataset.key });
        if (el.dataset.key.startsWith("entity:") && el.textContent.trim() === t.archiveRestore) this._toast(r.restored ? t.restoredOk : t.restoredNo);
        else this._toast(t.saved);
      } else if (act === "remove-orphans") {
        const ids = [...this.shadowRoot.querySelectorAll("[data-orphan]:checked")].map((c) => c.dataset.orphan);
        if (!ids.length || !confirm(t.confirmOrphans(ids.length))) return;
        const r = await this._ws("remove_orphans", { entity_ids: ids });
        this._toast(t.removed(r.removed));
      } else if (act === "undo") {
        const r = await this._ws("undo");
        this._toast(r.title ? t.undone(r) : t.nothingToUndo);
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
  /* overview */
  .ovstep { display: flex; gap: 12px; align-items: center; padding: 10px 0; border-top: 1px solid var(--divider-color); }
  .ovstep .ename { flex: 1; display: flex; flex-direction: column; }
  .ovmark { width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
    background: var(--secondary-background-color); flex: none; }
  .ovstep.done .ovmark { background: var(--success-color, #43a047); color: #fff; }
  .ovstats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 8px 0 12px; }
  .ovstats div { display: flex; flex-direction: column; padding: 10px; border-radius: 10px; background: var(--secondary-background-color); }
  .ovstats b { font-size: 24px; }
  /* clean-up and the device card */
  .fchead { padding: 12px 16px; }
  .devcard.focus { border: 2px solid var(--primary-color); }
  .dchead { display: flex; gap: 12px; align-items: flex-start; }
  .dchead .ename { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .what { margin: 8px 0; padding: 8px 10px; border-radius: 8px; background: var(--secondary-background-color); font-size: 14px; }
  .dcrow { display: flex; flex-wrap: wrap; gap: 10px 14px; align-items: flex-end; margin: 10px 0; }
  .fld { display: flex; flex-direction: column; gap: 2px; font-size: 12px; color: var(--secondary-text-color); }
  .fld.inline { flex-direction: row; align-items: center; gap: 8px; }
  .sugs { border-left: 4px solid var(--primary-color); padding: 6px 10px; margin: 10px 0; border-radius: 6px;
    background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
  .sugshead { font-weight: 500; margin-bottom: 4px; }
  .sug { display: flex; gap: 8px; align-items: flex-start; padding: 4px 0; cursor: pointer; }
  .sug .sicon { min-width: 36px; text-align: center; }
  details.fns > summary { cursor: pointer; padding: 6px 0; color: var(--primary-color); }
  .focusfoot { position: sticky; bottom: 0; background: var(--card-background-color); padding-top: 8px; }
  .devitem { border-top: 1px solid var(--divider-color); }
  .devitem > summary { display: flex; gap: 8px; align-items: center; padding: 6px 2px; cursor: pointer; list-style: none; }
  .devitem > summary::-webkit-details-marker { display: none; }
  .devitem > summary .grow { display: flex; flex-direction: column; min-width: 0; }
  .devitem[open] > summary { font-weight: 500; }
  .devitem > .devcard { margin: 4px 0 12px; box-shadow: none; border: 1px solid var(--divider-color); }
  .ok { color: var(--success-color, #43a047); }
  .reason.ok { color: var(--success-color, #43a047); }
  .bulkbar { gap: 10px; align-items: center; }
  .chips.subs { margin-bottom: 12px; }
  .chip .count, .devitem .count { font-size: 12px; padding: 0 6px; border-radius: 8px; background: var(--primary-color); color: var(--text-primary-color, #fff); }

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
  /* drawn over the rooms (clicks go through): outline of exactly the member rooms, lightly tinted */
  .groupframe { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 3; overflow: visible; }
  .groupframe .gfill { fill: var(--accent-color, #ff9800); opacity: .07; }
  .groupframe path { fill: none; stroke: var(--accent-color, #ff9800); stroke-width: 3; stroke-dasharray: 8 5; }
  .grouplabel { position: absolute; margin: 0 8px 6px 0; z-index: 3; pointer-events: none; font-size: 11px; line-height: 16px;
    padding: 0 8px; border-radius: 8px; background: var(--accent-color, #ff9800); color: #000; white-space: nowrap; }
  .room .fullname { display: none; position: absolute; top: 2px; left: 2px; z-index: 6; padding: 1px 8px; border-radius: 6px;
    background: var(--primary-color); color: var(--text-primary-color, #fff); font-size: 13px; font-weight: 600;
    white-space: nowrap; pointer-events: none; }
  .room.east .fullname { left: auto; right: 2px; }
  .room.cut:hover { overflow: visible; z-index: 4; }
  .room.cut:hover .fullname { display: block; }
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
  details.aliases { margin-top: 2px; }
  details.aliases summary { cursor: pointer; font-size: 12px; color: var(--primary-color); list-style: none; }
  details.aliases summary::-webkit-details-marker { display: none; }
  details.aliases[open] { display: flex; flex-direction: column; gap: 6px; padding: 6px 0; }
  .aliasrow { display: flex; flex-direction: column; gap: 2px; }
  .fnrow { border-top: 1px solid var(--divider-color); padding: 6px 0; display: flex; flex-direction: column; gap: 4px; }
  .fnrow.st-hidden .fnfields, .fnrow.st-disabled .fnfields { opacity: .55; }
  .fnrow.st-disabled .fnwhat { text-decoration: line-through; opacity: .7; }
  .stsel { width: auto; max-width: 170px; }
  .fnwhat { font-size: 13px; }
  .aibar { gap: 6px; margin: 4px 0; }
  .kindpick { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin: 4px 0; }
  .kindpick .chip { padding: 2px 10px; }
  .archrow { align-items: center; gap: 10px; }
  #icondlg { border: none; border-radius: 16px; padding: 20px; max-width: min(520px, 92vw); width: 100%;
    background: var(--card-background-color); color: var(--primary-text-color); box-shadow: 0 8px 32px rgba(0,0,0,.4); }
  #icondlg::backdrop { background: rgba(0,0,0,.5); }
  #icondlg .iconform { display: flex; flex-direction: column; gap: 12px; }
  #icondlg h2 { margin: 0; font-size: 18px; font-weight: 500; }
  .iconrow { display: flex; gap: 12px; align-items: center; }
  .iconrow input { flex: 1; }
  .iconpreview { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    background: var(--secondary-background-color); font-size: 24px; flex: none; --mdc-icon-size: 28px; }
  .iconpicks { display: flex; flex-wrap: wrap; gap: 6px; }
  .iconpick { background: var(--secondary-background-color); color: var(--primary-text-color); border-radius: 10px; padding: 6px;
    width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
  .fnroomnav select { flex: 1; min-width: 160px; }
  .telrow.st-disabled .ename { opacity: .6; }
  .fnlist { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 13px; margin: 4px 0; }
  .fnlist span { white-space: nowrap; }
  details.legend summary { cursor: pointer; font-size: 12px; color: var(--primary-color); }
  table.legendtab { border-collapse: collapse; font-size: 12px; margin: 6px 0; }
  table.legendtab th, table.legendtab td { padding: 2px 10px 2px 0; text-align: left; }
  .fnhead { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .fnfields { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .fnfields input.alias { grid-column: 1 / -1; max-width: none; }
  .fnfields > * { min-width: 0; box-sizing: border-box; }
  details.fns summary { white-space: normal; }
  @media (max-width: 600px) { .fnfields { grid-template-columns: 1fr; } }
  input.alias { width: 100%; max-width: 480px; box-sizing: border-box; }
  .acols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
  .acol h2 { font-size: 16px; }
  .arow .ename { min-width: 0; }
  .acols.one { grid-template-columns: 1fr; }
  @media (max-width: 800px) { .acols { grid-template-columns: 1fr; } }
  .dname { font: inherit; font-weight: 600; color: var(--primary-text-color); background: transparent; border: 0;
    border-bottom: 1px dashed var(--divider-color); border-radius: 0; padding: 2px 0; min-width: 0; width: 100%; max-width: 420px; }
  .dname:hover, .dname:focus { border-bottom-color: var(--primary-color); outline: none; }
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
    /* clean-up foot above the bottom bar; the main button on top, full width */
    .focusfoot { bottom: calc(64px + env(safe-area-inset-bottom)); flex-wrap: wrap; }
    .focusfoot [data-act="unit-done"] { flex: 1 0 100%; order: -1; }
    .focusfoot .grow { display: none; }
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
