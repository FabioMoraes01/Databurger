import React, { useState, useEffect, useRef } from 'react';

const API = 'http://localhost:8000';

const App = () => {
  // --- ESTADOS DA APLICAÇÃO ---
  const [products, setProducts] = useState([]);
  const [tray, setTray] = useState([]);
  const [showTray, setShowTray] = useState(false);

  // Controle de página: 'menu' ou 'cadastro'
  const [page, setPage] = useState('menu');

  // Estado do usuário logado
  const [loggedUser, setLoggedUser] = useState(null); // { idcliente, nome }

  // Estado do dropdown de login
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estado do formulário de cadastro
  const [cadastro, setCadastro] = useState({ nome: '', telefone: '', email: '', senha: '', confirmarSenha: '' });
  const [cadastroError, setCadastroError] = useState('');
  const [cadastroLoading, setCadastroLoading] = useState(false);

  const loginRef = useRef(null);

  // --- BUSCA DE PRODUTOS ---
  useEffect(() => {
    fetch(`${API}/produtos`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Erro ao carregar produtos:', err));
  }, []);

  // Fecha o dropdown de login ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) {
        setShowLogin(false);
        setLoginError('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- LÓGICA DO CARRINHO ---
  const addToTray = (product) => {
    setTray(prev => {
      const existing = prev.find(item => item.idproduto === product.idproduto);
      if (existing) {
        return prev.map(item =>
          item.idproduto === product.idproduto
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantidade: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setTray(prev => prev.map(item => {
      if (item.idproduto === productId) {
        const newQty = Math.max(0, item.quantidade + delta);
        return { ...item, quantidade: newQty };
      }
      return item;
    }).filter(item => item.quantidade > 0));
  };

  const total = tray.reduce((sum, item) => sum + (item.valor * item.quantidade), 0);

  const getProductImage = (name) => {
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    return `/images/${slug}.png`;
  };

  // --- LÓGICA DE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.detail || 'E-mail ou senha inválidos.');
        return;
      }
      setLoggedUser({ idcliente: data.idcliente, nome: data.nome });
      setShowLogin(false);
      setLoginEmail('');
      setLoginSenha('');
    } catch {
      setLoginError('Erro de conexão. Verifique o servidor.');
    }
  };

  const handleLogout = () => {
    setLoggedUser(null);
    setLoginEmail('');
    setLoginSenha('');
  };

  // --- LÓGICA DE CADASTRO ---
  const handleCadastro = async (e) => {
    e.preventDefault();
    setCadastroError('');

    if (!cadastro.nome || !cadastro.telefone || !cadastro.email || !cadastro.senha) {
      setCadastroError('Preencha todos os campos.');
      return;
    }
    if (cadastro.senha.length > 8) {
      setCadastroError('A senha deve ter no máximo 8 caracteres.');
      return;
    }
    if (cadastro.senha !== cadastro.confirmarSenha) {
      setCadastroError('As senhas não coincidem.');
      return;
    }

    setCadastroLoading(true);
    try {
      const res = await fetch(`${API}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: cadastro.nome,
          telefone: cadastro.telefone,
          email: cadastro.email,
          senha: cadastro.senha,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCadastroError(data.detail || 'Erro ao realizar cadastro.');
        setCadastroLoading(false);
        return;
      }
      // Sucesso: volta ao menu e abre o login com o e-mail preenchido
      setLoginEmail(cadastro.email);
      setCadastro({ nome: '', telefone: '', email: '', senha: '', confirmarSenha: '' });
      setPage('menu');
      setShowLogin(true);
    } catch {
      setCadastroError('Erro de conexão. Verifique o servidor.');
    }
    setCadastroLoading(false);
  };

  // --- COMPONENTE RENDERIZADO (Header) ---
  const headerJSX = (
    <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 sticky top-0 z-20">
      <div className="relative flex items-center justify-end px-2">
        <button
          onClick={() => setPage('menu')}
          className="absolute left-1/2 -translate-x-1/2 text-ifood text-2xl font-black tracking-tighter uppercase italic hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          Data Burger 🍔
        </button>

        <div className="relative flex justify-end" ref={loginRef}>
          {loggedUser ? (
            <div className="flex items-center gap-2">
              <span className="text-ifood font-bold text-sm">Olá, {loggedUser.nome.split(' ')[0]}!</span>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 underline hover:text-ifood transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <>
              <button
                id="btn-login"
                onClick={() => { setShowLogin(v => !v); setLoginError(''); }}
                className="bg-ifood text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors active:scale-95"
              >
                Login
              </button>

              {showLogin && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 animate-fade-in z-30">
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div>
                      <label className="block text-ifood font-bold text-sm mb-1">E-mail:</label>
                      <input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ifood/40"
                        placeholder="E-mail"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-ifood font-bold text-sm mb-1">Senha:</label>
                      <input
                        id="login-senha"
                        type="password"
                        value={loginSenha}
                        onChange={e => setLoginSenha(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ifood/40"
                        placeholder="Senha"
                        maxLength={8}
                        required
                      />
                    </div>
                    {loginError && (
                      <p className="text-red-500 text-xs font-medium">{loginError}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full bg-ifood text-white font-bold py-2 rounded-lg text-sm hover:bg-red-700 transition-colors active:scale-95"
                    >
                      Entrar
                    </button>
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => { setShowLogin(false); setPage('cadastro'); }}
                        className="text-ifood text-xs underline hover:opacity-75 transition-opacity"
                      >
                        Ainda não sou cadastrado
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );

  // --- PÁGINA DE CADASTRO ---
  if (page === 'cadastro') {
    return (
      <div className="min-h-screen pb-24 bg-dots-pattern">
        {headerJSX}
        <main className="p-4 max-w-2xl mx-auto space-y-4 mt-2">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
            <h2 className="text-xl font-black mb-1 uppercase tracking-tight text-gray-800">Criar Conta</h2>
            <p className="text-gray-400 text-sm mb-5">Preencha os dados abaixo para se cadastrar.</p>

            <form onSubmit={handleCadastro} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-ifood font-bold text-sm mb-1">Nome:</label>
                <input
                  id="cadastro-nome"
                  type="text"
                  value={cadastro.nome}
                  onChange={e => setCadastro(p => ({ ...p, nome: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ifood/40"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-ifood font-bold text-sm mb-1">Telefone:</label>
                <input
                  id="cadastro-telefone"
                  type="tel"
                  value={cadastro.telefone}
                  onChange={e => setCadastro(p => ({ ...p, telefone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ifood/40"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-ifood font-bold text-sm mb-1">E-mail:</label>
                <input
                  id="cadastro-email"
                  type="email"
                  value={cadastro.email}
                  onChange={e => setCadastro(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ifood/40"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-ifood font-bold text-sm mb-1">
                  Senha: <span className="font-normal text-gray-400">(máx. 8 caracteres)</span>
                </label>
                <input
                  id="cadastro-senha"
                  type="password"
                  value={cadastro.senha}
                  onChange={e => setCadastro(p => ({ ...p, senha: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ifood/40"
                  placeholder="••••••••"
                  maxLength={8}
                  required
                />
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-ifood font-bold text-sm mb-1">Confirmar Senha:</label>
                <input
                  id="cadastro-confirmar-senha"
                  type="password"
                  value={cadastro.confirmarSenha}
                  onChange={e => setCadastro(p => ({ ...p, confirmarSenha: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ifood/40"
                  placeholder="••••••••"
                  maxLength={8}
                  required
                />
              </div>

              {/* Erro */}
              {cadastroError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <p className="text-red-600 text-xs font-medium">{cadastroError}</p>
                </div>
              )}

              {/* Botão cadastrar */}
              <button
                id="btn-realizar-cadastro"
                type="submit"
                disabled={cadastroLoading}
                className="w-full bg-ifood text-white font-bold py-3.5 rounded-xl text-base shadow-md hover:bg-red-700 transition-colors active:scale-95 disabled:opacity-70 mt-2"
              >
                {cadastroLoading ? 'Cadastrando...' : 'Realizar cadastro!'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setPage('menu')}
                  className="text-gray-400 text-xs underline hover:text-ifood transition-colors"
                >
                  Voltar ao cardápio
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // --- PÁGINA DO CARDÁPIO (menu) ---
  return (
    <div className="min-h-screen pb-24 bg-dots-pattern">
      {headerJSX}

      <main className="p-4 max-w-2xl mx-auto space-y-4">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/20">
          <h2 className="text-xl font-black mb-4 uppercase tracking-tight text-gray-800">Cardápio</h2>
          <div className="space-y-4">
            {products.map(product => (
              <div
                key={product.idproduto}
                className="group bg-white p-3 rounded-xl shadow-sm border-2 border-transparent hover:border-ifood transition-all cursor-pointer flex gap-4 items-center"
                onClick={() => addToTray(product)}
              >
                <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                  <img
                    src={getProductImage(product.nome)}
                    alt={product.nome}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/200x200/ea1d2c/white?text=DATA+BURGER";
                    }}
                  />
                </div>
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

      {/* BOTÃO FLUTUANTE DO CARRINHO */}
      {tray.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
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

      {/* MODAL DO CARRINHO */}
      {showTray && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-xl animate-slide-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Minha Bandeja</h2>
              <button onClick={() => setShowTray(false)} className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {tray.map(item => (
                <div key={item.idproduto} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.nome}</h4>
                    <p className="text-sm text-gray-500">R$ {parseFloat(item.valor).toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="flex items-center gap-3 border rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.idproduto, -1)} className="text-ifood font-bold px-2">-</button>
                    <span className="text-sm font-semibold">{item.quantidade}</span>
                    <button onClick={() => updateQuantity(item.idproduto, 1)} className="text-ifood font-bold px-2">+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <button
                className="w-full bg-ifood text-white font-bold py-4 rounded-lg shadow-md hover:bg-red-700 transition-colors active:scale-95"
                onClick={() => {
                  alert('Pedido finalizado com sucesso!');
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
