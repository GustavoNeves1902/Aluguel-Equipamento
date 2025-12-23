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

    const diaria = Number(eq.valorDiaria || eq.valor_diaria || eq.valor);
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
      nome: form.nome,
      valorDiaria: Number(form.valorDiaria),
      tipoEquipamentoId: Number(form.tipoId),
    };

    await apiPost("/equipamento/cadastrar", payload);
    setEquipamentos(await apiGet("/equipamento"));
  }

  async function handleAddEndereco(form) {
    if (!form.cep || !form.cidadeId || !form.bairroId || !form.logradouroId) {
      alert("Preencha todos os campos do endereço");
      return;
    }

    const payload = {
      cep: form.cep,
      cidadeId: Number(form.cidadeId),
      bairroId: Number(form.bairroId),
      logradouroId: Number(form.logradouroId),
    };

    try {
      await apiPost("/endereco/cadastrar", payload);
      const enderecosAtualizados = await apiGet("/endereco");
      setEnderecos(enderecosAtualizados);
      alert("Endereço cadastrado com sucesso!");
    } catch (err) {
      console.error("Erro ao cadastrar endereço:", err);
      alert("Erro ao cadastrar endereço (verifique o console)");
    }
  }

  async function handleAddCliente(form) {
    if (!form.enderecoId || !form.nroCasa || !form.primeiroNome || !form.cpf) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const payload = {
      primeiroNome: form.primeiroNome,
      sobreNome: form.sobreNome || "",
      cpf: form.cpf,
      email: form.email,
      fone: form.fone,
      enderecoId: Number(form.enderecoId),
      nroCasa: Number(form.nroCasa),
      complemento: form.complemento || null,
    };

    try {
      await apiPost("/cliente/cadastrar", payload);
      const clientesAtualizados = await apiGet("/cliente");
      setClientes(clientesAtualizados);
      alert("Cliente cadastrado com sucesso!");
    } catch (err) {
      console.error("Erro ao cadastrar cliente:", err);
      alert("Erro ao cadastrar cliente (verifique o console)");
    }
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
      nroAluguel: `ALG-${Date.now()}`,
      dataPedido: aluguelForm.dataPedido,
      dataInicioLocacao: aluguelForm.dataInicio,
      dataPrevistoDevolucao: aluguelForm.dataDevolucao,
      valorDiaria: Number(eq.valorDiaria),
      valorLocacao: Number(total),
      equipamentoId: Number(aluguelForm.equipamentoId),
      clienteId: Number(aluguelForm.clienteId),
    };

    try {
      await apiPost("/pedido-aluguel-equipamento/cadastrar", payload);
      alert("Aluguel registrado com sucesso!");
      carregarTudo();
    } catch (err) {
      console.error("Erro ao salvar aluguel:", err);
      alert("Erro ao registrar aluguel");
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
              enderecos={enderecos}
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
      <ul className="mt-4">
        {tipos.map((t) => (
          <li key={t.id}>
            <strong>ID {t.id}</strong> — {t.nome}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function EquipamentosPage({ equipamentos, tipos, onAdd }) {
  const [form, setForm] = useState({ nome: "", valorDiaria: "", tipoId: "" });
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
      <ul className="mt-4">
        {equipamentos.map((e) => (
          <li key={e.id}>
            <strong>ID {e.id}</strong> — {e.nome} — R$ {e.valorDiaria}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ClientesPage({ clientes, enderecos, onAdd }) {
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
      <div className="grid grid-cols-5 gap-2">
        <input
          className="border p-2"
          placeholder="Nome"
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
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        <select
          className="border p-2"
          value={form.enderecoId}
          onChange={(e) => setForm({ ...form, enderecoId: e.target.value })}
        >
          <option value="">Selecione um endereço</option>
          {enderecos.map((end) => (
            <option key={end.id} value={end.id}>
              {end.logradouro.tipoLogradouro.sigla} {end.logradouro.nome},{" "}
              {end.bairro.nome} – {end.cidade.nome} (CEP {end.cep})
            </option>
          ))}
        </select>
        <input
          className="border p-2"
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
        Cadastrar
      </button>
      <ul className="mt-4 space-y-1">
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

function EnderecosPage({ enderecos, cidades, bairros, logradouros, onAdd }) {
  const [form, setForm] = useState({
    cep: "",
    cidadeId: "",
    bairroId: "",
    logradouroId: "",
  });
  return (
    <Card title="Cadastro de Endereços">
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
              {l.tipo} {l.nome}
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
        Cadastrar
      </button>
      <ul className="mt-4">
        {enderecos.map((e) => (
          <li key={e.id}>
            {e.logradouro?.tipo} {e.logradouro?.nome}, {e.bairro?.nome},{" "}
            {e.cidade?.nome} — CEP {e.cep}
          </li>
        ))}
      </ul>
    </Card>
  );
}
