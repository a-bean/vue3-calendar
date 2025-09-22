<template>
  <div class="year-month">
    <div class="year-month-title">{{ getChineseMonth(props.data[0].date) }}</div>
    <div class="year-month-body">
      <div class="year-month-header">
        <div v-for="item of weeks" :key="item" class="year-month-header-item">
          {{ item.slice(1, 2) }}
        </div>
      </div>
      <div class="year-month-content">
        <div v-for="(row, rowIndex) of replenishCurrentDays" :key="rowIndex" class="year-month-content-row">
          <div
            v-for="item of row"
            :key="item.date"
            class="flex-1 text-center"
            :class="{
              'color-#ccc': !item.isCurrentMonth,
              'b-b-solid b-b-1 b-red': item.isFirstDayOfLunarMonth,
              'bg-red color-white b-rd-50%': item.isToday,
            }"
          >
            {{ item.day?.startsWith('0') ? item.day.slice(-1) : item.day }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { getDate, getLunarDay, getLunarMonth, getChineseMonth, weeks, getWeekIndex } from '@/date';
import { convertTo2DArray } from '@/utils';
import { TDate } from '@/types';
import { cloneDeep } from 'lodash';

const props = defineProps<{
  data: TDate[];
}>();

const replenishCurrentDays = computed((): TDate[][] => {
  if (!props.data.length) return [];
  const newDays = cloneDeep(props.data);

  // 补全前面的日期
  while (newDays[0].weekIndex !== 0) {
    const date = getDate({ date: newDays[0].date, add: -1 });
    newDays.unshift({
      date,
      day: date.slice(-2),
      month: newDays[0].month,
      weekIndex: newDays[0].weekIndex - 1,
      week: weeks[getWeekIndex(newDays[0].date)],
      isCurrentMonth: false,
      isToday: false,
      isFirstDayOfLunarMonth: getLunarDay(date) === '初一',
      lunarDay: getLunarDay(date),
      lunarMonth: getLunarMonth(date),
      isFirstDayOfMonth: false,
      isSaturdayOrSunday: newDays[0].weekIndex - 1 === 0 || newDays[0].weekIndex - 1 === 6,
    });
  }
  // 补全后面的日期
  while (newDays.length < 42) {
    const date = getDate({ date: newDays[newDays.length - 1].date, add: 1 });
    const weekIndex = (newDays[newDays.length - 1].weekIndex + 1) % 7;
    newDays.push({
      date,
      day: date.slice(-2),
      month: newDays[0].month,
      weekIndex,
      week: weeks[getWeekIndex(date)],
      isCurrentMonth: false,
      isToday: false,
      isFirstDayOfLunarMonth: getLunarDay(date) === '初一',
      lunarDay: getLunarDay(date),
      lunarMonth: getLunarMonth(date),
      isFirstDayOfMonth: false,
      isSaturdayOrSunday: weekIndex === 0 || weekIndex === 6,
    });
  }

  return convertTo2DArray<TDate>(newDays, 7);
});
</script>
<style>
.year-month {
  @apply h100% w100% p2 flex flex-col;
}

.year-month-title {
  @apply color-red h6;
}

.year-month-body {
  @apply flex-1 font-size-3.5 flex flex-col;
}

.year-month-header {
  @apply w100% flex justify-between mb-4 mt-4;
}
.year-month-header-item {
  @apply font-size-3.6;
}

.year-month-content {
  @apply flex-1 flex flex-col justify-between;
}

.year-month-content-row {
  @apply flex justify-between flex-content-between;
}
</style>
