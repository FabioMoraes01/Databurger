import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

# --- CONFIGURAÇÃO DA CONEXÃO COM O BANCO ---

# load_dotenv(): Procura um arquivo '.env' na mesma pasta e carrega as 
# variáveis (como DATABASE_URL) para que o sistema possa usá-las.
# Isso é mais seguro do que escrever a senha diretamente no código.
load_dotenv()

# Recupera a URL de conexão do banco salva no arquivo .env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# create_engine: É o ponto de entrada para o banco de dados. 
# Ele gerencia as conexões reais com o PostgreSQL.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal: É a "fábrica" de sessões. 
# Cada vez que precisamos conversar com o banco, criamos uma nova sessão a partir daqui.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# get_db: Função auxiliadora (gerador) que abre uma conexão com o banco
# e a fecha automaticamente depois que a requisição termina.
# É usado no FastAPI para garantir que não fiquem conexões abertas "penduradas".
def get_db():
    db = SessionLocal()
    try:
        yield db # Entrega a sessão para quem pediu (ex: uma rota do FastAPI)
    finally:
        db.close() # Garante que a conexão seja fechada no final
