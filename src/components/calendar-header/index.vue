<template>
  <div>
    <div class="flex flex-items-center justify-center">
      <RadioGroup v-model:model-value="store.calendarView">
        <Radio v-for="(value, key) of typeMap" :key="key" :value="key"> {{ value }} </Radio>
      </RadioGroup>
    </div>
    <div class="flex flex-items-center justify-between">
      <HeaderTitle :date="timeTitle" />
      <SwitchButton @recover="onRecover" @change="onChange" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
// components
import HeaderTitle from '@/components/header-title/header-title.vue';
import RadioGroup from '@/components/radio/radio-group.vue';
import Radio from '@/components/radio/radio-item.vue';
import SwitchButton from '@/components/switch-button/switch-button.vue';
// utils, hooks, types
import { getDate } from '@/date';
import { useStore } from '@/hooks/useStore';
import { ECalendarType } from '@/types';

const { store, onRecover, onChange } = useStore();

const typeMap = {
  [ECalendarType.DAY]: '日',
  [ECalendarType.WEEK]: '周',
  [ECalendarType.MONTH]: '月',
  [ECalendarType.YEAR]: '年',
};

const titleMap = {
  [ECalendarType.DAY]: (date: string) => getDate({ date, format: 'YYYY年MM月DD日' }),
  [ECalendarType.WEEK]: (date: string) => getDate({ date, format: 'YYYY年MM月' }),
  [ECalendarType.MONTH]: (date: string) => getDate({ date, format: 'YYYY年MM月' }),
  [ECalendarType.YEAR]: (date: string) => getDate({ date, format: 'YYYY年' }),
};

const timeTitle = computed(() => {
  const item = store.value.currentDate[0];
  if (!item?.date) return '';
  return titleMap[store.value.calendarView](item.date);
});
</script>
