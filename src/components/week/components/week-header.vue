<template>
  <div>
    <div class="w100% flex font-size-3.5">
      <div class="w15 h7 line-height-7 text-right color-#ccc">{{ getLunarMonth(store.currentDate[0].date) }}</div>
      <div v-for="item of store.currentDate" :key="item.date" class="h6 line-height-6 flex-1 flex justify-between pr2 pl2">
        <div @dblclick="onDblclick(item.date)">
          <span :class="`${item.isToday ? 'is-today' : ''}`">
            {{ getDate({ date: item.date, format: 'DD' }) }}
          </span>
          {{ item.lunarDay }}
        </div>
        <div>{{ item.week }}</div>
      </div>
    </div>
    <div class="w100% flex font-size-2.5 b-t-solid b-b-solid b-#ccc b-t-1 b-b-3">
      <div class="w15 text-right color-#ccc pl2 pr2 box-border">全天</div>
      <div
        v-for="(item, index) of store.currentDate"
        :key="item.date"
        ref="boxRef"
        class="flex-1 flex"
        :data-date="item.date"
        @dragover="onDragover"
        @drop="onDrop"
      >
        <div class="flex-1 box-border flex flex-col gap-1px" :class="{ 'b-r-solid b-r-1 b-r-#ccc color-white': index !== 6 }">
          <WeekAllDayTask
            v-for="allDayItem of isAllDay[item.date]"
            :key="allDayItem.id"
            :data="allDayItem"
            :style="{ width: getMonthTaskWidth(allDayItem, item.date) }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getDate, getLunarMonth, getTimeInterval, getWeekIndex, isBefore } from '@/date';
import { useStore } from '@/hooks/useStore';
import { ECalendarType, TData } from '@/types';
import { useWeek } from '@/hooks/useWeek';
import WeekAllDayTask from './week-all-day-task.vue';
import { ref, nextTick, onMounted, onUnmounted } from 'vue';

const { store, setCalendarView, currentDay } = useStore();
const { isAllDay, onDragover, onDrop, taskBoxWidth } = useWeek();

const onDblclick = (date: string) => {
  currentDay.value = date;
  setCalendarView(ECalendarType.DAY);
};

const getMonthTaskWidth = (data: TData, date: string) => {
  const currentFragmentStart = isBefore(data.start, date) ? date : data.start;
  const interval = Math.min(
    getTimeInterval({ bigDate: data.end, smallDate: currentFragmentStart, unit: 'day' }),
    6 - getWeekIndex(currentFragmentStart)
  );
  // TODO: 还不知道为什么要减去5 * interval
  return `calc(${interval + 1}00% - ${5 * interval}px)`;
};

const boxRef = ref<HTMLElement[]>([]);
const onTaskBoxResize = () => {
  taskBoxWidth.value = boxRef.value![0]!.clientWidth; // 记录月视图每个日期的宽度
};

nextTick(() => {
  onTaskBoxResize();
});

onMounted(() => {
  window.addEventListener('resize', onTaskBoxResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onTaskBoxResize);
});
</script>
, getTimeInterval, getWeekIndex, isBefore, TData
