<script setup lang="ts">

import { QuilttButton } from '@quiltt/vue'

const config = useRuntimeConfig()
const connectorId = config.public.quilttConnectorId
</script>

<template>
  <QuilttButton :connector-id="connectorId" as="button" class="component-button">
    Launch with Component
  </QuilttButton>
</template>
