<template>
  <div class="h100% flex flex-col b-1 b-#ccc border-rd b-solid min-h-120 min-w-230">
    <MonthHeader></MonthHeader>
    <MonthBody v-slot="slotProps" class="flex-1">
      <slot :data="slotProps.data"></slot>
    </MonthBody>
  </div>
</template>
<script setup lang="ts">
import MonthHeader from './components/month-header.vue';
import MonthBody from './components/month-body.vue';
</script>
