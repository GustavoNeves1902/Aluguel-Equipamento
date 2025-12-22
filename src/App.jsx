import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "./services/api";

/* ===================== HELPERS ===================== */

const todayISO = () => new Date().toISOString().split("T")[0];

function daysBetween(start, end) {
  const a = new Date(start);
  const b = new Date(end);
  return Math.max(1, Math.ceil((b - a) / (1000 * 60 * 60 * 24)));
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

  /* ===================== LOAD INICIAL ===================== */

  async function carregarTudo() {
    setClientes(await apiGet("/cliente"));
    setTiposEquipamento(await apiGet("/tipo-equipamento"));
    setEquipamentos(await apiGet("/equipamento"));
    setAlugueis(await apiGet("/pedido-aluguel-equipamento"));
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
    const payload = {
      primeiroNome: form.primeiroNome,
      sobreNome: form.sobreNome || "",
      cpf: form.cpf,
      emails: [{ enderecoEmail: form.email }],
      fones: [{ numero: form.fone, ddd: { id: 1 }, ddi: { id: 1 } }],
      enderecoResidencial: {
        endereco: { id: 1 },
        complemento: "Residencial",
        nroCasa: 100,
      },
    };

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
            <ClientesPage clientes={clientes} onAdd={handleAddCliente} />
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

function ClientesPage({ clientes, onAdd }) {
  const [form, setForm] = useState({
    primeiroNome: "",
    sobreNome: "",
    cpf: "",
    email: "",
    fone: "",
  });

  return (
    <Card title="Clientes">
      <div className="grid grid-cols-5 gap-2">
        <input
          className="border p-2"
          placeholder="Nome"
          onChange={(e) => setForm({ ...form, primeiroNome: e.target.value })}
        />
        <input
          className="border p-2"
          placeholder="Sobrenome"
          onChange={(e) => setForm({ ...form, sobreNome: e.target.value })}
        />
        <input
          className="border p-2"
          placeholder="CPF"
          onChange={(e) => setForm({ ...form, cpf: e.target.value })}
        />
        <input
          className="border p-2"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="border p-2"
          placeholder="Telefone"
          onChange={(e) => setForm({ ...form, fone: e.target.value })}
        />
      </div>

      <button
        className="mt-3 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => onAdd(form)}
      >
        Cadastrar
      </button>

      <ul className="mt-4">
        {clientes.map((c) => (
          <li key={c.id}>
            {c.primeiroNome} {c.sobreNome}
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
            {a.nroAluguel} — R$ {a.valorLocacao}
          </li>
        ))}
      </ul>
    </Card>
  );
}
