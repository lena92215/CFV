"""
import_materials.py
===================
將「原(燃)物料種類.csv」匯入資料庫的模組。

CSV 欄位（Big5 編碼，共 6255 筆）：
    序號, 原燃物料代碼, 原燃物料名稱, [顯示標籤]

建立資料表 material_types：
    id       INTEGER  PRIMARY KEY AUTOINCREMENT
    seq      INTEGER  原始序號
    code     TEXT     原燃物料代碼（唯一，如 010001、GG1889）
    name     TEXT     原燃物料名稱（如 水稻、車用柴油）
    label    TEXT     顯示標籤（代碼 + 名稱，如 "010001 水稻"）

使用方式
--------
1. 直接呼叫函式（sqlite3）：
    from import_materials import import_materials_to_db
    import_materials_to_db('cfv.db')

2. 搭配 SQLAlchemy engine：
    from sqlalchemy import create_engine
    engine = create_engine('postgresql://user:pass@localhost/cfvdb')
    import_materials_to_db(engine=engine)

3. 命令列：
    python import_materials.py              # 預設輸出至 cfv.db
    python import_materials.py mydb.db      # 指定 SQLite 路徑
"""

import csv
import io
import os
import sqlite3
import sys
from pathlib import Path
from typing import Optional, Union

# CSV 檔案預設路徑（相對於本 .py 所在目錄）
DEFAULT_CSV_PATH = Path(__file__).parent / "原(燃)物料種類.csv"

TABLE_NAME = "material_types"
CSV_ENCODING = "big5"


# ============================================================
# 核心匯入函式
# ============================================================

def import_materials_to_db(
    db_path: Optional[str] = None,
    engine=None,
    csv_path: Optional[Union[str, Path]] = None,
    replace: bool = True,
) -> int:
    """
    將「原(燃)物料種類.csv」匯入資料庫。

    Parameters
    ----------
    db_path : str, optional
        SQLite 資料庫路徑（如 'cfv.db'）。
        db_path 與 engine 擇一提供即可。
    engine : SQLAlchemy Engine, optional
        SQLAlchemy 資料庫引擎（支援 PostgreSQL、MySQL 等）。
    csv_path : str or Path, optional
        CSV 檔案路徑；預設使用 DEFAULT_CSV_PATH。
    replace : bool
        True  = 若資料表已存在，清空後重新匯入。
        False = 以 INSERT OR IGNORE 方式補充缺漏筆數。

    Returns
    -------
    int
        成功匯入的資料筆數。
    """
    if db_path is None and engine is None:
        raise ValueError("請提供 db_path（SQLite 路徑）或 SQLAlchemy engine。")

    csv_file = Path(csv_path) if csv_path else DEFAULT_CSV_PATH
    if not csv_file.exists():
        raise FileNotFoundError(f"找不到 CSV 檔案：{csv_file}")

    rows = _parse_csv(csv_file)

    if engine is not None:
        count = _import_via_sqlalchemy(engine, rows, replace)
    else:
        count = _import_via_sqlite3(db_path, rows, replace)

    print(f"[import_materials] 匯入完成：{count} 筆 → 資料表 `{TABLE_NAME}`")
    return count


# ============================================================
# 查詢輔助函式
# ============================================================

def get_materials_for_dropdown(
    db_path: Optional[str] = None,
    engine=None,
    search: Optional[str] = None,
    limit: int = 0,
) -> list:
    """
    從資料庫取得物料清單，供 UI 下拉選單使用。

    Returns
    -------
    list[dict]  {'id', 'seq', 'code', 'name', 'label'}
    """
    if db_path is None and engine is None:
        raise ValueError("請提供 db_path 或 SQLAlchemy engine。")

    if engine is not None:
        return _query_via_sqlalchemy(engine, search, limit)
    return _query_via_sqlite3(db_path, search, limit)


# ============================================================
# CSV 解析
# ============================================================

def _parse_csv(csv_file: Path) -> list:
    """讀取 Big5 編碼 CSV，回傳清洗後的 dict list。"""
    with open(csv_file, "rb") as f:
        raw = f.read()

    text = None
    for enc in ("big5", "cp950", "big5hkscs"):
        try:
            text = raw.decode(enc)
            break
        except (UnicodeDecodeError, LookupError):
            continue
    if text is None:
        text = raw.decode("big5", errors="replace")

    reader = csv.reader(io.StringIO(text))
    rows = []
    for i, row in enumerate(reader):
        if i == 0:
            continue  # 跳過標頭
        if len(row) < 3:
            continue
        seq  = row[0].strip()
        code = row[1].strip()
        name = row[2].strip()
        if not code or not name:
            continue

        label = row[3].strip() if len(row) > 3 and row[3].strip() else f"{code} {name}"
        label = _clean_label(label, seq)

        rows.append({
            "seq":   int(seq) if seq.isdigit() else 0,
            "code":  code,
            "name":  name,
            "label": label,
        })
    return rows


def _clean_label(label: str, seq: str) -> str:
    """移除標籤開頭的序號前綴，例如 '123. 010001 水稻' → '010001 水稻'"""
    prefix = f"{seq}. "
    if label.startswith(prefix):
        label = label[len(prefix):]
    return label


# ============================================================
# SQLite3 實作
# ============================================================

_DDL = """
CREATE TABLE IF NOT EXISTS material_types (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    seq   INTEGER NOT NULL DEFAULT 0,
    code  TEXT    NOT NULL UNIQUE,
    name  TEXT    NOT NULL,
    label TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_material_types_code ON material_types(code);
CREATE INDEX IF NOT EXISTS idx_material_types_name ON material_types(name);
"""


def _import_via_sqlite3(db_path: str, rows: list, replace: bool) -> int:
    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        if replace:
            cur.execute("DROP TABLE IF EXISTS material_types")
        cur.executescript(_DDL)

        action = "INSERT OR REPLACE" if replace else "INSERT OR IGNORE"
        cur.executemany(
            f"{action} INTO material_types (seq, code, name, label) VALUES (?, ?, ?, ?)",
            [(r["seq"], r["code"], r["name"], r["label"]) for r in rows],
        )
        conn.commit()
        return len(rows)
    finally:
        conn.close()


def _query_via_sqlite3(db_path: str, search: Optional[str], limit: int) -> list:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        cur = conn.cursor()
        if search:
            kw = f"%{search}%"
            sql = ("SELECT id, seq, code, name, label FROM material_types "
                   "WHERE code LIKE ? OR name LIKE ? ORDER BY seq")
            if limit > 0:
                sql += f" LIMIT {limit}"
            cur.execute(sql, (kw, kw))
        else:
            sql = "SELECT id, seq, code, name, label FROM material_types ORDER BY seq"
            if limit > 0:
                sql += f" LIMIT {limit}"
            cur.execute(sql)
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()


# ============================================================
# SQLAlchemy 實作
# ============================================================

def _import_via_sqlalchemy(engine, rows: list, replace: bool) -> int:
    try:
        from sqlalchemy import Column, Integer, MetaData, String, Table, Index
    except ImportError:
        raise ImportError("請安裝 sqlalchemy：pip install sqlalchemy")

    metadata = MetaData()
    table = Table(
        "material_types", metadata,
        Column("id",    Integer, primary_key=True, autoincrement=True),
        Column("seq",   Integer, nullable=False, default=0),
        Column("code",  String(32),  nullable=False, unique=True),
        Column("name",  String(255), nullable=False),
        Column("label", String(512), nullable=False),
    )
    with engine.connect() as conn:
        if replace:
            table.drop(conn, checkfirst=True)
        table.create(conn, checkfirst=True)

        # 批次匯入，每批 500 筆
        for i in range(0, len(rows), 500):
            conn.execute(table.insert(), rows[i : i + 500])
        conn.commit()
    return len(rows)


def _query_via_sqlalchemy(engine, search: Optional[str], limit: int) -> list:
    try:
        from sqlalchemy import text
    except ImportError:
        raise ImportError("請安裝 sqlalchemy：pip install sqlalchemy")

    base = "SELECT id, seq, code, name, label FROM material_types"
    if search:
        sql = text(f"{base} WHERE code LIKE :kw OR name LIKE :kw ORDER BY seq" +
                   (f" LIMIT {limit}" if limit > 0 else ""))
        params = {"kw": f"%{search}%"}
    else:
        sql = text(f"{base} ORDER BY seq" + (f" LIMIT {limit}" if limit > 0 else ""))
        params = {}

    with engine.connect() as conn:
        result = conn.execute(sql, params)
        return [dict(r._mapping) for r in result]


# ============================================================
# CLI 入口
# ============================================================

if __name__ == "__main__":
    target_db = sys.argv[1] if len(sys.argv) > 1 else "cfv.db"
    print(f"[import_materials] CSV：{DEFAULT_CSV_PATH}")
    print(f"[import_materials] 目標資料庫：{target_db}")
    count = import_materials_to_db(db_path=target_db)

    print("\n=== 查詢示範：搜尋「柴油」===")
    for r in get_materials_for_dropdown(db_path=target_db, search="柴油"):
        print(f"  {r['code']:12s}  {r['name']}")
