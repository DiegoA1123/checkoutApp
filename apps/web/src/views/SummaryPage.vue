<template>
  <AppShell>
    <div class="space-y-4">
      <div class="rounded-3xl bg-white shadow-sm border p-4">
        <div class="text-sm text-slate-500">Paso 3</div>
        <h2 class="text-xl font-semibold">Resumen</h2>
        <p class="text-sm text-slate-500">Revisa los totales y paga</p>
      </div>

      <div v-if="!tx.id" class="rounded-3xl bg-white border p-4 text-sm">
        Transacción no encontrada. <button class="text-indigo-600 underline" @click="router.push('/')">Volver al producto</button>
      </div>

      <div v-else class="rounded-3xl bg-white shadow-sm border p-4 space-y-3">
        <Row label="Product" :value="formatCOP(tx.breakdown.productAmountCents)" />
        <Row label="Base fee" :value="formatCOP(tx.breakdown.baseFeeCents)" />
        <Row label="Delivery" :value="formatCOP(tx.breakdown.deliveryFeeCents)" />
        <div class="h-px bg-slate-100"></div>
        <Row label="Total" :value="formatCOP(tx.breakdown.totalAmountCents)" bold />

        <div class="text-xs text-slate-500">
          Referencia de transacción: <span class="font-mono">{{ tx.reference }}</span>
        </div>

        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>

        <PrimaryButton :disabled="paying" @click="payNow">
          {{ paying ? "Procesando..." : "Pagar" }}
        </PrimaryButton>
      </div>

      <BackdropPanel v-if="paying">
        <div class="space-y-2">
          <div class="font-semibold">Procesando pago</div>
          <div class="text-sm text-slate-500">
            Creando fuente de pago y completando transacción…
          </div>
        </div>
      </BackdropPanel>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import AppShell from "../components/AppShell.vue";
import PrimaryButton from "../components/PrimaryButton.vue";
import BackdropPanel from "../components/BackdropPanel.vue";
import {createCardToken } from "../services/wompi";
import { payTransaction } from "../services/payment";

const store = useStore();
const router = useRouter();

const tx = computed(() => store.state.transaction);
const card = computed(() => store.state.card);
const customer = computed(() => store.state.customer);

const paying = ref(false);
const error = ref("");

function formatCOP(cents: number) {
  const value = cents / 100;
  return value.toLocaleString("es-CO", { style: "currency", currency: "COP" });
}

async function payNow() {
  error.value = "";
  if (!tx.value.id) return;

  paying.value = true;
  try {
    const cardToken = await createCardToken(card.value);

    const updated = await payTransaction(tx.value.id, {
      cardToken,
      customerEmail: customer.value.email,
    });

    store.commit("setTransaction", { status: updated.status });
    store.commit("setStep", 4);
    await router.push(`/status/${tx.value.id}`);
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || "Payment failed";
  } finally {
    paying.value = false;
  }
}
</script>

<script lang="ts">
export default {
  components: {
    Row: {
      props: { label: String, value: String, bold: Boolean },
      template: `
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-600">{{ label }}</div>
          <div :class="bold ? 'font-semibold' : 'font-medium'" class="text-sm">{{ value }}</div>
        </div>
      `,
    },
  },
};
</script>