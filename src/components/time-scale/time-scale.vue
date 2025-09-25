<template>
  <div>
    <div
      v-for="item of 24"
      :key="item"
      class="h8% b-t-solid b-t-1 b-transparent text-right font-size-3 flex flex-col justify-between box-border"
      :style="{ height: `${ONE_HOUR_HEIGHT}%` }"
    >
      <div class="mt--2 mr-1">{{ item - 1 }}:00</div>
      <div v-if="item === 24" class="mb--2 mr-1">00:00</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ONE_HOUR_HEIGHT } from '@/config';
</script>
