<template>
  <div class="h100% w100% flex flex-col">
    <div class="flex-1 font-size-3.5 flex flex-col">
      <div class="flex mb-4">
        <div v-for="item of weeks" :key="item" class="flex-1 text-center font-size-3.6">
          {{ item.slice(1, 2) }}
        </div>
      </div>
      <div class="flex-1 grid grid-cols-7 gap-1 auto-rows-fr">
        <div
          v-for="item of replenishCurrentDays"
          :key="item.date"
          class="text-center flex items-center justify-center aspect-square cursor-pointer"
          :class="{
            'color-#ccc': !item.isCurrentMonth,
            'b-b-solid b-b-1 b-red': item.isFirstDayOfLunarMonth,
            'bg-red color-white b-rd-50%': item.isToday,
            'bg-gray b-rd-50% ': item.date === currentDay && !item.isToday,
          }"
          @click="onClick(item)"
        >
          {{ item.day?.startsWith('0') ? item.day.slice(-1) : item.day }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/hooks/useStore';
import { computed } from 'vue';
import { getDate, getLunarDay, getLunarMonth, weeks, getWeekIndex, getDaysScope } from '@/date';
import { ECalendarType, TDate } from '@/types';

const { store, currentDay } = useStore();

const replenishCurrentDays = computed((): TDate[] => {
  const days = getDaysScope({ type: ECalendarType.MONTH, date: currentDay.value });

  // 补全前面的日期
  while (days[0].weekIndex !== 0) {
    const date = getDate({ date: days[0].date, add: -1 });
    days.unshift({
      date,
      day: date.slice(-2),
      month: days[0].month,
      weekIndex: days[0].weekIndex - 1,
      week: weeks[getWeekIndex(days[0].date)],
      isCurrentMonth: false,
      isToday: false,
      isFirstDayOfLunarMonth: getLunarDay(date) === '初一',
      lunarDay: getLunarDay(date),
      lunarMonth: getLunarMonth(date),
      isFirstDayOfMonth: false,
      isSaturdayOrSunday: days[0].weekIndex - 1 === 0 || days[0].weekIndex - 1 === 6,
    });
  }
  // 补全后面的日期
  while (days.length < 42) {
    const date = getDate({ date: days[days.length - 1].date, add: 1 });
    const weekIndex = (days[days.length - 1].weekIndex + 1) % 7;
    days.push({
      date,
      day: date.slice(-2),
      month: days[0].month,
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

  return days;
});

const onClick = (item: TDate) => {
  currentDay.value = item.date;
  store.value.currentDate = getDaysScope({
    type: store.value.calendarView,
    date: currentDay.value,
  });
};
</script>
