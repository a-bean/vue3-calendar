<template>
  <div class="w100% flex">
    <div
      v-for="(item, index) of weeks"
      :key="item"
      class="h10 flex-1 b-r-1 b-r-#ccc b-r-solid p2 text-right font-size-3.5 line-height-10"
      :class="{
        'b-r-none': index === 6,
      }"
    >
      {{ item }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { weeks } from '@/date';
</script>
