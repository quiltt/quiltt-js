<script setup lang="ts">

import { useQuilttConnector } from '@quiltt/vue'

useQuilttConnector()
</script>

<template>
  <button type="button" quiltt-button="connector" class="launcher-button">Launch with HTML</button>
</template>
