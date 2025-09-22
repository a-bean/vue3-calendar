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
</style>
