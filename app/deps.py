"""Punto unico da cui in futuro si agganciera' l'utente autenticato.

Per ora l'app e' single-user: tutte le route usano l'utente di default
seedato all'avvio (vedi app.crud.seed_default_user). Quando si aggiungera'
il login (PIN, come in cicciotv/app/auth.py), bastera' sostituire il corpo
di questa funzione con la risoluzione dell'utente dalla sessione/token,
senza toccare router, crud o modelli: owner_id e' gia' presente ovunque.
"""

from app.crud import DEFAULT_USER_ID


def get_current_owner_id() -> int:
    return DEFAULT_USER_ID
