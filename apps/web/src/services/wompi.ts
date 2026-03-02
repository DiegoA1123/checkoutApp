import axios from "axios";

const BASE = import.meta.env.VITE_WOMPI_BASE_URL;
const PUB = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

function authHeaders() {
  if (!PUB) throw new Error("Missing VITE_WOMPI_PUBLIC_KEY");
  return { Authorization: `Bearer ${PUB}` };
}

export async function getAcceptanceTokens() {
  const res = await axios.get(`${BASE}/merchants/${PUB}`);

  return {
    acceptanceToken: res.data?.data?.presigned_acceptance?.acceptance_token,
    personalDataToken:
      res.data?.data?.presigned_personal_data_auth?.acceptance_token,
  };
}

export async function createCardToken(card: any) {
  const res = await axios.post(
    `${BASE}/tokens/cards`,
    {
      // ✅ importante: sin espacios
      number: String(card.number).replace(/\s+/g, ""),
      exp_month: String(card.expMonth),
      exp_year: String(card.expYear),
      cvc: String(card.cvc),
      card_holder: String(card.holder),
    },
    { headers: authHeaders() },
  );

  return res.data?.data?.id;
}

function headers() {
  return { Authorization: `Bearer ${PUB}` };
}

export async function createPaymentSource(
  token: string,
  customerEmail: string,
  tokens: { acceptanceToken?: string; personalDataToken?: string },
) {
  const payload: any = {
    type: "CARD",
    token,
    customer_email: customerEmail,
    acceptance_token: tokens.acceptanceToken,
  };

  if (tokens.personalDataToken) {
    payload.accept_personal_auth = tokens.personalDataToken;
  }

  const res = await axios.post(`${BASE}/payment_sources`, payload, {
    headers: headers(),
  });
  return res.data?.data?.id;
}
