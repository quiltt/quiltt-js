<script setup lang="ts">

import { useQuilttConnector } from '@quiltt/vue'

const config = useRuntimeConfig()
const connectorId = config.public.quilttConnectorId

const { open } = useQuilttConnector(connectorId, {
  onEvent: (type) => console.log(`Event: ${type}`),
})
</script>

<template>
  <button type="button" class="launcher-button" @click="open">Launch with Javascript</button>
</template>
