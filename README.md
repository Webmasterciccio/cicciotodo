# CiccioTodo

App personale di gestione task: categorie/progetti, priorita' e scadenze,
sottotask/checklist, tag e filtri/ricerca.

Backend Python + FastAPI + SQLite, frontend React + Vite. Stesso pattern di
deploy di [CiccioTV](https://github.com/Webmasterciccio/cicciotv) (stessa VM,
Caddy come reverse proxy/HTTPS, backend come servizio systemd): vedi
[DEPLOY.md](DEPLOY.md).

## Requisiti

- Python 3.11 o superiore
- Node.js 18 o superiore

## Backend

Installazione (una volta sola):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Avvio:

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8001
```

- Server: **http://127.0.0.1:8001**
- Documentazione interattiva (prova le API dal browser): **http://127.0.0.1:8001/docs**
- Il database `cicciotodo.db` (SQLite) viene creato automaticamente al primo
  avvio, insieme a un utente di default.

## Frontend

Installazione (una volta sola):

```powershell
cd frontend
npm install
```

Avvio (in un altro terminale, col backend gia' attivo):

```powershell
cd frontend
npm run dev
```

Apri **http://localhost:5173**.

Per puntare a un backend diverso da `http://127.0.0.1:8001`, copia
`frontend/.env.example` in `frontend/.env` e modifica `VITE_API_BASE_URL`.

## Funzionalita'

- Task con titolo, descrizione, priorita' (bassa/media/alta), scadenza.
- Categorie/progetti e tag, con filtri e ricerca testuale.
- Sottotask/checklist per ogni task.
- Completamento con un click; i task completati restano visibili (filtrabili).

## Multi-utente

L'app e' single-user per ora: nessuna schermata di login. Lo schema dati
(campo `owner_id` su categorie/tag/task, tabella `users` gia' presente) e'
pronto per aggiungere in futuro un'autenticazione a PIN, sul modello di
CiccioTV, senza modificare le tabelle esistenti.
