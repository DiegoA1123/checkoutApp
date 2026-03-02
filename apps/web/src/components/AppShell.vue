<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div class="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div class="font-semibold tracking-tight">App de pagos</div>
        <div class="text-xs text-slate-500">Sandbox</div>
      </div>
    </header>

    <main class="max-w-md mx-auto px-4 py-4">
      <slot />
    </main>
  </div>
</template>