<script setup lang="ts">

import { useQuilttConnector } from '@quiltt/vue'

const { open } = useQuilttConnector('connector', {
  onExitSuccess: () => console.log('onExitSuccess'),
})
</script>

<template>
  <button type="button" class="component-button" @click="open">Launch with Custom Component</button>
</template>
