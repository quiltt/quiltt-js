<script setup lang="ts">
useHead({
  title: 'Quiltt Nuxt Example',
})
</script>

<template>
  <main>
    <div class="launchers">
      <h1 class="heading">Modal launchers</h1>
      <TestHtmlLauncher />
      <TestJsLauncher />
      <TestQuilttButton />
      <TestCustomButton />
    </div>
    <div class="containers">
      <h1 class="heading">Container</h1>
      <TestQuilttContainer />
      <TestCustomContainer />
    </div>
  </main>
</template>
