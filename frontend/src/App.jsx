import React, { useState, useEffect } from 'react';

const App = () => {
  // --- ESTADOS DA APLICAÇÃO ---
  // products: Armazena a lista de produtos que vem do banco de dados (backend)
  const [products, setProducts] = useState([]);
  // tray: Representa a "bandeja" ou carrinho de compras
  const [tray, setTray] = useState([]);
  // showTray: Controla se a barra lateral do carrinho está visível ou não
  const [showTray, setShowTray] = useState(false);

  // --- BUSCA DE DADOS (API) ---
  // O useEffect roda assim que o componente é montado na tela
  useEffect(() => {
    fetch('http://localhost:8000/produtos') // Chamada para o backend (FastAPI)
      .then(res => res.json())
      .then(data => setProducts(data)) // Salva o resultado no estado 'products'
      .catch(err => console.error("Erro ao carregar produtos:", err));
  }, []);

  // --- LÓGICA DO CARRINHO (BANDEJA) ---

  // Adiciona um produto à bandeja
  const addToTray = (product) => {
    setTray(prev => {
      // Verifica se o item já existe no carrinho
      const existing = prev.find(item => item.idproduto === product.idproduto);
      if (existing) {
        // Se já existe, apenas aumenta a quantidade em +1
        return prev.map(item =>
          item.idproduto === product.idproduto
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      // Se não existe, adiciona o novo produto com quantidade inicial 1
      return [...prev, { ...product, quantidade: 1 }];
    });
  };

  // Atualiza a quantidade (delta pode ser +1 ou -1)
  const updateQuantity = (productId, delta) => {
    setTray(prev => prev.map(item => {
      if (item.idproduto === productId) {
        const newQty = Math.max(0, item.quantidade + delta);
        return { ...item, quantidade: newQty };
      }
      return item;
    }).filter(item => item.quantidade > 0)); // Remove do carrinho se a quantidade chegar a 0
  };

  // Calcula o valor total multiplicando valor unitário pela quantidade de cada item
  const total = tray.reduce((sum, item) => sum + (item.valor * item.quantidade), 0);

  // --- AUXILIARES VISUAIS ---

  // Converte o nome do produto em um nome de arquivo compatível (Ex: "X-Burger" -> "x-burger.png")
  const getProductImage = (name) => {
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    return `/images/${slug}.png`;
  };

  return (
    // bg-dots-pattern: Classe customizada no index.css que cria o fundo vermelho com pontos
    <div className="min-h-screen pb-24 bg-dots-pattern">
      {/* CABEÇALHO (Header) */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 sticky top-0 z-10">
        <h1 className="text-ifood text-2xl font-black text-center tracking-tighter uppercase italic">Data Burger 🍔</h1>
      </header>

      {/* LISTA DE PRODUTOS (Cardápio) */}
      <main className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Container principal do cardápio com efeito de desfoque (blur) */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/20">
          <h2 className="text-xl font-black mb-4 uppercase tracking-tight text-gray-800">Cardápio</h2>
          <div className="space-y-4">
            {products.map(product => (
              <div
                key={product.idproduto}
                // group: permite estilizar elementos filhos quando este pai recebe hover
                className="group bg-white p-3 rounded-xl shadow-sm border-2 border-transparent hover:border-ifood transition-all cursor-pointer flex gap-4 items-center"
                onClick={() => addToTray(product)}
              >
                {/* Imagem do Produto */}
                <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                  <img
                    src={getProductImage(product.nome)}
                    alt={product.nome}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    // Fallback: se a imagem não existir, carrega um placeholder do Data Burger
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/200x200/ea1d2c/white?text=DATA+BURGER";
                    }}
                  />
                </div>
                {/* Infos do Produto */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-ifood transition-colors">
                    {product.nome}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-2 leading-tight">
                    {product.descricao}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-ifood font-black text-lg">
                      R$ {parseFloat(product.valor).toFixed(2).replace('.', ',')}
                    </span>
                    <span className="bg-ifood/10 text-ifood text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                      Adicionar
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* BOTÃO FLUTUANTE DO CARRINHO (Aparece apenas quando há itens) */}
      {tray.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button
            onClick={() => setShowTray(true)}
            className="w-full bg-ifood text-white rounded-lg p-4 flex justify-between items-center font-bold hover:bg-opacity-90 transition-all active:scale-95"
          >
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="bg-white text-ifood text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {tray.reduce((s, i) => s + i.quantidade, 0)}
              </span>
            </div>
            <span>VER BANDEJA</span>
            <span>R$ {total.toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      )}

      {/* MODAL DO CARRINHO (BANDEJA) */}
      {showTray && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex justify-end">
          {/* Animação animete-slide-in definida no index.css */}
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-xl animate-slide-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Minha Bandeja</h2>
              <button onClick={() => setShowTray(false)} className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Itens na Bandeja */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {tray.map(item => (
                <div key={item.idproduto} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.nome}</h4>
                    <p className="text-sm text-gray-500">R$ {parseFloat(item.valor).toFixed(2).replace('.', ',')}</p>
                  </div>
                  {/* Controle de Quantidade */}
                  <div className="flex items-center gap-3 border rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.idproduto, -1)} className="text-ifood font-bold px-2">-</button>
                    <span className="text-sm font-semibold">{item.quantidade}</span>
                    <button onClick={() => updateQuantity(item.idproduto, 1)} className="text-ifood font-bold px-2">+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Rodapé do Carrinho com Total */}
            <div className="p-4 border-t border-gray-100 space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <button
                className="w-full bg-ifood text-white font-bold py-4 rounded-lg shadow-md"
                onClick={() => {
                  alert("Pedido finalizado com sucesso!");
                  setTray([]);
                  setShowTray(false);
                }}
              >
                FINALIZAR PEDIDO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
