# Deploy di CiccioTodo sulla stessa VM di CiccioTV

CiccioTodo gira sulla **stessa VM Oracle Cloud** gia' usata per CiccioTV,
riusando lo stesso Caddy (reverse proxy + HTTPS automatico) ma con un
**sottodominio DuckDNS dedicato** e una **porta locale diversa**, cosi' i due
progetti non entrano in conflitto:

```
Internet ──HTTPS──► Caddy (porte 80/443, un unico Caddyfile con piu' domini)
                      ├── cicciotv.duckdns.org    ──► uvicorn cicciotv   su 127.0.0.1:8000
                      └── cicciotodo.duckdns.org  ──► uvicorn cicciotodo su 127.0.0.1:8001
```

Non serve aprire nuove porte su Oracle Security List / iptables: sono gia'
aperte 80/443 per CiccioTV e bastano anche per questo progetto.

---

## 1. Nuovo sottodominio DuckDNS

1. Vai su <https://www.duckdns.org> (stesso account usato per `cicciotv`).
2. Crea il sottodominio **`cicciotodo`** → diventa `cicciotodo.duckdns.org`.
3. In **current ip** metti lo stesso IP pubblico gia' usato per `cicciotv`
   (la VM e' la stessa) e premi **update ip**.

Verifica dal tuo PC:

```bash
ping cicciotodo.duckdns.org
```

Deve rispondere lo stesso IP di `cicciotv.duckdns.org`.

Se aggiorni l'IP di `cicciotv` con un cron DuckDNS (`crontab -l` sulla VM),
il parametro `domains=` di quello script deve includere anche `cicciotodo`
(es. `domains=cicciotv,cicciotodo`), altrimenti solo `cicciotv` restera'
aggiornato in caso l'IP della VM cambi.

---

## 2. Clonare il progetto sulla VM

```bash
cd ~
git clone https://github.com/Webmasterciccio/cicciotodo.git
cd cicciotodo
```

---

## 3. Backend come servizio (systemd)

```bash
cd ~/cicciotodo
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

sudo cp deploy/cicciotodo.service /etc/systemd/system/cicciotodo.service
sudo systemctl daemon-reload
sudo systemctl enable --now cicciotodo

# Verifica che risponda in locale
curl http://127.0.0.1:8001/
```

Deve restituire `{"status":"ok","service":"cicciotodo"}`.
Log: `journalctl -u cicciotodo -f`.

Il database `cicciotodo.db` (SQLite) e l'utente di default vengono creati
automaticamente al primo avvio: non serve alcun passo manuale.

---

## 4. Build del frontend

```bash
cd ~/cicciotodo/frontend
npm install
echo 'VITE_API_BASE_URL=/api' > .env.production.local
npm run build
```

Genera `frontend/dist`, il percorso servito da Caddy.

---

## 5. Aggiungere il blocco al Caddyfile esistente

Il Caddyfile e' **lo stesso file** gia' usato per CiccioTV: si aggiunge un
secondo site block, non se ne crea uno separato.

```bash
sudo nano /etc/caddy/Caddyfile
```

Incolla in fondo il contenuto di `deploy/Caddyfile.snippet` di questo
progetto (gia' pronto con dominio, porta 8001 e percorso frontend corretti;
correggi solo l'email se diversa). Poi:

```bash
sudo systemctl restart caddy
sudo systemctl status caddy    # deve essere "active (running)"
```

Al primo avvio con il nuovo dominio, Caddy ottiene automaticamente il
certificato HTTPS da Let's Encrypt (serve la porta 80 raggiungibile, gia'
aperta per CiccioTV).

---

## 6. Prova dal browser

Apri **`https://cicciotodo.duckdns.org`**: deve comparire la lista dei task
(vuota al primo avvio) e il lucchetto HTTPS verde.

---

## Comandi utili

| Cosa | Comando (sulla VM) |
|------|--------------------|
| Log backend | `journalctl -u cicciotodo -f` |
| Riavvia backend | `sudo systemctl restart cicciotodo` |
| Log/stato Caddy (condiviso con cicciotv) | `sudo systemctl status caddy` / `journalctl -u caddy -f` |
| Aggiornare il codice | `cd ~/cicciotodo && git pull` poi rebuild frontend + `sudo systemctl restart cicciotodo` |
| Backup dati | `scp ubuntu@cicciotodo.duckdns.org:/home/ubuntu/cicciotodo/cicciotodo.db ./backup.db` |

---

## Nota sul multi-utente

Per ora l'app e' single-user (nessun login): tutti i dati appartengono a un
utente di default creato automaticamente. Lo schema del database (`owner_id`
su categorie/tag/task) e' gia' predisposto per aggiungere in futuro un login
a PIN come quello di CiccioTV (`cicciotv/app/auth.py`), senza dover
modificare il modello dati esistente.
