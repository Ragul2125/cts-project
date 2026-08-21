import psycopg
from psycopg.errors import DuplicateDatabase
from app.core.config import settings

def create_database():
    # Parse the DATABASE_URL to get credentials, but connect to 'postgres'
    url = settings.DATABASE_URL
    # Format: postgresql+psycopg://postgres:password@localhost:5432/carepath
    # We strip out the `+psycopg` for standard connection strings and change the DB name to postgres
    conn_str = url.replace("postgresql+psycopg://", "postgresql://")
    
    # Extract the base URL without the db name
    base_url = conn_str.rsplit('/', 1)[0]
    db_name = conn_str.rsplit('/', 1)[1]
    
    postgres_conn_str = f"{base_url}/postgres"
    
    try:
        with psycopg.connect(postgres_conn_str, autocommit=True) as conn:
            with conn.cursor() as cur:
                try:
                    cur.execute(f"CREATE DATABASE {db_name}")
                    print(f"Database '{db_name}' created successfully.")
                except DuplicateDatabase:
                    print(f"Database '{db_name}' already exists.")
    except Exception as e:
        print(f"Failed to connect to PostgreSQL: {e}")

if __name__ == "__main__":
    create_database()
