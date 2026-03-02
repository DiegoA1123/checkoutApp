<template>
  <div class="rounded-3xl bg-white shadow-sm border overflow-hidden">
    <img :src="product.imageUrl" loading="lazy" class="w-full h-44 object-cover" alt="" />
    <div class="p-4 space-y-2">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="font-semibold leading-tight">{{ product.name }}</div>
          <div class="text-sm text-slate-500">{{ product.description }}</div>
        </div>
        <div class="text-right">
          <div class="font-semibold">{{ formatCOP(product.price) }}</div>
          <div class="text-xs" :class="product.stock > 0 ? 'text-emerald-600' : 'text-red-600'">
            Stock: {{ product.stock }}
          </div>
        </div>
      </div>

      <PrimaryButton
        :disabled="product.stock <= 0"
        @click="$emit('select', product)"
      >
        Pagar con tarjeta de crédito
      </PrimaryButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import PrimaryButton from "./PrimaryButton.vue";

defineProps<{
  product: any;
}>();

defineEmits<{
  (e: 'select', product: any): void;
}>();

function formatCOP(cents: number) {
  const value = cents / 100;
  return value.toLocaleString("es-CO", { style: "currency", currency: "COP" });
}
</script>
