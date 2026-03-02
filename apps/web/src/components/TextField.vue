<template>
  <label class="block">
    <span class="text-xs font-medium text-slate-600">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="placeholder"
      class="mt-1 w-full rounded-xl border bg-white px-3 py-3 outline-none
             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
             shadow-sm"
    />
    <p v-if="hint" class="mt-1 text-xs text-slate-500">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  modelValue: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
}>();
defineEmits(["update:modelValue"]);
</script>