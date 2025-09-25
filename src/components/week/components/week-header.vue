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
        class="flex-1 flex"
        :data-date="item.date"
        @dragover="onDragover"
        @drop="onDrop"
      >
        <div class="flex-1 box-border flex flex-col gap-1px" :class="{ 'b-r-solid b-r-1 b-r-#ccc color-white': index !== 6 }">
          <WeekAllDayTask v-for="allDayItem of isAllDay[item.date]" :key="allDayItem.id" :data="allDayItem" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getDate, getLunarMonth } from '@/date';
import { useStore } from '@/hooks/useStore';
import { ECalendarType } from '@/types';
import { useWeek } from '@/hooks/useWeek';
import WeekAllDayTask from './week-all-day-task.vue';

const { store, setCalendarView, currentDay } = useStore();
const { isAllDay, onDragover, onDrop } = useWeek();

const onDblclick = (date: string) => {
  currentDay.value = date;
  setCalendarView(ECalendarType.DAY);
};
</script>
