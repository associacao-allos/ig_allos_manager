"""
Thin wrapper around Supabase PostgREST API using httpx.
Avoids the heavy `supabase` Python SDK and its native dependencies.
"""

import os
from dotenv import load_dotenv
import httpx

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
REST_URL = f"{SUPABASE_URL}/rest/v1"

HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


class SupabaseTable:
    """Minimal PostgREST query builder."""

    def __init__(self, table: str):
        self.table = table
        self.url = f"{REST_URL}/{table}"
        self._params: list[tuple[str, str]] = []
        self._headers: dict[str, str] = dict(HEADERS)

    def select(self, columns: str = "*"):
        self._params.append(("select", columns))
        return self

    def eq(self, column: str, value):
        self._params.append((column, f"eq.{value}"))
        return self

    def gte(self, column: str, value):
        self._params.append((column, f"gte.{value}"))
        return self

    def lt(self, column: str, value):
        self._params.append((column, f"lt.{value}"))
        return self

    def order(self, column: str, desc: bool = False):
        direction = "desc" if desc else "asc"
        self._params.append(("order", f"{column}.{direction}"))
        return self

    def insert(self, data: dict) -> list[dict]:
        resp = httpx.post(self.url, json=data, headers=self._headers, params=[("select", "*")])
        resp.raise_for_status()
        return resp.json()

    def update(self, data: dict) -> list[dict]:
        resp = httpx.patch(self.url, json=data, headers=self._headers, params=self._params)
        resp.raise_for_status()
        return resp.json()

    def delete(self) -> None:
        resp = httpx.delete(self.url, headers=self._headers, params=self._params)
        resp.raise_for_status()

    def execute(self) -> list[dict]:
        resp = httpx.get(self.url, headers=self._headers, params=self._params)
        resp.raise_for_status()
        return resp.json()


def table(name: str) -> SupabaseTable:
    return SupabaseTable(name)
