import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.core.database import engine
from sqlalchemy import inspect

def generate_schema_markdown():
    inspector = inspect(engine)
    tables = sorted(inspector.get_table_names())

    md_lines = [
        "# Complete Field-by-Field Database Schema Reference (40 Tables)\n",
        "This document contains the exact field-by-field column definitions, data types, nullability, primary keys, and foreign key references for all **40 PostgreSQL tables** in **PgAdmin**.\n\n---\n"
    ]

    for t in tables:
        md_lines.append(f"## Table: `{t}`\n")
        columns = inspector.get_columns(t)
        pk_cols = inspector.get_pk_constraint(t).get("constrained_columns", [])
        fks = inspector.get_foreign_keys(t)
        
        fk_map = {}
        for fk in fks:
            for local_col, remote_col in zip(fk["constrained_columns"], fk["referred_columns"]):
                fk_map[local_col] = f"{fk['referred_table']}.{remote_col}"

        md_lines.append("| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |")
        md_lines.append("|---|---|---|---|---|")
        
        for c in columns:
            col_name = c["name"]
            data_type = str(c["type"])
            nullable = "YES" if c["nullable"] else "NO"
            is_pk = "YES" if col_name in pk_cols else "NO"
            fk_info = fk_map.get(col_name, "-")
            md_lines.append(f"| `{col_name}` | `{data_type}` | {nullable} | {is_pk} | `{fk_info}` |")
        
        md_lines.append("\n---\n")

    target_path = r"c:\Users\HP\Desktop\working project\rohan-cts\DATABASE_SCHEMAS.md"
    with open(target_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))

    print(f"Successfully generated field-by-field schemas for {len(tables)} tables at {target_path}")

if __name__ == "__main__":
    generate_schema_markdown()
