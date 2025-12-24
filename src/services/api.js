const BASE_URL = "/aluguel";

/* ===================== BASE ===================== */

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`);

  if (!res.ok) {
    throw new Error("Erro ao buscar dados");
  }

  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Erro ao salvar dados");
  }

  return res.json();
}

/* ===================== SISTEMA (SEM IA) ===================== */

// CLIENTES
export function listarClientes() {
  return apiGet("/cliente");
}

export function buscarClientePorId(id) {
  return apiGet(`/cliente/${id}`);
}

// ALUGUÉIS
export function listarAlugueis() {
  return apiGet("/pedido-aluguel-equipamento");
}

// EQUIPAMENTOS
export function buscarEquipamentoPorId(id) {
  return apiGet(`/equipamento/${id}`);
}

/* ===================== CHATBOT (IA) ===================== */

export async function chatbotGet(mensagem) {
  const res = await fetch(
    `/chatbot/chatbot?mensagem=${encodeURIComponent(mensagem)}`
  );

  if (!res.ok) {
    throw new Error("Erro ao consultar chatbot");
  }

  return res.json();
}
