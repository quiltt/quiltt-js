<script setup lang="ts">

import { useQuilttConnector } from '@quiltt/vue'

const config = useRuntimeConfig()
const connectorId = config.public.quilttConnectorId

const { open } = useQuilttConnector(connectorId, {
  onExitSuccess: () => console.log('onExitSuccess'),
})
</script>

<template>
  <button type="button" class="component-button" @click="open">Launch with Custom Component</button>
</template>
