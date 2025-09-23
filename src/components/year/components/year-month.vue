<template>
  <div class="year-month" @dblclick="onDblclick(props.data[0]?.date)">
    <div class="year-month-title pl-4">{{ getChineseMonth(props.data[0]?.date) }}</div>
    <div class="year-month-body">
      <div class="flex mb-4 mt-4">
        <div v-for="item of weeks" :key="item" class="flex-1 text-center font-size-3.6">
          {{ item.slice(1, 2) }}
        </div>
      </div>
      <div class="year-month-content">
        <div
          v-for="item of flatDays"
          :key="item.date"
          class="year-month-day"
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
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { getDate, getLunarDay, getLunarMonth, getChineseMonth, weeks, getWeekIndex } from '@/date';
import { convertTo2DArray } from '@/utils';
import { ECalendarType, TDate } from '@/types';
import { cloneDeep } from 'lodash';
import { useStore } from '@/hooks/useStore';

const props = defineProps<{
  data: TDate[];
}>();

const { setCalendarView, currentDay } = useStore();

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

// 将二维数组展平为一维数组，用于 Grid 布局
const flatDays = computed((): TDate[] => {
  return replenishCurrentDays.value.flat();
});

const onDblclick = (date: string | undefined) => {
  if (date) {
    currentDay.value = date;
    setCalendarView(ECalendarType.MONTH);
  }
};
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

.year-month-content {
  @apply flex-1 grid grid-cols-7 gap-1 auto-rows-fr;
}

.year-month-day {
  @apply text-center  flex items-center justify-center aspect-square;
}
</style>
