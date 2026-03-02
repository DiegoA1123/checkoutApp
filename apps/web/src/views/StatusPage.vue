<template>
  <AppShell>
    <div class="space-y-4">
      <div class="rounded-3xl bg-white shadow-sm border p-4">
        <div class="text-sm text-slate-500">Paso 4</div>
        <h2 class="text-xl font-semibold">Estado de la transacción</h2>
      </div>

      <div class="rounded-3xl bg-white shadow-sm border p-4 space-y-3">
        <div class="text-sm text-slate-500">Transacción</div>
        <div class="font-mono text-xs break-all">{{ id }}</div>

        <div class="mt-2">
          <span
            class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
            :class="badgeClass"
          >
            {{ statusLabel }}
          </span>
        </div>

        <div class="text-sm text-slate-600">
          {{ helperText }}
        </div>

        <div class="text-sm text-slate-500" v-if="loading">
          Consultando estado inicial...
        </div>

        <div class="text-sm text-red-600" v-if="error">
          {{ error }}
        </div>

        <div class="flex gap-2 pt-2">
          <PrimaryButton v-if="statusUpper === 'PENDING'" @click="forceSync">
            Actualizar ahora
          </PrimaryButton>

          <PrimaryButton @click="backToProduct">
            Volver al producto
          </PrimaryButton>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import AppShell from "../components/AppShell.vue";
import PrimaryButton from "../components/PrimaryButton.vue";
import { getTransaction, syncTransaction } from "../services/payment";

const route = useRoute();
const router = useRouter();
const store = useStore();

const id = String(route.params.id);

const loading = ref(false);
const syncing = ref(false);
const error = ref("");

const status = ref<string>("PENDING");

const statusUpper = computed(() => String(status.value || "").toUpperCase());

const badgeClass = computed(() => {
  const s = statusUpper.value;
  if (s === "APPROVED") return "bg-emerald-100 text-emerald-700";
  if (s === "DECLINED") return "bg-red-100 text-red-700";
  if (s === "ERROR") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
});

const statusLabel = computed(() => {
  const s = statusUpper.value;
  if (s === "APPROVED") return "APROBADO";
  if (s === "DECLINED") return "RECHAZADO";
  if (s === "ERROR") return "ERROR";
  return "PENDIENTE";
});

const helperText = computed(() => {
  const s = statusUpper.value;

  if (s === "PENDING") {
    return syncing.value
      ? "Pago creado y pendiente de aprobación. Estamos actualizando el estado automáticamente…"
      : "Pago creado y pendiente de aprobación.";
  }

  if (s === "APPROVED") return "Tu pago fue aprobado.";
  if (s === "DECLINED") return "Tu pago fue rechazado. Puedes intentar nuevamente.";
  if (s === "ERROR") return "Ocurrió un error procesando el pago. Intenta nuevamente.";
  return "";
});

let timer: number | null = null;

function stopPolling() {
  syncing.value = false;
  if (timer) window.clearInterval(timer);
  timer = null;
}

function startPolling() {
  if (timer) return;
  syncing.value = true;

  timer = window.setInterval(async () => {
    try {
      const updated = await syncTransaction(id);
      status.value = updated?.status || status.value;

      if (String(status.value).toUpperCase() !== "PENDING") {
        stopPolling();
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message || "No pudimos actualizar el estado del pago";
    }
  }, 2000);
}

async function refreshInitial() {
  loading.value = true;
  error.value = "";
  try {
    const tx = await getTransaction(id);
    status.value = tx?.status || "PENDING";

    if (String(status.value).toUpperCase() === "PENDING") {
      startPolling();
    } else {
      stopPolling();
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || "Could not fetch transaction";
  } finally {
    loading.value = false;
  }
}

async function forceSync() {
  error.value = "";
  try {
    syncing.value = true;
    const updated = await syncTransaction(id);
    status.value = updated?.status || status.value;

    if (String(status.value).toUpperCase() !== "PENDING") {
      stopPolling();
    } else {
      startPolling();
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || "No pudimos actualizar el estado del pago";
  }
}

async function backToProduct() {
  stopPolling();
  store.commit("resetFlow");
  await router.push("/");
}

onMounted(refreshInitial);
onBeforeUnmount(stopPolling);
</script>