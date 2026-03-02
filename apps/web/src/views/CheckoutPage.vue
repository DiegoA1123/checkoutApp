<template>
  <AppShell>
    <div class="space-y-4">
      <div class="rounded-3xl bg-white shadow-sm border p-4 space-y-1">
        <div class="text-sm text-slate-500">Paso 2</div>
        <h2 class="text-xl font-semibold">Tarjeta y Domicilio</h2>
      </div>

      <div v-if="!selectedProduct" class="rounded-3xl bg-white border p-4 text-sm">
        Ningun producto seleccionado. <button class="text-indigo-600 underline" @click="router.push('/')">Atras</button>
      </div>

      <div v-else class="rounded-3xl bg-white shadow-sm border p-4 space-y-4">
        <div class="text-sm text-slate-600">
          <span class="font-medium">{{ selectedProduct.name }}</span> · {{ formatCOP(selectedProduct.price) ?? '' }}
        </div>

        <div class="space-y-3">
          <TextField label="Nombre completo" v-model="customer.fullName" />
          <TextField label="Email" v-model="customer.email" type="email" />
          <TextField label="Telefono" v-model="customer.phone" />
        </div>

        <div class="h-px bg-slate-100"></div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="text-sm font-medium text-slate-700">Detalles de la tarjeta</div>
            <div v-if="brand" class="text-xs text-slate-500">{{ brand }}</div>
          </div>

          <TextField
            label="Numero de tarjeta"
            v-model="card.number"
            placeholder="4111 1111 1111 1111"
            :error="cardNumberError"
          />

          <div class="grid grid-cols-2 gap-3">
            <TextField label="Mes de expiracion" v-model="card.expMonth" placeholder="12" />
            <TextField label="Año de expiracion" v-model="card.expYear" placeholder="30" />
          </div>

          <TextField label="CVC" v-model="card.cvc" placeholder="123" />
          <TextField label="Titular de la tarjeta" v-model="card.holder" placeholder="TEST USER" />
        </div>

        <div class="h-px bg-slate-100"></div>

        <div class="space-y-3">
          <div class="text-sm font-medium text-slate-700">Domicilio</div>
          <TextField label="Direccion" v-model="delivery.address" />
          <TextField label="Ciudad" v-model="delivery.city" />
          <TextField label="Notas" v-model="delivery.notes" />
        </div>

        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>

        <PrimaryButton :disabled="submitting || !canContinue" @click="createPending">
          Continue
        </PrimaryButton>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import AppShell from "../components/AppShell.vue";
import PrimaryButton from "../components/PrimaryButton.vue";
import TextField from "../components/TextField.vue";
import { detectBrand, luhnCheck } from "../utils/card";
import { createPendingTransaction } from "../services/payment";

const store = useStore();
const router = useRouter();

const selectedProduct = computed(() => store.state.selectedProduct);

const customer = reactive({ ...store.state.customer });
const delivery = reactive({ ...store.state.delivery });
const card = reactive({ ...store.state.card });

watch(customer, () => store.commit("setCustomer", customer), { deep: true });
watch(delivery, () => store.commit("setDelivery", delivery), { deep: true });
watch(card, () => store.commit("setCard", card), { deep: true });

const brand = computed(() => detectBrand(card.number));
const cardNumberError = computed(() => {
  if (!card.number) return "";
  return luhnCheck(card.number) ? "" : "Invalid card number (Luhn)";
});

const canContinue = computed(() => {
  return (
    !!selectedProduct.value &&
    customer.fullName && customer.email && customer.phone &&
    delivery.address && delivery.city &&
    card.number && !cardNumberError.value &&
    card.expMonth && card.expYear && card.cvc && card.holder
  );
});

const submitting = ref(false);
const error = ref("");

function formatCOP(cents: number) {
  const value = cents / 100;
  return value.toLocaleString("es-CO", { style: "currency", currency: "COP" });
}

async function createPending() {
  error.value = "";
  if (!selectedProduct.value) return;

  submitting.value = true;
  try {
    const res = await createPendingTransaction({
      productId: selectedProduct.value.id,
      customer,
      delivery,
    });

    store.commit("setTransaction", {
      id: res.transactionId,
      reference: res.reference,
      totalAmountCents: res.breakdown.totalAmountCents,
      breakdown: res.breakdown,
      status: "PENDING",
    });

    store.commit("setStep", 3);
    await router.push("/summary");
  } catch (e: any) {
    error.value = e?.response?.data?.message || "Failed to create transaction";
  } finally {
    submitting.value = false;
  }
}
</script>