<template>
  <button
    :type="type"
    :disabled="disabled"
    class="w-full rounded-2xl px-4 py-3 font-medium shadow-sm transition
           bg-indigo-600 text-white hover:bg-indigo-700
           disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ type?: "button" | "submit"; disabled?: boolean }>();
</script>