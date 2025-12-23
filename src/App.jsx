import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "./services/api";

/* ===================== HELPERS ===================== */

const todayISO = () => new Date().toISOString().split("T")[0];

function daysBetween(start, end) {
  const a = new Date(start);
  const b = new Date(end);

  // Zerando horas, minutos, segundos e ms
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);

  const diff = (b - a) / (1000 * 60 * 60 * 24);
  return Math.max(1, diff); // garante pelo menos 1 diária
}

/* ===================== APP ===================== */

export default function App() {
  const [tab, setTab] = useState("alugueis");

  const [tiposEquipamento, setTiposEquipamento] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [alugueis, setAlugueis] = useState([]);

  const [aluguelForm, setAluguelForm] = useState({
    dataPedido: todayISO(),
    dataInicio: "",
    dataDevolucao: "",
    equipamentoId: "",
    clienteId: "",
  });

  const [enderecos, setEnderecos] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [logradouros, setLogradouros] = useState([]);

  /* ===================== LOAD INICIAL ===================== */

  async function carregarTudo() {
    setClientes(await apiGet("/cliente"));
    setTiposEquipamento(await apiGet("/tipo-equipamento"));
    setEquipamentos(await apiGet("/equipamento"));
    setAlugueis(await apiGet("/pedido-aluguel-equipamento"));
    setEnderecos(await apiGet("/endereco"));
    setCidades(await apiGet("/cidade"));
    setBairros(await apiGet("/bairro"));
    setLogradouros(await apiGet("/logradouro"));
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  /* ===================== CALCULO TOTAL (DERIVADO) ===================== */

  function calcularTotal() {
    console.log("EQUIPAMENTOS:", equipamentos);
    console.log("FORM:", aluguelForm);
    if (
      !aluguelForm.dataInicio ||
      !aluguelForm.dataDevolucao ||
      !aluguelForm.equipamentoId
    )
      return 0;

    const eq = equipamentos.find(
      (e) => String(e.id) === String(aluguelForm.equipamentoId)
    );

    if (!eq) return 0;

    const diaria =
      Number(eq.valorDiaria) || Number(eq.valor_diaria) || Number(eq.valor);

    if (!diaria) return 0;

    const dias = daysBetween(aluguelForm.dataInicio, aluguelForm.dataDevolucao);

    return dias * diaria;
  }

  /* ===================== CRUD ===================== */

  async function handleAddTipo(nome) {
    if (!nome) return;
    await apiPost("/tipo-equipamento/cadastrar", { nome });
    setTiposEquipamento(await apiGet("/tipo-equipamento"));
  }

  async function handleAddEquipamento(form) {
    if (!form.nome || !form.valorDiaria || !form.tipoId) {
      alert("Preencha todos os campos");
      return;
    }

    const payload = {
      id: 1,
      nome: form.nome,
      valorDiaria: Number(form.valorDiaria),
      tipoEquipamento: { id: Number(form.tipoId) },
    };

    await apiPost("/equipamento/cadastrar", payload);
    setEquipamentos(await apiGet("/equipamento"));
  }

  async function handleAddCliente(form) {
    if (!form.enderecoId) {
      alert("Selecione um endereço");
      return;
    }

    const payload = {
      primeiroNome: form.primeiroNome,
      sobreNome: form.sobreNome || "",
      cpf: form.cpf,

      emails: [{ enderecoEmail: form.email }],

      fones: [
        {
          numero: form.fone,
          ddd: { id: 3 },
          ddi: { id: 1 },
        },
      ],

      enderecoResidencial: {
        endereco: {
          id: Number(form.enderecoId), // 👈 vindo do select
        },
        complemento: form.complemento,
        nroCasa: Number(form.nroCasa),
      },
    };

    console.log("PAYLOAD CLIENTE:", payload);

    await apiPost("/cliente/cadastrar", payload);
    setClientes(await apiGet("/cliente"));
  }

  async function handleRegistrarAluguel() {
    const total = calcularTotal();

    if (
      !aluguelForm.dataInicio ||
      !aluguelForm.dataDevolucao ||
      !aluguelForm.equipamentoId ||
      !aluguelForm.clienteId ||
      total <= 0
    ) {
      alert("Preencha todos os campos do aluguel");
      return;
    }

    const eq = equipamentos.find(
      (e) => String(e.id) === String(aluguelForm.equipamentoId)
    );

    if (!eq) {
      alert("Equipamento inválido");
      return;
    }

    const payload = {
      // 🔴 NÃO ENVIE ID
      nroAluguel: `ALG-${Date.now()}`,

      // 🔴 OBRIGATÓRIO
      dataPedido: aluguelForm.dataPedido,

      dataInicioLocacao: aluguelForm.dataInicio,
      dataPrevistoDevolucao: aluguelForm.dataDevolucao,

      // 🔴 OBRIGATÓRIOS
      valorDiaria: Number(eq.valorDiaria),
      valorLocacao: Number(total),

      equipamento: {
        id: Number(aluguelForm.equipamentoId),
      },
      cliente: {
        id: Number(aluguelForm.clienteId),
      },
    };

    console.log("PAYLOAD FINAL (IGUAL AO BACKEND):");
    console.log(JSON.stringify(payload, null, 2));

    try {
      await apiPost("/pedido-aluguel-equipamento/cadastrar", payload);
      alert("Aluguel registrado com sucesso!");
      carregarTudo();
    } catch (err) {
      console.error("Erro real:", err);
      alert("Erro ao salvar aluguel");
    }
  }

  async function handleAddEndereco(form) {
    if (!form.cep || !form.cidadeId || !form.bairroId || !form.logradouroId) {
      alert("Preencha todos os campos do endereço");
      return;
    }

    const payload = {
      cep: form.cep,
      cidade: { id: Number(form.cidadeId) },
      bairro: { id: Number(form.bairroId) },
      logradouro: { id: Number(form.logradouroId) },
    };

    console.log("PAYLOAD ENDEREÇO:", payload);

    await apiPost("/endereco/cadastrar", payload);
    setEnderecos(await apiGet("/endereco"));
  }

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="bg-blue-700 text-white p-6 rounded">
          <h1 className="text-2xl font-bold">Sistema de Aluguel</h1>
          <p className="text-blue-100">Integrado com API Spring</p>
        </header>

        <nav className="bg-white mt-4 p-3 rounded shadow flex gap-2">
          <TabButton
            active={tab === "alugueis"}
            onClick={() => setTab("alugueis")}
          >
            Aluguéis
          </TabButton>
          <TabButton
            active={tab === "clientes"}
            onClick={() => setTab("clientes")}
          >
            Clientes
          </TabButton>
          <TabButton
            active={tab === "equipamentos"}
            onClick={() => setTab("equipamentos")}
          >
            Equipamentos
          </TabButton>
          <TabButton active={tab === "tipos"} onClick={() => setTab("tipos")}>
            Tipos
          </TabButton>
          <TabButton
            active={tab === "enderecos"}
            onClick={() => setTab("enderecos")}
          >
            Endereços
          </TabButton>
        </nav>

        <main className="mt-6 space-y-6">
          {tab === "tipos" && (
            <TiposPage tipos={tiposEquipamento} onAdd={handleAddTipo} />
          )}
          {tab === "equipamentos" && (
            <EquipamentosPage
              equipamentos={equipamentos}
              tipos={tiposEquipamento}
              onAdd={handleAddEquipamento}
            />
          )}
          {tab === "clientes" && (
            <ClientesPage
              clientes={clientes}
              enderecos={enderecos} // 👈 ESSENCIAL
              onAdd={handleAddCliente}
            />
          )}
          {tab === "alugueis" && (
            <AluguelPage
              form={aluguelForm}
              setForm={setAluguelForm}
              equipamentos={equipamentos}
              clientes={clientes}
              alugueis={alugueis}
              onSubmit={handleRegistrarAluguel}
              calcularTotal={calcularTotal}
            />
          )}
          {tab === "enderecos" && (
            <EnderecosPage
              enderecos={enderecos}
              cidades={cidades}
              bairros={bairros}
              logradouros={logradouros}
              onAdd={handleAddEndereco}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ===================== COMPONENTES ===================== */

function TabButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-3 py-2 rounded font-semibold ${
        active ? "bg-blue-600 text-white" : "hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-3">{title}</h2>
      {children}
    </div>
  );
}

/* ===================== PAGES ===================== */

function TiposPage({ tipos, onAdd }) {
  const [nome, setNome] = useState("");
  const [buscaId, setBuscaId] = useState("");

  const tiposFiltrados = tipos.filter((t) => {
    if (!buscaId) return true;
    return String(t.id) === String(buscaId);
  });

  return (
    <Card title="Tipos de Equipamento">
      <input
        className="border p-2 rounded mr-2"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => {
          onAdd(nome);
          setNome("");
        }}
      >
        Adicionar
      </button>

      {/* 🔎 BUSCA POR ID */}
      <div className="mt-4">
        <input
          type="number"
          className="border p-2 rounded w-48"
          placeholder="Buscar tipo por ID"
          value={buscaId}
          onChange={(e) => setBuscaId(e.target.value)}
        />
      </div>

      <ul className="mt-4">
        {tiposFiltrados.length === 0 && (
          <li className="text-gray-500">Nenhum tipo encontrado</li>
        )}

        {tiposFiltrados.map((t) => (
          <li key={t.id}>
            <strong>ID {t.id}</strong> — {t.nome}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function EquipamentosPage({ equipamentos, tipos, onAdd }) {
  const [form, setForm] = useState({
    nome: "",
    valorDiaria: "",
    tipoId: "",
  });

  const [buscaId, setBuscaId] = useState("");

  const equipamentosFiltrados = equipamentos.filter((e) => {
    if (!buscaId) return true;
    return String(e.id) === String(buscaId);
  });

  return (
    <Card title="Equipamentos">
      <div className="grid grid-cols-3 gap-2">
        <input
          className="border p-2 rounded"
          placeholder="Nome"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />

        <input
          className="border p-2 rounded"
          type="number"
          placeholder="Valor diária"
          value={form.valorDiaria}
          onChange={(e) => setForm({ ...form, valorDiaria: e.target.value })}
        />

        <select
          className="border p-2 rounded"
          value={form.tipoId}
          onChange={(e) => setForm({ ...form, tipoId: e.target.value })}
        >
          <option value="">Tipo</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>

      <button
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => {
          onAdd(form);
          setForm({ nome: "", valorDiaria: "", tipoId: "" });
        }}
      >
        Cadastrar
      </button>

      {/* 🔎 BUSCA POR ID */}
      <div className="mt-4">
        <input
          type="number"
          className="border p-2 rounded w-48"
          placeholder="Buscar por ID"
          value={buscaId}
          onChange={(e) => setBuscaId(e.target.value)}
        />
      </div>

      <ul className="mt-4">
        {equipamentosFiltrados.length === 0 && (
          <li className="text-gray-500">Nenhum equipamento encontrado</li>
        )}

        {equipamentosFiltrados.map((e) => (
          <li key={e.id}>
            <strong>ID {e.id}</strong> — {e.nome} — R$ {e.valorDiaria}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ClientesPage({ clientes, enderecos = [], onAdd }) {
  const [form, setForm] = useState({
    primeiroNome: "",
    sobreNome: "",
    cpf: "",
    email: "",
    fone: "",
    enderecoId: "",
    nroCasa: "",
    complemento: "",
  });

  return (
    <Card title="Clientes">
      <div className="grid grid-cols-3 gap-2">
        <input
          className="border p-2"
          placeholder="Primeiro nome"
          value={form.primeiroNome}
          onChange={(e) => setForm({ ...form, primeiroNome: e.target.value })}
        />

        <input
          className="border p-2"
          placeholder="Sobrenome"
          value={form.sobreNome}
          onChange={(e) => setForm({ ...form, sobreNome: e.target.value })}
        />

        <input
          className="border p-2"
          placeholder="CPF"
          value={form.cpf}
          onChange={(e) => setForm({ ...form, cpf: e.target.value })}
        />

        <input
          className="border p-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="border p-2"
          placeholder="Telefone"
          value={form.fone}
          onChange={(e) => setForm({ ...form, fone: e.target.value })}
        />

        {/* ENDEREÇO PRÉ-CADASTRADO */}
        <select
          className="border p-2"
          value={form.enderecoId}
          onChange={(e) => setForm({ ...form, enderecoId: e.target.value })}
        >
          <option value="">Selecione o endereço</option>
          {enderecos.map((e) => (
            <option key={e.id} value={e.id}>
              {e.logradouro?.tipoLogradouro?.sigla} {e.logradouro?.nome}
              {" - "}
              {e.bairro?.nome}
              {" - "}
              {e.cidade?.nome}
            </option>
          ))}
        </select>

        <input
          className="border p-2"
          type="number"
          placeholder="Número da casa"
          value={form.nroCasa}
          onChange={(e) => setForm({ ...form, nroCasa: e.target.value })}
        />

        <input
          className="border p-2"
          placeholder="Complemento"
          value={form.complemento}
          onChange={(e) => setForm({ ...form, complemento: e.target.value })}
        />
      </div>

      <button
        className="mt-3 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => {
          onAdd(form);
          setForm({
            primeiroNome: "",
            sobreNome: "",
            cpf: "",
            email: "",
            fone: "",
            enderecoId: "",
            nroCasa: "",
            complemento: "",
          });
        }}
      >
        Cadastrar Cliente
      </button>

      <ul className="mt-4">
        {clientes.map((c) => (
          <li key={c.id}>
            {c.primeiroNome} {c.sobreNome} —{" "}
            {c.enderecoResidencial?.endereco?.logradouro?.tipoLogradouro?.sigla}{" "}
            {c.enderecoResidencial?.endereco?.logradouro?.nome} -{" "}
            {c.enderecoResidencial?.endereco?.cidade?.nome}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function AluguelPage({
  form,
  setForm,
  equipamentos,
  clientes,
  alugueis,
  onSubmit,
  calcularTotal,
}) {
  return (
    <Card title="Novo Aluguel">
      <div className="grid grid-cols-4 gap-2">
        <input
          type="date"
          className="border p-2"
          value={form.dataInicio}
          onChange={(e) =>
            setForm((f) => ({ ...f, dataInicio: e.target.value }))
          }
        />

        <input
          type="date"
          className="border p-2"
          value={form.dataDevolucao}
          onChange={(e) =>
            setForm((f) => ({ ...f, dataDevolucao: e.target.value }))
          }
        />

        <select
          className="border p-2"
          value={form.equipamentoId}
          onChange={(e) =>
            setForm((f) => ({ ...f, equipamentoId: e.target.value }))
          }
        >
          <option value="">Equipamento</option>
          {equipamentos.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>

        <select
          className="border p-2"
          value={form.clienteId}
          onChange={(e) =>
            setForm((f) => ({ ...f, clienteId: e.target.value }))
          }
        >
          <option value="">Cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.primeiroNome} {c.sobreNome}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 font-bold">
        Total: R$ {calcularTotal().toFixed(2)}
      </div>

      <button
        type="button"
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={onSubmit}
      >
        Registrar Aluguel
      </button>

      <ul className="mt-4">
        {alugueis.map((a) => (
          <li key={a.id}>
            {a.cliente.primeiroNome} {a.cliente.sobreNome} —{a.equipamento.nome}{" "}
            -{a.nroAluguel} — R$ {a.valorLocacao}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function EnderecosPage({
  enderecos = [],
  cidades = [],
  bairros = [],
  logradouros = [],
  onAdd,
}) {
  const [form, setForm] = useState({
    cep: "",
    cidadeId: "",
    bairroId: "",
    logradouroId: "",
  });

  const [buscaId, setBuscaId] = useState("");
  const [buscaCep, setBuscaCep] = useState("");

  const enderecosFiltrados = enderecos.filter((e) => {
    if (buscaId && String(e.id) !== String(buscaId)) return false;

    if (buscaCep) {
      const cepEndereco = e.cep.replace(/\D/g, "");
      const cepBusca = buscaCep.replace(/\D/g, "");
      if (cepEndereco !== cepBusca) return false;
    }

    return true;
  });

  return (
    <Card title="Endereços">
      {/* ➕ CADASTRO */}
      <div className="grid grid-cols-4 gap-2">
        <input
          className="border p-2"
          placeholder="CEP"
          value={form.cep}
          onChange={(e) => setForm({ ...form, cep: e.target.value })}
        />

        <select
          className="border p-2"
          value={form.cidadeId}
          onChange={(e) => setForm({ ...form, cidadeId: e.target.value })}
        >
          <option value="">Cidade</option>
          {cidades.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <select
          className="border p-2"
          value={form.bairroId}
          onChange={(e) => setForm({ ...form, bairroId: e.target.value })}
        >
          <option value="">Bairro</option>
          {bairros.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nome}
            </option>
          ))}
        </select>

        <select
          className="border p-2"
          value={form.logradouroId}
          onChange={(e) => setForm({ ...form, logradouroId: e.target.value })}
        >
          <option value="">Logradouro</option>
          {logradouros.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nome}
            </option>
          ))}
        </select>
      </div>

      <button
        className="mt-3 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => {
          onAdd(form);
          setForm({ cep: "", cidadeId: "", bairroId: "", logradouroId: "" });
        }}
      >
        Cadastrar Endereço
      </button>

      {/* 🔎 FILTROS */}
      <div className="mt-4 flex gap-2">
        <input
          type="number"
          className="border p-2"
          placeholder="Buscar por ID"
          value={buscaId}
          onChange={(e) => setBuscaId(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Buscar por CEP"
          value={buscaCep}
          onChange={(e) => setBuscaCep(e.target.value)}
        />
      </div>

      {/* 📋 LISTAGEM */}
      <ul className="mt-4">
        {enderecosFiltrados.map((e) => (
          <li key={e.id}>
            <strong>ID {e.id}</strong> — {e.logradouro?.nome}, {e.bairro?.nome},{" "}
            {e.cidade?.nome} — CEP {e.cep}
          </li>
        ))}
      </ul>
    </Card>
  );
}
