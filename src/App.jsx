import React, { useEffect, useState } from "react";

/* ===================== MOCKS INICIAIS ===================== */

const enderecosMock = [
  { id: 1, logradouro: "Rua Tech", cidade: "São Paulo", estado: "SP", cep: "01000-000" },
  { id: 2, logradouro: "Av. Inovação", cidade: "Porto Alegre", estado: "RS", cep: "90000-000" },
];

const tiposEquipamentoMock = [
  { id: 1, nome: "Notebook" },
  { id: 2, nome: "Desktop" },
  { id: 3, nome: "Monitor" },
];

const fabricantesMock = [
  { id: 1, codigo: "FAB001", nome: "Dell", cnpj: "00.000.000/0001-00", enderecoId: 1, numero: "123", complemento: "Sala 01" },
  { id: 2, codigo: "FAB002", nome: "HP", cnpj: "11.111.111/0001-11", enderecoId: 2, numero: "500", complemento: "" },
];

const equipamentosMock = [
  { id: 1, codigo: "EQ001", nome: "Latitude 5420", tipoId: 1, fabricanteId: 1, valorDiaria: 120.0, caracteristicasValores: {} },
  { id: 2, codigo: "EQ002", nome: "ProDesk 400", tipoId: 2, fabricanteId: 2, valorDiaria: 95.5, caracteristicasValores: {} },
];

const clientesMock = [
  {
    id: 1,
    nome: "Empresa Cliente A",
    cpf: "123.456.789-00",
    endereco: { logradouro: "Rua das Flores", numero: "123", complemento: "Sala 1", bairro: "Centro", cidade: "Curitiba", estado: "PR" },
    fone: "(41) 99999-9999",
    email: "contato@clienteA.com"
  }
];

const caracteristicasMock = [
  { id: 1, nome: "Processador", unidade: "GHz" },
  { id: 2, nome: "Memória RAM", unidade: "GB" },
];

/* ===================== UTIL HELPERS ===================== */

const nowISODate = () => new Date().toISOString().split("T")[0];

function daysBetweenInclusive(startISO, endISO) {
  try {
    const a = new Date(startISO);
    const b = new Date(endISO);
    const diff = Math.ceil(Math.abs(b - a) / (1000 * 60 * 60 * 24));
    return diff === 0 ? 1 : diff;
  } catch (e) {
    return 1;
  }
}

/* ===================== SUB-COMPONENTS ===================== */

/* Small input group to keep UI tidy */
function Field({ label, children, className = "" }) {
  return (
    <div className={`mb-2 ${className}`}>
      {label && <label className="block text-sm text-gray-600 mb-1">{label}</label>}
      {children}
    </div>
  );
}

/* Endereços Page */
function EnderecosPage({ enderecos, onAddEndereco, onRemoveEndereco }) {
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState({ logradouro: "", cidade: "", estado: "", cep: "" });

  const filtrados = enderecos.filter((e) =>
    `${e.logradouro} ${e.cidade} ${e.estado} ${e.cep}`.toLowerCase().includes(busca.toLowerCase())
  );

  function submit(e) {
    e.preventDefault();
    onAddEndereco(form);
    setForm({ logradouro: "", cidade: "", estado: "", cep: "" });
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Endereços</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-2 mb-3">
          <input className="flex-1 p-2 border rounded" placeholder="Buscar endereço..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="p-2 border rounded col-span-2" placeholder="Logradouro" value={form.logradouro} onChange={(e) => setForm({ ...form, logradouro: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} />
          <input className="p-2 border rounded" placeholder="CEP" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} />
          <div className="md:col-span-4 flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Adicionar Endereço</button>
            <button type="button" className="px-4 py-2 bg-gray-100 rounded" onClick={() => setForm({ logradouro: "", cidade: "", estado: "", cep: "" })}>Limpar</button>
          </div>
        </form>
      </div>

      <div className="space-y-2">
        {filtrados.length === 0 && <div className="text-gray-500">Nenhum endereço encontrado.</div>}
        {filtrados.map((e) => (
          <div key={e.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
            <div>
              <div className="font-medium">{e.logradouro}</div>
              <div className="text-sm text-gray-500">{e.cidade} - {e.estado} • CEP: {e.cep}</div>
            </div>
            <div>
              <button className="text-red-500" onClick={() => onRemoveEndereco(e.id)}>Remover</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Tipos de Equipamento Page */
function TiposEquipamentoPage({ tipos, onAddTipo, onRemoveTipo }) {
  const [nome, setNome] = useState("");
  const [busca, setBusca] = useState("");

  const filtrados = tipos.filter((t) => t.nome.toLowerCase().includes(busca.toLowerCase()));

  function submit(e) {
    e.preventDefault();
    onAddTipo(nome);
    setNome("");
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Tipos de Equipamento</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-2 mb-3">
          <input className="flex-1 p-2 border rounded" placeholder="Buscar tipo..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>

        <form className="flex gap-2" onSubmit={submit}>
          <input className="flex-1 p-2 border rounded" placeholder="Nome do tipo" value={nome} onChange={(e) => setNome(e.target.value)} />
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Adicionar</button>
        </form>
      </div>

      <ul className="space-y-2">
        {filtrados.map((t) => (
          <li key={t.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
            <div>{t.nome}</div>
            <button className="text-red-500" onClick={() => onRemoveTipo(t.id)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Fabricantes Page */
function FabricantesPage({ fabricantes, enderecos, onAddFabricante }) {
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState({ codigo: "", nome: "", cnpj: "", enderecoId: "", numero: "", complemento: "" });

  const filtrados = fabricantes.filter((f) => {
    const enderecoStr = f.enderecoCompleto || "";
    return `${f.nome} ${f.codigo} ${enderecoStr}`.toLowerCase().includes(busca.toLowerCase());
  });

  function submit(e) {
    e.preventDefault();
    onAddFabricante(form);
    setForm({ codigo: "", nome: "", cnpj: "", enderecoId: "", numero: "", complemento: "" });
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Fabricantes</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-2 mb-3">
          <input className="flex-1 p-2 border rounded" placeholder="Buscar fabricante..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="p-2 border rounded col-span-1" placeholder="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
          <input className="p-2 border rounded col-span-2" placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <input className="p-2 border rounded col-span-3" placeholder="CNPJ" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />

          <select className="p-2 border rounded" value={form.enderecoId} onChange={(e) => setForm({ ...form, enderecoId: e.target.value })}>
            <option value="">Selecione endereço (pré-cadastrado)</option>
            {enderecos.map((en) => <option key={en.id} value={en.id}>{en.logradouro} — {en.cidade}/{en.estado}</option>)}
          </select>

          <input className="p-2 border rounded" placeholder="Número" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Complemento" value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} />

          <div className="md:col-span-3 flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Cadastrar Fabricante</button>
            <button type="button" className="px-4 py-2 bg-gray-100 rounded" onClick={() => setForm({ codigo: "", nome: "", cnpj: "", enderecoId: "", numero: "", complemento: "" })}>Limpar</button>
          </div>
        </form>
      </div>

      <div className="space-y-2">
        {filtrados.length === 0 && <div className="text-gray-500">Nenhum fabricante encontrado.</div>}
        {filtrados.map((f) => (
          <div key={f.id} className="p-3 bg-white rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{f.nome} <span className="text-xs text-gray-500 ml-2">({f.codigo})</span></div>
                <div className="text-sm text-gray-500">CNPJ: {f.cnpj}</div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {f.enderecoCompleto || "Endereço não informado"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Equipamentos Page */
function EquipamentosPage({ equipamentos, tiposEquipamento, fabricantes, caracteristicas, onAddEquipamento }) {
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState({ codigo: "", nome: "", tipoId: "", fabricanteId: "", valorDiaria: "" });
  const [caractValores, setCaractValores] = useState({});

  const filtrados = equipamentos.filter((e) => `${e.nome} ${e.codigo}`.toLowerCase().includes(busca.toLowerCase()));

  function submit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      tipoId: form.tipoId ? Number(form.tipoId) : null,
      fabricanteId: form.fabricanteId ? Number(form.fabricanteId) : null,
      valorDiaria: Number(form.valorDiaria) || 0,
      caracteristicasValores: { ...caractValores },
    };
    onAddEquipamento(payload);
    setForm({ codigo: "", nome: "", tipoId: "", fabricanteId: "", valorDiaria: "" });
    setCaractValores({});
  }

  function handleCaract(id, value) {
    setCaractValores(prev => ({ ...prev, [id]: value }));
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Equipamentos</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-2 mb-3">
          <input className="flex-1 p-2 border rounded" placeholder="Buscar equipamento..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="p-2 border rounded" placeholder="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
          <input className="p-2 border rounded col-span-2" placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <select className="p-2 border rounded" value={form.tipoId} onChange={(e) => setForm({ ...form, tipoId: e.target.value })}>
            <option value="">Selecione tipo</option>
            {tiposEquipamento.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          <select className="p-2 border rounded" value={form.fabricanteId} onChange={(e) => setForm({ ...form, fabricanteId: e.target.value })}>
            <option value="">Selecione fabricante</option>
            {fabricantes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          <input className="p-2 border rounded" placeholder="Valor diária (R$)" type="number" value={form.valorDiaria} onChange={(e) => setForm({ ...form, valorDiaria: e.target.value })} />

          <div className="md:col-span-3">
            <div className="text-sm font-semibold mb-2">Características técnicas (preencher valores)</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {caracteristicas.map(c => (
                <div key={c.id}>
                  <label className="block text-sm mb-1">{c.nome} ({c.unidade})</label>
                  <input className="p-2 border rounded w-full" value={caractValores[c.id] || ""} onChange={(e) => handleCaract(c.id, e.target.value)} placeholder={`Valor (${c.unidade})`} />
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Cadastrar Equipamento</button>
            <button type="button" className="px-4 py-2 bg-gray-100 rounded" onClick={() => { setForm({ codigo: "", nome: "", tipoId: "", fabricanteId: "", valorDiaria: "" }); setCaractValores({}); }}>Limpar</button>
          </div>
        </form>
      </div>

      <div className="space-y-2">
        {filtrados.length === 0 && <div className="text-gray-500">Nenhum equipamento encontrado.</div>}
        {filtrados.map(eq => {
          const tipo = tiposEquipamento.find(t => t.id === eq.tipoId);
          const fab = fabricantes.find(f => f.id === eq.fabricanteId);
          return (
            <div key={eq.id} className="p-3 bg-white rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{eq.nome} <span className="text-xs text-gray-500 ml-2">({eq.codigo})</span></div>
                  <div className="text-sm text-gray-500">Tipo: {tipo?.nome || "—"} • Fabricante: {fab?.nome || "—"}</div>
                </div>
                <div className="font-bold text-green-600">R$ {(Number(eq.valorDiaria) || 0).toFixed(2)}</div>
              </div>

              {eq.caracteristicasValores && Object.keys(eq.caracteristicasValores).length > 0 && (
                <div className="mt-2 text-sm">
                  <strong>Características:</strong>
                  <ul className="list-disc list-inside">
                    {Object.entries(eq.caracteristicasValores).map(([id, v]) => {
                      const c = caracteristicas.find(cc => cc.id === Number(id));
                      return <li key={id}>{c?.nome || id}: {v} {c?.unidade || ""}</li>;
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Características Page */
function CaracteristicasPage({ caracteristicas, onAdd, onRemove }) {
  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("");
  const [busca, setBusca] = useState("");

  const filtrados = caracteristicas.filter(c => `${c.nome} ${c.unidade}`.toLowerCase().includes(busca.toLowerCase()));

  function submit(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    onAdd({ nome: nome.trim(), unidade: unidade.trim() });
    setNome("");
    setUnidade("");
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Características Técnicas</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-2 mb-3">
          <input className="flex-1 p-2 border rounded" placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>

        <form onSubmit={submit} className="flex gap-2">
          <input className="p-2 border rounded flex-1" placeholder="Nome da característica" value={nome} onChange={(e) => setNome(e.target.value)} />
          <input className="p-2 border rounded w-40" placeholder="Unidade (ex: GB)" value={unidade} onChange={(e) => setUnidade(e.target.value)} />
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Adicionar</button>
        </form>
      </div>

      <ul className="space-y-2">
        {filtrados.map(c => (
          <li key={c.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
            <div>
              <div className="font-medium">{c.nome}</div>
              <div className="text-sm text-gray-500">{c.unidade}</div>
            </div>
            <button className="text-red-500" onClick={() => onRemove(c.id)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Clientes Page */
function ClientesPage({ clientes, onAddCliente }) {
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState({
    nome: "", cpf: "", fone: "", email: "",
    endereco: { logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" }
  });

  const filtrados = clientes.filter(c => {
    const s = busca.toLowerCase();
    return (
      c.nome.toLowerCase().includes(s) ||
      c.cpf.includes(s) ||
      c.endereco?.logradouro?.toLowerCase()?.includes(s) ||
      c.endereco?.bairro?.toLowerCase()?.includes(s) ||
      c.endereco?.cidade?.toLowerCase()?.includes(s)
    );
  });

  function submit(e) {
    e.preventDefault();
    onAddCliente(form);
    setForm({
      nome: "", cpf: "", fone: "", email: "",
      endereco: { logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" }
    });
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Clientes</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-2 mb-3">
          <input className="flex-1 p-2 border rounded" placeholder="Buscar cliente..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="p-2 border rounded" placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <input className="p-2 border rounded" placeholder="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Telefone" value={form.fone} onChange={(e) => setForm({ ...form, fone: e.target.value })} />
          <input className="p-2 border rounded md:col-span-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <div className="md:col-span-3 border-t pt-3">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
              <input className="col-span-4 p-2 border rounded" placeholder="Logradouro" value={form.endereco.logradouro} onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, logradouro: e.target.value } })} />
              <input className="col-span-2 p-2 border rounded" placeholder="Número" value={form.endereco.numero} onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, numero: e.target.value } })} />
              <input className="col-span-3 p-2 border rounded" placeholder="Complemento" value={form.endereco.complemento} onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, complemento: e.target.value } })} />
              <input className="col-span-3 p-2 border rounded" placeholder="Bairro" value={form.endereco.bairro} onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, bairro: e.target.value } })} />
              <input className="col-span-4 p-2 border rounded" placeholder="Cidade" value={form.endereco.cidade} onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, cidade: e.target.value } })} />
              <input className="col-span-2 p-2 border rounded" placeholder="Estado" value={form.endereco.estado} onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, estado: e.target.value } })} />
            </div>
          </div>

          <div className="md:col-span-3 flex gap-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded" type="submit">Cadastrar Cliente</button>
            <button type="button" className="px-4 py-2 bg-gray-100 rounded" onClick={() => setForm({
              nome: "", cpf: "", fone: "", email: "",
              endereco: { logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" }
            })}>Limpar</button>
          </div>
        </form>
      </div>

      <div className="space-y-2">
        {filtrados.length === 0 && <div className="text-gray-500">Nenhum cliente encontrado.</div>}
        {filtrados.map(c => (
          <div key={c.id} className="p-3 bg-white rounded shadow">
            <div className="flex justify-between">
              <div className="font-medium">{c.nome}</div>
              <div className="text-sm text-gray-500">CPF: {c.cpf}</div>
            </div>
            <div className="text-sm text-gray-600 mt-1">{c.endereco.logradouro}, {c.endereco.numero} {c.endereco.complemento ? `- ${c.endereco.complemento}` : ""} • {c.endereco.bairro}, {c.endereco.cidade}/{c.endereco.estado}</div>
            <div className="text-xs text-gray-400 mt-2">{c.email} • {c.fone}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Emissão de Alugueis Page */
function AlugueisPage({
  alugueis, clientes, equipamentos, tiposEquipamento,
  onRegistrarAluguel, aluguelForm, setAluguelForm
}) {
  const [search, setSearch] = useState("");

  const filtrados = alugueis.filter(a => {
    const s = search.toLowerCase();
    const cli = clientes.find(c => c.id === Number(a.clienteId));
    const eq = equipamentos.find(e => e.id === Number(a.equipamentoId));
    return (
      a.id.toString().includes(s) ||
      cli?.nome?.toLowerCase().includes(s) ||
      eq?.nome?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Emissão de Aluguéis</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <Field label="Data do pedido">
              <input className="p-2 border rounded w-full" type="date" value={aluguelForm.dataPedido} readOnly />
            </Field>
          </div>

          <div className="md:col-span-4">
            <Field label="Início">
              <input className="p-2 border rounded w-full" type="date" value={aluguelForm.dataInicio} onChange={(e) => setAluguelForm(prev => ({ ...prev, dataInicio: e.target.value }))} />
            </Field>
            <Field label="Hora início">
              <input className="p-2 border rounded w-full" type="time" value={aluguelForm.horaInicio || ""} onChange={(e) => setAluguelForm(prev => ({ ...prev, horaInicio: e.target.value }))} />
            </Field>
          </div>

          <div className="md:col-span-4">
            <Field label="Previsão Devolução">
              <input className="p-2 border rounded w-full" type="date" value={aluguelForm.dataDevolucao} onChange={(e) => setAluguelForm(prev => ({ ...prev, dataDevolucao: e.target.value }))} />
            </Field>
            <Field label="Hora devolução">
              <input className="p-2 border rounded w-full" type="time" value={aluguelForm.horaDevolucao || ""} onChange={(e) => setAluguelForm(prev => ({ ...prev, horaDevolucao: e.target.value }))} />
            </Field>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <Field label="Equipamento">
              <select className="p-2 border rounded w-full" value={aluguelForm.equipamentoId || ""} onChange={(e) => setAluguelForm(prev => ({ ...prev, equipamentoId: e.target.value }))}>
                <option value="">-- selecione --</option>
                {equipamentos.map(eq => <option key={eq.id} value={eq.id}>{eq.codigo} — {eq.nome}</option>)}
              </select>
            </Field>
          </div>

          <div className="md:col-span-1">
            <Field label="Cliente">
              <select className="p-2 border rounded w-full" value={aluguelForm.clienteId || ""} onChange={(e) => setAluguelForm(prev => ({ ...prev, clienteId: e.target.value }))}>
                <option value="">-- selecione --</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome} (CPF: {c.cpf})</option>)}
              </select>
            </Field>
          </div>

          <div className="md:col-span-1">
            <Field label="Resumo">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">Valor total estimado</div>
                <div className="text-xl font-mono text-green-600">R$ {(aluguelForm.valorTotal || 0).toFixed(2)}</div>
              </div>
            </Field>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => onRegistrarAluguel()}>Registrar Pedido</button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Pedidos de Aluguel</h3>
          <input className="p-2 border rounded" placeholder="Buscar pedidos..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="space-y-2">
          {filtrados.length === 0 && <div className="text-gray-500">Nenhum aluguel cadastrado ou nenhum resultado.</div>}
          {filtrados.map(a => {
            const cli = clientes.find(c => c.id === Number(a.clienteId));
            const eq = equipamentos.find(e => e.id === Number(a.equipamentoId));
            return (
              <div key={a.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
                <div>
                  <div className="font-medium">Pedido #{a.id.toString().slice(-6)}</div>
                  <div className="text-sm text-gray-500">{cli?.nome || "Cliente removido"} — {eq?.nome || "Equipamento removido"}</div>
                  <div className="text-sm text-gray-500">{new Date(a.dataInicio).toLocaleDateString()} → {new Date(a.dataDevolucao).toLocaleDateString()}</div>
                </div>
                <div className="font-bold text-green-600">R$ {(a.valorTotal || 0).toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ===================== APP PRINCIPAL ÚNICO ===================== */

export default function App() {
  /* ---------- Estados (iniciais via mocks) ---------- */
  const [tab, setTab] = useState("alugueis");

  const [enderecos, setEnderecos] = useState(enderecosMock);
  const [tiposEquipamento, setTiposEquipamento] = useState(tiposEquipamentoMock);
  const [fabricantes, setFabricantes] = useState(fabricantesMock);
  const [equipamentos, setEquipamentos] = useState(equipamentosMock);
  const [clientes, setClientes] = useState(clientesMock);
  const [caracteristicas, setCaracteristicas] = useState(caracteristicasMock);
  const [alugueis, setAlugueis] = useState([]);

  /* formulário de aluguel */
  const [aluguelForm, setAluguelForm] = useState({
    dataPedido: nowISODate(),
    dataInicio: "", horaInicio: "",
    dataDevolucao: "", horaDevolucao: "",
    equipamentoId: "", clienteId: "", valorTotal: 0
  });

  /* busca global (usada dentro páginas quando necessário) */
  const [globalSearch, setGlobalSearch] = useState("");
  useEffect(() => setGlobalSearch(""), [tab]);

  /* ---------- Funções de negócio ---------- */

  // Endereços
  function handleAddEndereco(payload) {
    const novo = { id: Date.now(), ...payload };
    setEnderecos(prev => [...prev, novo]);
  }
  function handleRemoveEndereco(id) {
    if (!confirm("Remover endereço? Será desvinculado de fabricantes que o usam.")) return;
    setEnderecos(prev => prev.filter(e => e.id !== id));
    setFabricantes(prev => prev.map(f => (f.enderecoId === id ? { ...f, enderecoId: null, enderecoCompleto: null } : f)));
  }

  // Tipos
  function handleAddTipo(nome) {
    if (!nome || !nome.trim()) return;
    const novo = { id: Date.now(), nome: nome.trim() };
    setTiposEquipamento(prev => [...prev, novo]);
  }
  function handleRemoveTipo(id) {
    if (!confirm("Remover tipo? Equipamentos vinculados manterão a referência.")) return;
    setTiposEquipamento(prev => prev.filter(t => t.id !== id));
  }

  // Fabricantes
  function handleAddFabricante(form) {
    if (!form.nome || !form.codigo) { alert("Código e nome são obrigatórios."); return; }
    const enderecoBase = enderecos.find(en => en.id === Number(form.enderecoId));
    const enderecoCompleto = enderecoBase ? `${enderecoBase.logradouro}${form.numero ? `, ${form.numero}` : ""}${form.complemento ? ` - ${form.complemento}` : ""} • ${enderecoBase.cidade}/${enderecoBase.estado} • CEP:${enderecoBase.cep}` : null;
    const novo = {
      id: Date.now(),
      codigo: form.codigo,
      nome: form.nome,
      cnpj: form.cnpj || "",
      enderecoId: form.enderecoId ? Number(form.enderecoId) : null,
      numero: form.numero || "",
      complemento: form.complemento || "",
      enderecoCompleto
    };
    setFabricantes(prev => [...prev, novo]);
  }

  // Equipamentos
  function handleAddEquipamento(form) {
    if (!form.nome || !form.codigo) { alert("Código e nome do equipamento são obrigatórios."); return; }
    const novo = {
      id: Date.now(),
      codigo: form.codigo,
      nome: form.nome,
      tipoId: form.tipoId ? Number(form.tipoId) : null,
      fabricanteId: form.fabricanteId ? Number(form.fabricanteId) : null,
      valorDiaria: form.valorDiaria ? Number(form.valorDiaria) : 0,
      caracteristicasValores: form.caracteristicasValores || {},
    };
    setEquipamentos(prev => [...prev, novo]);
  }

  // Características
  function handleAddCaracteristica({ nome, unidade }) {
    if (!nome) return;
    const novo = { id: Date.now(), nome, unidade };
    setCaracteristicas(prev => [...prev, novo]);
  }
  function handleRemoveCaracteristica(id) {
    if (!confirm("Remover característica? Equipamentos com valores serão mantidos, mas a característica será removida da lista de cadastro.")) return;
    setCaracteristicas(prev => prev.filter(c => c.id !== id));
    setEquipamentos(prev => prev.map(eq => {
      const copy = { ...eq };
      if (copy.caracteristicasValores) {
        const clone = { ...copy.caracteristicasValores };
        delete clone[id];
        copy.caracteristicasValores = clone;
      }
      return copy;
    }));
  }

  // Clientes
  function handleAddCliente(form) {
    if (!form.nome || !form.cpf) { alert("Nome e CPF são obrigatórios."); return; }
    const novo = { id: Date.now(), ...form };
    setClientes(prev => [...prev, novo]);
  }

  // Aluguéis
  useEffect(() => {
    const { dataInicio, dataDevolucao, equipamentoId } = aluguelForm;
    if (dataInicio && dataDevolucao && equipamentoId) {
      const dias = daysBetweenInclusive(dataInicio, dataDevolucao);
      const eq = equipamentos.find(e => e.id === Number(equipamentoId));
      const total = (eq?.valorDiaria || 0) * dias;
      setAluguelForm(prev => ({ ...prev, valorTotal: total }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aluguelForm.dataInicio, aluguelForm.dataDevolucao, aluguelForm.equipamentoId, equipamentos]);

  function handleRegistrarAluguel() {
    if (!aluguelForm.equipamentoId || !aluguelForm.clienteId) { alert("Selecione equipamento e cliente."); return; }
    const novo = { id: Date.now(), ...aluguelForm };
    setAlugueis(prev => [...prev, novo]);
    alert("Aluguel registrado!");
    setAluguelForm({ dataPedido: nowISODate(), dataInicio: "", horaInicio: "", dataDevolucao: "", horaDevolucao: "", equipamentoId: "", clienteId: "", valorTotal: 0 });
  }

  /* ===================== RENDERIZAÇÃO ===================== */

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="max-w-6xl mx-auto">
        <header className="bg-blue-700 text-white p-6 rounded-t">
          <h1 className="text-2xl font-bold">Sistema de Gestão - Aluguéis e Ativos</h1>
          <p className="text-sm text-blue-100">Gerencie endereços, fabricantes, equipamentos, tipos, clientes e aluguéis</p>
        </header>

        <nav className="bg-white p-3 rounded-b shadow flex gap-2 mt-4 overflow-x-auto">
          <TabButton active={tab === "alugueis"} onClick={() => setTab("alugueis")}>Emissão de Aluguéis</TabButton>
          <TabButton active={tab === "clientes"} onClick={() => setTab("clientes")}>Clientes</TabButton>
          <TabButton active={tab === "equipamentos"} onClick={() => setTab("equipamentos")}>Equipamentos</TabButton>
          <TabButton active={tab === "fabricantes"} onClick={() => setTab("fabricantes")}>Fabricantes</TabButton>
          <TabButton active={tab === "tipos"} onClick={() => setTab("tipos")}>Tipos</TabButton>
          <TabButton active={tab === "caracteristicas"} onClick={() => setTab("caracteristicas")}>Características</TabButton>
          <TabButton active={tab === "enderecos"} onClick={() => setTab("enderecos")}>Endereços</TabButton>
        </nav>

        <main className="mt-6">
          {tab === "alugueis" && (
            <AlugueisPage
              alugueis={alugueis}
              clientes={clientes}
              equipamentos={equipamentos}
              tiposEquipamento={tiposEquipamento}
              onRegistrarAluguel={handleRegistrarAluguel}
              aluguelForm={aluguelForm}
              setAluguelForm={setAluguelForm}
            />
          )}

          {tab === "clientes" && (
            <ClientesPage clientes={clientes} onAddCliente={handleAddCliente} />
          )}

          {tab === "equipamentos" && (
            <EquipamentosPage
              equipamentos={equipamentos}
              tiposEquipamento={tiposEquipamento}
              fabricantes={fabricantes}
              caracteristicas={caracteristicas}
              onAddEquipamento={handleAddEquipamento}
            />
          )}

          {tab === "fabricantes" && (
            <FabricantesPage fabricantes={fabricantes} enderecos={enderecos} onAddFabricante={handleAddFabricante} />
          )}

          {tab === "tipos" && (
            <TiposEquipamentoPage tipos={tiposEquipamento} onAddTipo={handleAddTipo} onRemoveTipo={handleRemoveTipo} />
          )}

          {tab === "caracteristicas" && (
            <CaracteristicasPage caracteristicas={caracteristicas} onAdd={handleAddCaracteristica} onRemove={handleRemoveCaracteristica} />
          )}

          {tab === "enderecos" && (
            <EnderecosPage enderecos={enderecos} onAddEndereco={(payload) => handleAddEndereco(payload)} onRemoveEndereco={handleRemoveEndereco} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ===================== COMPONENTES AUXILIARES ===================== */

function TabButton({ children, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded font-semibold ${active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
    >
      {children}
    </button>
  );
}

/* ===================== FIM DO ARQUIVO ===================== */
