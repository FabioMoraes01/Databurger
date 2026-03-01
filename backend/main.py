from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, database
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="iFood Clone API")

# Habilitar CORS para o frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas Pydantic
class ProdutoSchema(BaseModel):
    idproduto: int
    nome: str
    descricao: str
    valor: float
    
    class Config:
        from_attributes = True

class ItemPedidoCreate(BaseModel):
    idproduto: int
    quantidade: int

class PedidoCreate(BaseModel):
    idcliente: int
    idtipoentrega: int
    itens: List[ItemPedidoCreate]

@app.get("/produtos", response_model=List[ProdutoSchema])
def get_produtos(db: Session = Depends(database.get_db)):
    return db.query(models.Produto).filter(models.Produto.status == True).all()

@app.post("/pedidos")
def create_pedido(pedido_in: PedidoCreate, db: Session = Depends(database.get_db)):
    # Lógica simplificada de criação de pedido para o portfólio
    new_pedido = models.Pedido(
        idcliente=pedido_in.idcliente,
        idtipoentrega=pedido_in.idtipoentrega,
        idstatuspedido=1,
        valortotal=0
    )
    db.add(new_pedido)
    db.flush()
    
    total = 0.0
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
    
    new_pedido.valortotal = total
    
    # Criar registro de pagamento aprovado automaticamente
    new_pagamento = models.Pagamento(
        idpedido=new_pedido.idpedido,
        valor=total,
        idstatuspagamento=3 # Approved
    )
    db.add(new_pagamento)
    
    db.commit()
    db.refresh(new_pedido)
    return {"status": "success", "pedido_id": new_pedido.idpedido, "total": total}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
