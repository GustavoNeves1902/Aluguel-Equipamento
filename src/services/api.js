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
/* ===================== CHATBOT (IA) ===================== */
export async function chatbotGet(mensagem) {
  try {
    const res = await fetch(
      `/chatbot/chatbot?mensagem=${encodeURIComponent(mensagem)}`,
      { cache: "no-store" }
    );

    const data = await res.json();

    // 🔴 CASO: erro do Gemini veio como STRING dentro de mensagemPadrao
    if (typeof data.mensagemPadrao === "string") {
      try {
        const erroGemini = JSON.parse(data.mensagemPadrao);

        if (erroGemini?.error?.code === 429) {
          return {
            mensagemPadrao:
              "Infelizmente, seu limite de perguntas foi atingido. Tente novamente mais tarde.",
          };
        }
      } catch {
        // se não for JSON válido, segue fluxo normal
      }
    }

    // 🔴 OUTROS ERROS
    if (data?.error) {
      return {
        mensagemPadrao: "Não foi possível processar sua pergunta no momento.",
      };
    }

    // ✅ RESPOSTA NORMAL
    return data;
  } catch (error) {
    return {
      mensagemPadrao:
        "O serviço de inteligência artificial está indisponível no momento.",
    };
  }
}
