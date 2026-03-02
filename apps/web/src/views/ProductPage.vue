<template>
  <AppShell>
    <div class="space-y-4">
      <div class="rounded-3xl bg-white shadow-sm border p-4">
        <h1 class="text-xl font-semibold">Selecciona un producto</h1>
      </div>

      <div v-if="loading" class="text-sm text-slate-500">Cargando...</div>

      <div class="space-y-3">
        <ProductCard
          v-for="p in products"
          :key="p.id"
          :product="p"
          @select="selectAndGo"
        />
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import AppShell from "../components/AppShell.vue";
import ProductCard from "../components/ProductCard.vue";

const store = useStore();
const router = useRouter();
const loading = ref(false);

const products = computed(() => store.state.products);

async function selectAndGo(p: any) {
  store.commit("setSelectedProduct", p);
  store.commit("setStep", 2);
  await router.push("/checkout");
}

onMounted(async () => {
  loading.value = true;
  try {
    await store.dispatch("fetchProducts");
  } finally {
    loading.value = false;
  }
});
</script>