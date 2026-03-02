import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export async function createPendingTransaction(payload: any) {
  const res = await api.post("/transactions", payload);
  return res.data;
}

export async function payTransaction(
  transactionId: string,
  payload: { cardToken: string; customerEmail: string },
) {
  const res = await api.post(`/transactions/${transactionId}/pay`, payload);
  return res.data;
}

export async function getTransaction(transactionId: string) {
  const res = await api.get(`/transactions/${transactionId}`);
  return res.data;
}

export async function syncTransaction(transactionId: string) {
  const res = await api.post(`/transactions/${transactionId}/sync`);
  return res.data;
}
