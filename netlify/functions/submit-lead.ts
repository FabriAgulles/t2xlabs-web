import type { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";

const ALLOWED_ORIGIN = "https://www.t2xlabs.com";

const headers = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function json(statusCode: number, body: Record<string, unknown>): HandlerResponse {
  return { statusCode, headers, body: JSON.stringify(body) };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const handler: Handler = async (event: HandlerEvent) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return json(204, {});
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const { AIRTABLE_BASE_ID, AIRTABLE_TOKEN } = process.env;
  if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
    return json(500, { error: "Server configuration error" });
  }

  let body: Record<string, string>;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const { nombre, email, empresa, companySize, budget, interest, mensaje } = body;

  // Validate required fields (aligned with client form)
  if (!nombre || !email || !empresa || !companySize || !budget || !interest) {
    return json(400, { error: "Missing required fields: nombre, email, empresa, companySize, budget, interest" });
  }

  if (!EMAIL_RE.test(email)) {
    return json(400, { error: "Invalid email format" });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Leads`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                Nombre: nombre,
                Email: email,
                Empresa: empresa,
                "TamañoEmpresa": companySize,
                Presupuesto: budget,
                "InterésPrincipal": interest,
                Mensaje: mensaje || "",
                Estado: "Nuevo",
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return json(response.status, { error: err?.error?.message || "Airtable error" });
    }

    const data = await response.json();
    return json(200, { success: true, id: data.records?.[0]?.id });
  } catch {
    return json(502, { error: "Failed to connect to Airtable" });
  }
};

export { handler };
