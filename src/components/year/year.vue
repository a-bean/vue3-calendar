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
  @apply h100% w100% grid grid-cols-4 grid-rows-3 gap-3 min-h-600px;
}

/* 最窄：小于等于 3:4 也保持 3×4 布局 */
@media (max-aspect-ratio: 3/4) {
  .year {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 1rem;
    min-height: 500px;
  }
}

/* 宽度较宽时的优化 */
@media (min-width: 1200px) {
  .year {
    gap: 5rem;
  }
}

@media (min-width: 1600px) {
  .year {
    gap: 6rem;
  }
}

/* 高度较小时的优化 */
@media (max-height: 600px) {
  .year {
    gap: 1.5rem;
    min-height: 400px;
  }
}

@media (max-height: 400px) {
  .year {
    gap: 1rem;
    min-height: 300px;
  }
}
</style>
