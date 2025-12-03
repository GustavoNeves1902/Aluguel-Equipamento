import { useState, useEffect } from "react";

// --- DADOS MOCKADOS ---
const fabricantesMock = [
  {
    id: 1,
    codigo: "FAB001",
    nome: "Dell",
    cnpj: "00.000.000/0001-00",
    endereco: { logradouro: "Rua Tech", cidade: "São Paulo", estado: "SP" },
  },
  {
    id: 2,
    codigo: "FAB002",
    nome: "HP",
    cnpj: "11.111.111/0001-11",
    endereco: { logradouro: "Av. Inovação", cidade: "Porto Alegre", estado: "RS" },
  },
];

const tiposEquipamentoMock = [
  { id: 1, nome: "Notebook" },
  { id: 2, nome: "Desktop" },
  { id: 3, nome: "Monitor" },
  { id: 4, nome: "Periférico" },
];

const equipamentosMock = [
  {
    id: 1,
    codigo: "EQ001",
    nome: "Latitude 5420",
    tipoId: 1,
    fabricanteId: 1,
    valorDiaria: 120.00,
    caracteristicas: [],
  },
  {
    id: 2,
    codigo: "EQ002",
    nome: "ProDesk 400",
    tipoId: 2,
    fabricanteId: 2,
    valorDiaria: 95.50,
    caracteristicas: [],
  },
];

const clientesMock = [
    {
        id: 1,
        nome: "Empresa Cliente A",
        cpf: "123.456.789-00",
        endereco: { 
            logradouro: "Rua das Flores", 
            numero: "123", 
            complemento: "Sala 1", 
            bairro: "Centro", 
            cidade: "Curitiba", 
            estado: "PR" 
        },
        fone: "(41) 99999-9999",
        email: "contato@clienteA.com"
    }
];

// ------------------------------------------------------------------

export default function App() {
  const [tab, setTab] = useState("alugueis");

  // --- ESTADOS GERAIS ---
  const [fabricantes, setFabricantes] = useState(fabricantesMock);
  const [equipamentos, setEquipamentos] = useState(equipamentosMock);
  const [clientes, setClientes] = useState(clientesMock);
  const [alugueis, setAlugueis] = useState([]);
  
  const [search, setSearch] = useState("");

  // Limpar pesquisa ao trocar de aba
  useEffect(() => {
    setSearch("");
  }, [tab]);

  // --- FORMS STATES ---
  const [fabricanteForm, setFabricanteForm] = useState({
    codigo: "", nome: "", cnpj: "", endereco: { logradouro: "", cidade: "", estado: "" },
  });

  const [equipamentoForm, setEquipamentoForm] = useState({
    codigo: "", nome: "", tipoId: "", fabricanteId: "", valorDiaria: "", caracteristicas: [],
  });

  const [clienteForm, setClienteForm] = useState({
      nome: "", cpf: "", fone: "", email: "",
      endereco: { logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" }
  });

  const [aluguelForm, setAluguelForm] = useState({
      dataPedido: new Date().toISOString().split('T')[0],
      dataInicio: "", horaInicio: "",
      dataDevolucao: "", horaDevolucao: "",
      equipamentoId: "",
      clienteId: "",
      valorTotal: 0
  });

  // --- LÓGICA DE ALUGUEL ---
  useEffect(() => {
    if (aluguelForm.dataInicio && aluguelForm.dataDevolucao && aluguelForm.equipamentoId) {
        const start = new Date(aluguelForm.dataInicio);
        const end = new Date(aluguelForm.dataDevolucao);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        
        const equip = equipamentos.find(e => e.id === Number(aluguelForm.equipamentoId));
        if (equip) {
            setAluguelForm(prev => ({ ...prev, valorTotal: diffDays * equip.valorDiaria }));
        }
    }
  }, [aluguelForm.dataInicio, aluguelForm.dataDevolucao, aluguelForm.equipamentoId, equipamentos]);


  // --- FUNÇÕES DE CADASTRO ---
  function cadastrarFabricante() {
    const novo = { id: Date.now(), ...fabricanteForm };
    setFabricantes([...fabricantes, novo]);
    alert("Fabricante cadastrado!");
  }

  function cadastrarEquipamento() {
     const novo = { id: Date.now(), ...equipamentoForm, valorDiaria: Number(equipamentoForm.valorDiaria) };
    setEquipamentos([...equipamentos, novo]);
    alert("Equipamento cadastrado!");
  }

  function cadastrarCliente() {
      const novo = { id: Date.now(), ...clienteForm };
      setClientes([...clientes, novo]);
      alert("Cliente cadastrado com sucesso!");
      setClienteForm({
        nome: "", cpf: "", fone: "", email: "",
        endereco: { logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" }
      });
  }

  function registrarAluguel() {
      if (!aluguelForm.clienteId || !aluguelForm.equipamentoId) {
          alert("Selecione Cliente e Equipamento.");
          return;
      }
      const novo = { id: Date.now(), ...aluguelForm };
      setAlugueis([...alugueis, novo]);
      alert("Pedido de Aluguel Registrado!");
      setAluguelForm({
        dataPedido: new Date().toISOString().split('T')[0],
        dataInicio: "", horaInicio: "", dataDevolucao: "", horaDevolucao: "",
        equipamentoId: "", clienteId: "", valorTotal: 0
      });
  }

  // --- FILTROS ATUALIZADOS ---
  const equipamentosFiltrados = equipamentos.filter(e => 
    e.nome.toLowerCase().includes(search.toLowerCase()) || 
    e.codigo.toLowerCase().includes(search.toLowerCase())
  );

  // Filtro de Clientes (Inclui Endereço)
  const clientesFiltrados = clientes.filter(c => {
      const s = search.toLowerCase();
      return (
        c.nome.toLowerCase().includes(s) ||
        c.cpf.includes(s) ||
        c.endereco?.logradouro?.toLowerCase().includes(s) ||
        c.endereco?.bairro?.toLowerCase().includes(s) ||
        c.endereco?.cidade?.toLowerCase().includes(s)
      );
  });

  // Filtro de Aluguéis (Consulta Pedido)
  const alugueisFiltrados = alugueis.filter(a => {
      const s = search.toLowerCase();
      const cliente = clientes.find(c => c.id === Number(a.clienteId));
      const equip = equipamentos.find(e => e.id === Number(a.equipamentoId));
      
      return (
          a.id.toString().includes(s) || // Busca por ID do pedido
          cliente?.nome.toLowerCase().includes(s) || // Busca por Cliente
          equip?.nome.toLowerCase().includes(s) // Busca por Equipamento
      );
  });

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden flex flex-col min-h-[800px]">
        
        {/* CABEÇALHO */}
        <div className="bg-blue-800 p-6 text-white shadow-md z-10">
            <h1 className="text-3xl font-bold text-center tracking-wide">Sistema de Gestão de Ativos</h1>
            <p className="text-center text-blue-200 text-sm mt-1">Controle de Equipamentos e Locações</p>
        </div>

        {/* NAVEGAÇÃO (TABS) */}
        <div className="flex bg-gray-50 border-b overflow-x-auto">
            {["alugueis", "clientes", "equipamentos", "fabricantes"].map((t) => (
                <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-4 px-6 text-sm font-bold uppercase tracking-wider transition-all duration-300 border-b-4 ${
                        tab === t 
                        ? "border-blue-600 text-blue-800 bg-white" 
                        : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                >
                    {t === "alugueis" ? "Emissão de Aluguel" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
            ))}
        </div>

        {/* CONTEÚDO */}
        <div className="p-8 flex-1 overflow-y-auto bg-gray-50/50">
            
            {/* === ABA ALUGUÉIS === */}
            {tab === "alugueis" && (
                <div className="animate-fade-in space-y-8">
                    
                    {/* FORMULÁRIO */}
                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-100 pb-4 mb-6 text-center uppercase">
                            Formulário de Emissão de Aluguel
                        </h2>

                        {/* LINHA 1: DATAS */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                            <div className="md:col-span-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Pedido</label>
                                <input type="date" className="w-full p-2 border rounded bg-gray-50" value={aluguelForm.dataPedido} readOnly />
                            </div>
                            <div className="md:col-span-4 grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Início Locação</label>
                                    <input type="date" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                                        onChange={e => setAluguelForm({...aluguelForm, dataInicio: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora</label>
                                    <input type="time" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        onChange={e => setAluguelForm({...aluguelForm, horaInicio: e.target.value})} />
                                </div>
                            </div>
                            <div className="md:col-span-4 grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prev. Devolução</label>
                                    <input type="date" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        onChange={e => setAluguelForm({...aluguelForm, dataDevolucao: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora</label>
                                    <input type="time" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        onChange={e => setAluguelForm({...aluguelForm, horaDevolucao: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        {/* SEÇÃO: DADOS DO EQUIPAMENTO */}
                        <div className="mb-6 border rounded-lg p-4 bg-blue-50/30 border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 uppercase mb-4 border-b border-blue-200 pb-2">Dados do Equipamento Locado</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-600 mb-1">Selecione o Equipamento</label>
                                    <select className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
                                        onChange={e => setAluguelForm({...aluguelForm, equipamentoId: e.target.value})}>
                                        <option value="">-- Selecione --</option>
                                        {equipamentos.map(e => (
                                            <option key={e.id} value={e.id}>{e.codigo} - {e.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                {aluguelForm.equipamentoId && (
                                    <>
                                        <div className="p-3 bg-gray-100 rounded text-sm text-gray-600">
                                            <span className="font-bold block text-xs uppercase text-gray-400">Tipo de Equipamento</span>
                                            {tiposEquipamentoMock.find(t => t.id === equipamentos.find(eq => eq.id === Number(aluguelForm.equipamentoId)).tipoId)?.nome}
                                        </div>
                                        <div className="p-3 bg-gray-100 rounded text-sm text-gray-600">
                                            <span className="font-bold block text-xs uppercase text-gray-400">Valor da Diária</span>
                                            R$ {equipamentos.find(eq => eq.id === Number(aluguelForm.equipamentoId)).valorDiaria.toFixed(2)}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* SEÇÃO: DADOS DO CLIENTE */}
                        <div className="mb-6 border rounded-lg p-4 bg-green-50/30 border-green-100">
                            <h3 className="text-sm font-bold text-green-800 uppercase mb-4 border-b border-green-200 pb-2">Dados Cliente</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-600 mb-1">Selecione o Cliente</label>
                                    <select className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
                                        onChange={e => setAluguelForm({...aluguelForm, clienteId: e.target.value})}>
                                        <option value="">-- Selecione --</option>
                                        {clientes.map(c => (
                                            <option key={c.id} value={c.id}>{c.nome} (CPF: {c.cpf})</option>
                                        ))}
                                    </select>
                                </div>
                                {aluguelForm.clienteId && (
                                    <>
                                        <div className="md:col-span-2 p-3 bg-gray-100 rounded text-sm text-gray-600">
                                            <span className="font-bold block text-xs uppercase text-gray-400">Endereço Completo</span>
                                            {(() => {
                                                const c = clientes.find(cl => cl.id === Number(aluguelForm.clienteId));
                                                return `${c.endereco.logradouro}, ${c.endereco.numero} ${c.endereco.complemento} - ${c.endereco.bairro}, ${c.endereco.cidade}/${c.endereco.estado}`;
                                            })()}
                                        </div>
                                        <div className="p-3 bg-gray-100 rounded text-sm text-gray-600">
                                            <span className="font-bold block text-xs uppercase text-gray-400">Telefone</span>
                                            {clientes.find(cl => cl.id === Number(aluguelForm.clienteId)).fone}
                                        </div>
                                        <div className="p-3 bg-gray-100 rounded text-sm text-gray-600">
                                            <span className="font-bold block text-xs uppercase text-gray-400">Email</span>
                                            {clientes.find(cl => cl.id === Number(aluguelForm.clienteId)).email}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* DETALHES FINANCEIROS */}
                        <div className="bg-gray-800 text-white p-6 rounded-lg mb-8">
                            <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">Detalhes Financeiros da Locação</h3>
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-sm text-gray-400 block mb-1">Cálculo: (Dias x Valor Diária)</span>
                                    <div className="text-3xl font-mono text-yellow-400">
                                        R$ {aluguelForm.valorTotal.toFixed(2)}
                                    </div>
                                </div>
                                <button onClick={registrarAluguel} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded font-bold shadow-lg transform active:scale-95 transition-all">
                                    Registrar Pedido Aluguel &gt;&gt;
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* CONSULTA DE ALUGUEIS */}
                    <div className="mt-8">
                        <div className="flex justify-between items-end mb-4 px-2">
                             <h3 className="text-lg font-bold text-gray-700 border-l-4 border-blue-500 pl-2">Consultar Pedidos de Aluguel</h3>
                             <span className="text-sm text-gray-500">{alugueisFiltrados.length} encontrados</span>
                        </div>
                        
                        {/* BARRA DE PESQUISA DE ALUGUEL */}
                        <input 
                            className="w-full p-3 mb-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="🔍 Buscar por Nº do Pedido, Nome do Cliente ou Equipamento..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                         <div className="bg-white rounded-lg shadow border overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipamento</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {alugueisFiltrados.map((a) => {
                                        const cli = clientes.find(c => c.id === Number(a.clienteId));
                                        const equip = equipamentos.find(e => e.id === Number(a.equipamentoId));
                                        return (
                                            <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">#{a.id.toString().slice(-4)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cli?.nome || "Cliente Removido"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equip?.nome || "Item Removido"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(a.dataInicio).toLocaleDateString()} - {new Date(a.dataDevolucao).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">R$ {a.valorTotal.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                    {alugueisFiltrados.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400 text-sm">
                                                {alugueis.length === 0 ? "Nenhum aluguel registrado." : "Nenhum pedido encontrado com esse filtro."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                         </div>
                    </div>
                </div>
            )}

            {/* === ABA CLIENTES === */}
            {tab === "clientes" && (
                <div className="animate-fade-in">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-green-600 pl-2">Cadastro de Cliente</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow-sm">
                        <input className="p-2 border rounded" placeholder="Nome Completo" value={clienteForm.nome} onChange={e => setClienteForm({...clienteForm, nome: e.target.value})} />
                        <input className="p-2 border rounded" placeholder="CPF" value={clienteForm.cpf} onChange={e => setClienteForm({...clienteForm, cpf: e.target.value})} />
                        <input className="p-2 border rounded" placeholder="Telefone" value={clienteForm.fone} onChange={e => setClienteForm({...clienteForm, fone: e.target.value})} />
                        <input className="p-2 border rounded" placeholder="Email" value={clienteForm.email} onChange={e => setClienteForm({...clienteForm, email: e.target.value})} />
                        
                        <div className="md:col-span-2 border-t pt-4 mt-2">
                            <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase">Endereço</h4>
                            <div className="grid grid-cols-6 gap-2">
                                <input className="col-span-4 p-2 border rounded" placeholder="Logradouro (Rua)" value={clienteForm.endereco.logradouro} onChange={e => setClienteForm({...clienteForm, endereco: {...clienteForm.endereco, logradouro: e.target.value}})} />
                                <input className="col-span-2 p-2 border rounded" placeholder="Número" value={clienteForm.endereco.numero} onChange={e => setClienteForm({...clienteForm, endereco: {...clienteForm.endereco, numero: e.target.value}})} />
                                <input className="col-span-3 p-2 border rounded" placeholder="Complemento" value={clienteForm.endereco.complemento} onChange={e => setClienteForm({...clienteForm, endereco: {...clienteForm.endereco, complemento: e.target.value}})} />
                                <input className="col-span-3 p-2 border rounded" placeholder="Bairro" value={clienteForm.endereco.bairro} onChange={e => setClienteForm({...clienteForm, endereco: {...clienteForm.endereco, bairro: e.target.value}})} />
                                <input className="col-span-4 p-2 border rounded" placeholder="Cidade" value={clienteForm.endereco.cidade} onChange={e => setClienteForm({...clienteForm, endereco: {...clienteForm.endereco, cidade: e.target.value}})} />
                                <input className="col-span-2 p-2 border rounded" placeholder="UF" value={clienteForm.endereco.estado} onChange={e => setClienteForm({...clienteForm, endereco: {...clienteForm.endereco, estado: e.target.value}})} />
                            </div>
                        </div>
                    </div>
                    <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700" onClick={cadastrarCliente}>Salvar Cliente</button>

                    <div className="mt-8">
                        <div className="flex justify-between items-end mb-2">
                             <h3 className="text-lg font-bold text-gray-700">Clientes Cadastrados</h3>
                             <span className="text-sm text-gray-500">{clientesFiltrados.length} encontrados</span>
                        </div>
                        
                        {/* BARRA DE PESQUISA DE CLIENTES */}
                        <input 
                            className="w-full p-3 mb-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 outline-none" 
                            placeholder="🔍 Buscar por Nome, CPF, Rua, Bairro ou Cidade..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <div className="space-y-2">
                            {clientesFiltrados.map(c => (
                                <div key={c.id} className="p-4 bg-white border rounded shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between">
                                        <div className="font-bold text-gray-800">{c.nome}</div>
                                        <div className="text-sm text-gray-500">CPF: {c.cpf}</div>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                        📍 {c.endereco.logradouro}, {c.endereco.numero} - {c.endereco.bairro}, {c.endereco.cidade}/{c.endereco.estado}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        {c.email} • {c.fone}
                                    </div>
                                </div>
                            ))}
                             {clientesFiltrados.length === 0 && (
                                <p className="text-center text-gray-400 py-4 border rounded bg-white border-dashed">Nenhum cliente encontrado.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* === ABAS ORIGINAIS (FABRICANTES/EQUIPAMENTOS) === */}
            {tab === "equipamentos" && (
                <div className="animate-fade-in">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-purple-600 pl-2">Novo Equipamento</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow-sm">
                        <input className="p-2 border rounded" placeholder="Código" value={equipamentoForm.codigo} onChange={e => setEquipamentoForm({...equipamentoForm, codigo: e.target.value})} />
                        <input className="p-2 border rounded" placeholder="Nome" value={equipamentoForm.nome} onChange={e => setEquipamentoForm({...equipamentoForm, nome: e.target.value})} />
                        <select className="p-2 border rounded" onChange={e => setEquipamentoForm({...equipamentoForm, tipoId: Number(e.target.value)})}>
                            <option value="">Tipo</option>
                            {tiposEquipamentoMock.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                        </select>
                        <select className="p-2 border rounded" onChange={e => setEquipamentoForm({...equipamentoForm, fabricanteId: Number(e.target.value)})}>
                            <option value="">Fabricante</option>
                            {fabricantes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                        </select>
                        <input className="p-2 border rounded md:col-span-2" placeholder="Valor Diária (R$)" type="number" value={equipamentoForm.valorDiaria} onChange={e => setEquipamentoForm({...equipamentoForm, valorDiaria: e.target.value})} />
                    </div>
                    <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded shadow hover:bg-purple-700" onClick={cadastrarEquipamento}>Salvar Equipamento</button>
                    
                    <div className="mt-8">
                        {/* BARRA DE PESQUISA DE EQUIPAMENTOS */}
                        <input 
                            className="w-full p-3 mb-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                            placeholder="🔍 Buscar Equipamento por Nome ou Código..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="space-y-2">
                            {equipamentosFiltrados.map(e => (
                                <div key={e.id} className="p-3 bg-white border rounded flex justify-between">
                                    <span>{e.nome} ({e.codigo})</span>
                                    <span className="font-bold text-green-600">Diária: R$ {Number(e.valorDiaria).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {tab === "fabricantes" && (
                <div className="animate-fade-in">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-gray-600 pl-2">Fabricantes</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow-sm">
                        <input className="p-2 border rounded" placeholder="Nome" value={fabricanteForm.nome} onChange={e => setFabricanteForm({...fabricanteForm, nome: e.target.value})} />
                        <input className="p-2 border rounded" placeholder="Código" value={fabricanteForm.codigo} onChange={e => setFabricanteForm({...fabricanteForm, codigo: e.target.value})} />
                     </div>
                     <button className="mt-4 bg-gray-600 text-white px-6 py-2 rounded shadow hover:bg-gray-700" onClick={cadastrarFabricante}>Salvar Fabricante</button>
                     <div className="mt-8 space-y-2">
                        {fabricantes.map(f => <div key={f.id} className="p-3 bg-white border rounded">{f.nome}</div>)}
                     </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}