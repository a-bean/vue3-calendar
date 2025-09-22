<template>
  <div class="year">
    <div v-for="(month, index) of yearDates" :key="index">
      <YearMonth :data="month" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import YearMonth from './components/year-month.vue';
import { useStore } from '@/hooks/useStore';
import { groupDatesByMonth } from '@/date';

const { store } = useStore();

const yearDates = computed(() => {
  return groupDatesByMonth(store.value.currentDate);
});
</script>
<style>
.year {
  @apply h100% w100% grid grid-cols-4 grid-rows-3 gap-4%;
}

/* 最窄：小于等于 3:4 也保持 3×4 布局 */
@media (max-aspect-ratio: 3/4) {
  .year {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, 1fr);
  }
}
</style>
