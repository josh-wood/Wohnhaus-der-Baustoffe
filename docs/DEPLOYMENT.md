# Anleitung: Website „Probewohnen“ auf dem Server veröffentlichen

Diese Anleitung führt Schritt für Schritt durch die Veröffentlichung auf dem bestehenden Server (dem Server, auf dem auch jedes-haus.de läuft). Auf dem Server ist **Dokku** installiert – ein Programm, das Websites per `git push` veröffentlicht.

Du brauchst keine Programmierkenntnisse. Befehle in grauen Kästen werden **genau so** kopiert und eingefügt. Teile in `<spitzen Klammern>` ersetzt du durch deine eigenen Werte (ohne die Klammern).

> ⏱️ Dauer: ca. 45 Minuten beim ersten Mal, Updates danach ca. 5 Minuten.

---

## 0. Was du vorher brauchst

| Was | Woher | Beispiel |
|---|---|---|
| Server-IP-Adresse | Server-Betreuung | `203.0.113.10` |
| SSH-Zugang zum Server (Benutzername) | Server-Betreuung | `root` oder `deploy` |
| Die Domain für die Website | eigene Domain | `probewohnen.at` |
| Zugang zur DNS-Verwaltung der Domain | Domain-Anbieter | – |
| E-Mail-Postfach mit SMTP-Daten (Server, Port, Benutzer, Passwort) | E-Mail-Anbieter | `mail.probewohnen.at`, Port `587` |
| Ein Admin-Passwort für die Website (selbst ausdenken) | – | – |
| Auf deinem Computer: **Terminal** und **Git** | macOS: vorinstalliert · Windows: [git-scm.com](https://git-scm.com) („Git Bash“ verwenden) | – |
| Den Projektordner auf deinem Computer | `git clone` aus GitLab | – |

**Terminal öffnen:** macOS → Programme → Dienstprogramme → Terminal. Windows → „Git Bash“ starten.

In dieser Anleitung heißt die App immer **`haus-der-baustoffe`** und die Datenbank **`haus-der-baustoffe-db`**. Bitte diese Namen genau so verwenden.

---

## 1. Domain auf den Server zeigen lassen (DNS)

In der DNS-Verwaltung deines Domain-Anbieters einen Eintrag anlegen:

| Typ | Name | Wert |
|---|---|---|
| `A` | `@` (bzw. leer, für `probewohnen.at`) oder eine Subdomain wie `www` | `<Server-IP>` |

Das kann bis zu einigen Stunden dauern, meistens geht es in Minuten. Prüfen kannst du es im Terminal:

```bash
ping -c 1 <deine-domain>
```

Wenn dort die Server-IP erscheint, passt es. (Wenn „ping“ keine Antwort bekommt, ist das egal – wichtig ist nur die IP in der ersten Zeile.)

---

## 2. Am Server anmelden

```bash
ssh <benutzername>@<Server-IP>
```

Beim ersten Mal fragt das Terminal „Are you sure you want to continue connecting?“ → `yes` eintippen und Enter.

> 💡 Alle Befehle in den Schritten 3–8 werden **auf dem Server** ausgeführt (also in diesem SSH-Fenster). Falls ein Befehl „permission denied“ meldet, setze `sudo ` davor (z. B. `sudo dokku apps:list`).

Kurzer Test, ob Dokku da ist:

```bash
dokku version
```

---

## 3. Benötigte Erweiterungen prüfen

```bash
dokku plugin:list
```

In der Liste müssen **`postgres`** und **`letsencrypt`** vorkommen. Fehlt eine davon, installieren (nur dann!):

```bash
sudo dokku plugin:install https://github.com/dokku/dokku-postgres.git postgres
sudo dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git letsencrypt
```

---

## 4. App und Datenbank anlegen

```bash
dokku apps:create haus-der-baustoffe
dokku postgres:create haus-der-baustoffe-db
dokku postgres:link haus-der-baustoffe-db haus-der-baustoffe
```

Der letzte Befehl verbindet die Datenbank mit der App (die Zugangsdaten werden automatisch eingetragen).

> ✅ Bestehende Websites auf dem Server (z. B. jedes-haus.de) sind davon nicht betroffen – es wird eine neue, getrennte App mit eigener Datenbank angelegt.

---

## 5. Domain und Port eintragen

```bash
dokku domains:set haus-der-baustoffe <deine-domain>
dokku ports:set haus-der-baustoffe http:80:3000
```

Der zweite Befehl ist wichtig: Die App läuft intern auf Port 3000, Besucher:innen kommen über den normalen Web-Port 80. Ohne ihn wäre die Website unter der Domain nicht erreichbar.

---

## 6. Einstellungen (Passwörter, E-Mail) setzen

Zuerst zwei zufällige Geheimwerte erzeugen – das Ergebnis jeweils kopieren:

```bash
openssl rand -hex 32
```

Dann alles in **einem** Befehl setzen (Werte ersetzen; die einfachen Anführungszeichen `'…'` bitte stehen lassen):

```bash
dokku config:set --no-restart haus-der-baustoffe \
  APP_URL='https://<deine-domain>' \
  ADMIN_PASSWORD='<dein-admin-passwort>' \
  SESSION_SECRET='<erster-zufallswert>' \
  SMTP_HOST='<smtp-server>' \
  SMTP_PORT='587' \
  SMTP_USER='<smtp-benutzer>' \
  SMTP_PASS='<smtp-passwort>' \
  MAIL_FROM='Probewohnen <<absender-adresse>>' \
  TZ='Europe/Vienna'
```

Hinweise:
- `SMTP_PORT`: meist `587`. Wenn dein Anbieter `465` (SSL) angibt, dann `465`.
- `MAIL_FROM`: z. B. `'Probewohnen <info@probewohnen.at>'`. Die Adresse sollte zum SMTP-Postfach passen, sonst landen Mails im Spam.
- Optional: Kopie jeder Bestätigung an dich: zusätzlich `MAIL_BCC='<deine-adresse>'`.
- Kontrolle (zeigt alle Werte an): `dokku config:show haus-der-baustoffe`

---

## 7. Deinen Computer für das Hochladen freischalten

Dokku nimmt nur Uploads von bekannten Computern an. **Auf deinem Computer** (neues Terminal-Fenster, nicht am Server) den öffentlichen SSH-Schlüssel anzeigen:

```bash
cat ~/.ssh/id_ed25519.pub
```

Kommt „No such file“, zuerst einen Schlüssel erzeugen (alle Fragen mit Enter bestätigen) und den `cat`-Befehl wiederholen:

```bash
ssh-keygen -t ed25519
```

Die ausgegebene Zeile (beginnt mit `ssh-ed25519 …`) kopieren. **Am Server** eintragen:

```bash
echo '<die-kopierte-zeile>' | sudo dokku ssh-keys:add <dein-name>
```

---

## 8. Website hochladen (Deployment)

**Auf deinem Computer**, im Projektordner:

```bash
cd <pfad-zum-projektordner>
git remote add dokku dokku@<Server-IP>:haus-der-baustoffe
git push dokku main
```

Das dauert beim ersten Mal 3–5 Minuten. Am Ende sollte u. a. stehen:

```
-----> Running predeploy task …
migrate: applied 001_init.sql
…
=====> Application deployed:
       http://<deine-domain>
```

`migrate: applied …` bedeutet: Die Datenbank-Tabellen wurden angelegt. Bei späteren Updates steht dort `database is up to date`.

---

## 9. HTTPS (Schloss-Symbol) einschalten

**Am Server:**

```bash
dokku letsencrypt:set haus-der-baustoffe email <deine-email-adresse>
dokku letsencrypt:enable haus-der-baustoffe
dokku letsencrypt:cron-job --add
```

Der letzte Befehl erneuert das Zertifikat automatisch (falls er schon für jedes-haus.de eingerichtet wurde, schadet er nicht).

> Funktioniert das nicht, ist meist die Domain noch nicht auf den Server umgestellt (Schritt 1). Etwas warten und erneut versuchen.

---

## 10. Testen

1. `https://<deine-domain>/api/health` im Browser öffnen → es muss `{"ok":true}` erscheinen.
2. `https://<deine-domain>` am **Handy** öffnen: Foto, Fenster antippen, Zeitraum wählen, eigene E-Mail eingeben → Bestätigungsseite und Bestätigungs-E-Mail (auch im Spam-Ordner nachsehen).
3. `https://<deine-domain>/admin` → mit dem Admin-Passwort anmelden → die Testbuchung steht in der Liste.
4. Testbuchung wieder löschen (am Server):

   ```bash
   dokku postgres:connect haus-der-baustoffe-db
   ```
   Dann eintippen (eigene Test-Adresse einsetzen) und Enter:
   ```sql
   DELETE FROM bookings WHERE email = '<deine-test-adresse>';
   ```
   Mit `\q` und Enter wieder verlassen.

---

## 11. QR-Code erzeugen und drucken

**Auf deinem Computer**, im Projektordner (einmalig vorher `npm install` ausführen; dafür muss [Node.js](https://nodejs.org) installiert sein):

```bash
APP_URL=https://<deine-domain> npm run qr
```

Im Ordner `qr/` liegen danach:
- `qr-code-a4.pdf` – fertiges A4-Blatt zum Ausdrucken
- `qr-code.png` / `qr-code.svg` – für eigene Gestaltungen (Plakat, Flyer)

**Vor dem Drucken unbedingt mit dem Handy scannen** und prüfen, dass die Website aufgeht.

---

## 12. Während der Aktion

| Aufgabe | So geht’s |
|---|---|
| Buchungen ansehen / als Excel-Datei laden | `https://<deine-domain>/admin` → „CSV exportieren“ |
| **Aktion beenden** | `/admin` → „Aktion beenden“ (Endtext vorher im Feld darunter eintragen und speichern) |
| Aktion wieder öffnen | `/admin` → „Aktion wieder öffnen“ |
| Admin-Passwort ändern | Am Server: `dokku config:set haus-der-baustoffe ADMIN_PASSWORD='<neu>'` |
| Alle Admins abmelden | Am Server: `dokku config:set haus-der-baustoffe SESSION_SECRET='<neuer-zufallswert>'` |
| Protokolle ansehen (bei Problemen) | Am Server: `dokku logs haus-der-baustoffe -t` (beenden mit Strg+C) |
| Sicherung der Datenbank | Am Server: `dokku postgres:export haus-der-baustoffe-db > probewohnen-backup.dump` |
| Neue Version hochladen | Auf deinem Computer im Projektordner: `git pull` und dann `git push dokku main` |

---

## 13. Nach der Aktion: aufräumen (Datenschutz!)

Laut Datenschutzhinweis werden die E-Mail-Adressen nach Ende der Aktion gelöscht (spätestens nach 3 Monaten).

1. In `/admin` die CSV-Datei herunterladen und sicher aufbewahren, solange sie gebraucht wird.
2. Am Server App und Datenbank endgültig löschen (fragt zur Sicherheit nach dem Namen):

   ```bash
   dokku apps:destroy haus-der-baustoffe
   dokku postgres:destroy haus-der-baustoffe-db
   ```
3. Den DNS-Eintrag aus Schritt 1 entfernen.
4. Die heruntergeladene CSV-Datei löschen, sobald sie nicht mehr gebraucht wird.

---

## Hilfe bei Problemen

| Problem | Lösung |
|---|---|
| `git push` sagt „Permission denied (publickey)“ | Schritt 7 wiederholen; prüfen mit `ssh dokku@<Server-IP> apps:list` |
| Beim Hochladen „healthcheck failed“ / „Could not start due to 1 failed checks“ | Am Server `dokku logs haus-der-baustoffe` ansehen. Meist fehlt die Datenbank-Verknüpfung (Schritt 4, `postgres:link`). |
| Nach dem Hochladen steht „Application deployed: http://<domain>:3000“ bzw. die Domain zeigt nichts oder eine andere Website | Schritt 5 fehlt: `dokku ports:set haus-der-baustoffe http:80:3000` |
| Website zeigt „502 Bad Gateway“ | `dokku ps:report haus-der-baustoffe` und `dokku logs haus-der-baustoffe` prüfen; ggf. `dokku ps:restart haus-der-baustoffe` |
| Bestätigungs-E-Mails kommen nicht an | Spam-Ordner prüfen; in den Logs nach `mail: … failed` suchen. SMTP-Werte (Schritt 6) kontrollieren, bei Port 465 ↔ 587 wechseln. Die Buchung selbst ist trotzdem gespeichert. |
| Admin-Anmeldung zeigt „nicht eingerichtet“ | `ADMIN_PASSWORD` oder `SESSION_SECRET` fehlt (Schritt 6; `SESSION_SECRET` mind. 16 Zeichen) |
| HTTPS lässt sich nicht aktivieren | DNS (Schritt 1) prüfen und später erneut versuchen |
