import os
import sys
import json

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.core.database import engine
from sqlalchemy import inspect

def generate_schema_json():
    inspector = inspect(engine)
    tables = sorted(inspector.get_table_names())

    schema_dict = {
        "total_tables": len(tables),
        "database_name": "carepath",
        "tables": {}
    }

    for t in tables:
        columns = inspector.get_columns(t)
        pk_cols = inspector.get_pk_constraint(t).get("constrained_columns", [])
        fks = inspector.get_foreign_keys(t)
        
        fk_map = {}
        for fk in fks:
            for local_col, remote_col in zip(fk["constrained_columns"], fk["referred_columns"]):
                fk_map[local_col] = f"{fk['referred_table']}.{remote_col}"

        col_list = []
        for c in columns:
            col_name = c["name"]
            col_list.append({
                "column_name": col_name,
                "data_type": str(c["type"]),
                "nullable": c["nullable"],
                "primary_key": col_name in pk_cols,
                "foreign_key": fk_map.get(col_name, None)
            })
        
        schema_dict["tables"][t] = {
            "table_name": t,
            "column_count": len(columns),
            "columns": col_list
        }

    target_path = r"c:\Users\HP\Desktop\working project\rohan-cts\database_schemas.json"
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(schema_dict, f, indent=2)

    artifact_path = r"C:\Users\HP\.gemini\antigravity-ide\brain\147c1e1b-c724-4e8e-a686-500b92276aa8\database_schemas.json"
    with open(artifact_path, "w", encoding="utf-8") as f:
        json.dump(schema_dict, f, indent=2)

    print(f"Successfully generated database_schemas.json for {len(tables)} tables.")

if __name__ == "__main__":
    generate_schema_json()
