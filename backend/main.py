from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, database
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# --- INICIALIZAÇÃO DO SERVIDOR ---
app = FastAPI(title="Data Burger API")

# --- CONFIGURAÇÃO DE CORS ---
# CORS (Cross-Origin Resource Sharing): Necessário para que o 
# frontend (React na porta 5173) consiga conversar com o backend (FastAPI na porta 8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, aqui colocamos o link do site oficial
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],
)

# --- SCHEMAS PYDANTIC (Validação de Dados) ---
# O Pydantic garante que os dados que entram e saem da API 
# tenham o formato correto (ex: se o preço é número, se o nome é texto).

class ProdutoSchema(BaseModel):
    idproduto: int
    nome: str
    descricao: str
    valor: float
    
    class Config:
        from_attributes = True # Permite converter um modelo do SQLAlchemy direto para Pydantic

class ItemPedidoCreate(BaseModel):
    idproduto: int
    quantidade: int

class PedidoCreate(BaseModel):
    idcliente: int
    idtipoentrega: int
    itens: List[ItemPedidoCreate]

# --- ROTAS DA API ---

# Rota para Listar Produtos
@app.get("/produtos", response_model=List[ProdutoSchema])
def get_produtos(db: Session = Depends(database.get_db)):
    # Busca apenas produtos ativos (status = True) no banco de dados
    return db.query(models.Produto).filter(models.Produto.status == True).all()

# Rota para Criar um Novo Pedido
@app.post("/pedidos")
def create_pedido(pedido_in: PedidoCreate, db: Session = Depends(database.get_db)):
    # 1. Cria o cabeçalho do pedido
    new_pedido = models.Pedido(
        idcliente=pedido_in.idcliente,
        idtipoentrega=pedido_in.idtipoentrega,
        idstatuspedido=1, # 1: Pendente
        valortotal=0
    )
    db.add(new_pedido)
    db.flush() # flush(): Gera o ID do pedido mas ainda não salva definitivamente
    
    total = 0.0
    # 2. Percorre os itens enviados pelo frontend
    for item in pedido_in.itens:
        prod = db.query(models.Produto).get(item.idproduto)
        if prod:
            item_total = float(prod.valor) * item.quantidade
            new_item = models.ItemPedido(
                idpedido=new_pedido.idpedido,
                idproduto=item.idproduto,
                quantidade=item.quantidade,
                valorunitario=prod.valor,
                valortotal=item_total
            )
            db.add(new_item)
            total += item_total
    
    # 3. Atualiza o valor total do pedido principal
    new_pedido.valortotal = total
    
    # 4. Simulação: Criar registro de pagamento aprovado automaticamente
    new_pagamento = models.Pagamento(
        idpedido=new_pedido.idpedido,
        valor=total,
        idstatuspagamento=3 # 3: Aprovado (Simulação para agilizar o fluxo)
    )
    db.add(new_pagamento)
    
    # 5. Salva tudo de uma vez no banco de dados
    db.commit()
    db.refresh(new_pedido) # Atualiza o objeto com os dados finais do banco
    
    return {"status": "success", "pedido_id": new_pedido.idpedido, "total": total}

# Comando para rodar o servidor manualmente (python main.py)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
