// All user-facing German copy in one place. Final wording comes from the customer.

export const texts = {
  home: {
    // From the reference sketch (docs/reference/Josh_Diplom_Probewohnkalender.pdf)
    above: "Wie willst du wohnen?",
    below: ["Probiers aus!", "Wohnhaus der Baustoffe", "Aigen im Mühlkreis"],
    hint: "Tippe auf ein Fenster, um dein Zimmer zu wählen.",
    selectWindow: (label: string) => `${label} auswählen`,
  },
  dates: {
    intro: "Wähle den Zeitraum, in dem du hier wohnen möchtest – zwischen Dezember 2026 und Juli 2027.",
    howTo: "Tippe auf den ersten und dann auf den letzten Tag – oder nur auf einen Tag, wenn du einen einzelnen Tag buchen möchtest.",
    alreadyBooked: "Dieses Zimmer ist bereits gebucht",
    alreadyBookedRange: "Dieses Zimmer ist in diesem Zeitraum bereits gebucht. Bitte wähle andere Tage.",
    fullyBooked: "Dieses Zimmer ist bereits gebucht. Bitte wähle ein anderes Fenster.",
    noSelection: "Noch kein Zeitraum gewählt",
    selected: "Gewählter Zeitraum",
    days: (n: number) => (n === 1 ? "1 Tag" : `${n} Tage`),
    legendBooked: "bereits gebucht",
    next: "Weiter",
    back: "Zurück zur Übersicht",
  },
  contact: {
    title: "Deine Kontaktdaten",
    summaryWindow: "Fenster",
    summaryRange: "Zeitraum",
    change: "Ändern",
    emailLabel: "E-Mail-Adresse",
    emailPlaceholder: "name@beispiel.at",
    privacy: "Wir speichern nur deine E-Mail-Adresse, um uns zur Aktion bei dir zu melden. Mehr im",
    privacyLink: "Datenschutzhinweis",
    submit: "Absenden",
    submitting: "Wird gesendet …",
    invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein.",
    invalidRange: "Der gewählte Zeitraum ist ungültig. Bitte wähle ihn erneut.",
    taken: "Dieses Zimmer ist bereits gebucht",
    takenHint: "Jemand war schneller – bitte wähle einen anderen Zeitraum.",
    chooseOther: "Anderen Zeitraum wählen",
    genericError: "Das hat leider nicht geklappt. Bitte versuche es noch einmal.",
  },
  confirmation: {
    title: "Danke!",
    // Wording from the brief – used on the page and in the e-mail
    message: "Der Eintrag wurde gespeichert – wir melden uns in Kürze bei Euch.",
    mailHint: "Du bekommst außerdem eine Bestätigung per E‑Mail.",
    backHome: "Zurück zur Startseite",
  },
  end: {
    title: "Wie willst du wohnen???",
    defaultText: "Die Aktion ist beendet. Danke fürs Mitmachen!",
  },
  admin: {
    title: "Admin · Probewohnen",
    loginTitle: "Admin-Bereich",
    passwordLabel: "Passwort",
    login: "Anmelden",
    wrongPassword: "Falsches Passwort.",
    notConfigured: "Der Admin-Bereich ist nicht eingerichtet (ADMIN_PASSWORD / SESSION_SECRET fehlen).",
    logout: "Abmelden",
    bookings: "Buchungen",
    total: (n: number) => (n === 1 ? "1 Buchung" : `${n} Buchungen`),
    none: "Noch keine Buchungen.",
    colWindow: "Fenster",
    colRange: "Zeitraum",
    colEmail: "E-Mail",
    colCreated: "Gebucht am",
    exportCsv: "CSV exportieren",
    campaign: "Aktion",
    statusOpen: "Die Aktion läuft – Buchungen sind möglich.",
    statusClosed: "Die Aktion ist beendet – Besucher:innen sehen den Endtext.",
    close: "Aktion beenden",
    reopen: "Aktion wieder öffnen",
    confirmClose: "Aktion wirklich beenden? Danach sind keine Buchungen mehr möglich.",
    confirmReopen: "Aktion wieder öffnen? Danach sind wieder Buchungen möglich.",
    endTextLabel: "Endtext (leer = Standardtext)",
    saveEndText: "Endtext speichern",
    saved: "Gespeichert.",
  },
  footer: {
    impressum: "Impressum",
    datenschutz: "Datenschutz",
  },
  legal: {
    // Person responsible (Medieninhaber/Verantwortlicher) – from the brief
    owner: {
      name: "Joshua Singer",
      street: "Hütteldorfer Str. 121",
      city: "1140 Wien",
      country: "Österreich",
      email: "e12033325@student.tuwien.ac.at",
    },
    /**
     * Optional: association/organisation (e.g. Verein). Leave `name` empty to hide the block.
     * Example: { name: "Verein …", zvr: "ZVR-Zahl 123456789", address: "Straße 1, 1010 Wien" }
     */
    organisation: { name: "", zvr: "", address: "" },
    projectNote:
      "Künstlerisches bzw. studentisches Projekt (Diplomarbeit). Die Website dient ausschließlich der zeitlich begrenzten Aktion „Probewohnen“ im Wohnhaus der Baustoffe, Aigen im Mühlkreis.",
    impressum: {
      title: "Impressum",
      ownerHeading: "Medieninhaber, Herausgeber und für den Inhalt verantwortlich",
      organisationHeading: "Organisation",
      contactHeading: "Kontakt",
      purposeHeading: "Grundlegende Richtung (Blattlinie)",
      purpose: "Information über die künstlerische Aktion „Probewohnen“ und Entgegennahme von Teilnahmewünschen.",
      projectHeading: "Hinweis",
    },
    privacy: {
      title: "Datenschutzhinweis",
      sections: [
        {
          heading: "Verantwortlich",
          body: "Verantwortlich für die Datenverarbeitung ist die im Impressum genannte Person (Kontakt siehe unten).",
        },
        {
          heading: "Welche Daten wir speichern",
          body: "Wenn du ein Zimmer anfragst, speichern wir deine E-Mail-Adresse zusammen mit dem gewählten Fenster, dem Zeitraum und dem Zeitpunkt der Anfrage. Weitere personenbezogene Daten erheben wir nicht.",
        },
        {
          heading: "Zweck",
          body: "Wir verwenden deine E-Mail-Adresse ausschließlich, um dir eine Bestätigung zu schicken und uns zur Aktion „Probewohnen“ bei dir zu melden. Es gibt keine Werbung und keine Weitergabe an Dritte zu deren Zwecken.",
        },
        {
          heading: "Rechtsgrundlage",
          body: "Die Verarbeitung erfolgt auf Grundlage deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die du durch das Absenden des Formulars erteilst. Du kannst sie jederzeit per E-Mail widerrufen; die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung bleibt unberührt.",
        },
        {
          heading: "Speicherdauer",
          body: "Die Daten werden nach Ende der Aktion gelöscht, spätestens drei Monate danach.",
        },
        {
          heading: "Hosting und E-Mail-Versand",
          body: "Die Website läuft auf einem eigenen Server der Projektverantwortlichen; Bestätigungs-E-Mails werden über deren E-Mail-Server versendet. Dabei werden technisch notwendige Verbindungsdaten (z. B. IP-Adresse) kurzzeitig in Server-Protokollen verarbeitet.",
        },
        {
          heading: "Cookies und Tracking",
          body: "Wir verwenden kein Tracking, keine Analyse-Tools und keine Cookies für Besucher:innen. Nur der passwortgeschützte Admin-Bereich setzt ein technisch notwendiges Sitzungs-Cookie.",
        },
        {
          heading: "Deine Rechte",
          body: "Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Schreib uns dazu einfach eine E-Mail. Wenn du meinst, dass die Verarbeitung gegen das Datenschutzrecht verstößt, kannst du dich bei der Österreichischen Datenschutzbehörde (Barichgasse 40–42, 1030 Wien, www.dsb.gv.at) beschweren.",
        },
      ],
      contactHeading: "Kontakt",
    },
  },
  mail: {
    subject: "Probewohnen – Dein Eintrag ist gespeichert",
    greeting: "Hallo,",
    closing: "Viele Grüße",
    signature: ["Wohnhaus der Baustoffe · Probewohnen", "Aigen im Mühlkreis"],
    impressum: "Impressum",
  },
} as const;
