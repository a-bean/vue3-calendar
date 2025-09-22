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

/* 标准宽屏到接近方形：维持 4×3，也较“挤” */
@media (min-aspect-ratio: 4/3) and (max-aspect-ratio: 5/4) {
  .year {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }
}

/* 接近正方形到略窄：仍尽量 4×3，保持横向更满 */
@media (min-aspect-ratio: 1/1) and (max-aspect-ratio: 4/3) {
  .year {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }
}

/* 更窄：3×4 */
@media (max-aspect-ratio: 1/1) and (min-aspect-ratio: 3/4) {
  .year {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, 1fr);
  }
}

/* 最窄：小于等于 3:4 也保持 3×4 布局 */
@media (max-aspect-ratio: 3/4) {
  .year {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, 1fr);
  }
}
</style>
