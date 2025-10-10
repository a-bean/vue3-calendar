<template>
  <div class="h100% w100%">
    <CalendarHeader />
    <component :is="showComponent">
      <template #popover="slotProps">
        <slot name="popover" :data="slotProps.data"></slot>
      </template>
      <template #day-detail="slotProps">
        <slot name="day-detail" :data="slotProps.data"></slot>
      </template>
    </component>
  </div>
</template>
<script setup lang="ts">
import { onUpdated, watch, computed, onUnmounted, onMounted } from 'vue';
// 组件
import MonthCalendar from './components/month/month.vue';
import DayCalendar from './components/day/day.vue';
import WeekCalendar from './components/week/week.vue';
import YearCalendar from './components/year/year.vue';
import CalendarHeader from './components/calendar-header/index.vue';
// hooks, utils
import { useStore } from './hooks/useStore';
import { useMonth } from '@/hooks/useMonth';
// types
import { ECalendarType, TData } from './types';
import { getDaysScope } from '@/date';

const props = defineProps<{ data: { [key: string]: TData[] }; calendarView?: ECalendarType }>();
const emitter = defineEmits<{
  (event: 'getDateScope', scope: [string, string]): void;
  (event: 'change', data: TData): void;
  (event: 'delete', id: number): void;
}>();

const { store, getData, currentDay, onTaskChange, onTaskDelete, onKeydown, onKeyup, setCalendarView } = useStore();
const { replenishCurrentDays } = useMonth();

onTaskChange.value = (data: TData) => {
  emitter('change', data);
};

onTaskDelete.value = () => {
  emitter('delete', store.value.selectedTaskId);
};

onUpdated(() => {
  getData(props.data);
});

onMounted(() => {
  if (props.calendarView) {
    setCalendarView(props.calendarView);
  }
});

const components = {
  [ECalendarType.DAY]: DayCalendar,
  [ECalendarType.WEEK]: WeekCalendar,
  [ECalendarType.MONTH]: MonthCalendar,
  [ECalendarType.YEAR]: YearCalendar,
};
const showComponent = computed(() => components[store.value.calendarView]);

/*
  [key in Exclude<ECalendarType, ECalendarType.YEAR>]
  本来应该除去ECalendarType.YEAR，year不需要请求数据，但是
  这样在使用的emitterFn使用的时候还需要进行类型判断，所以直接
  写成ECalendarType，代码更加简洁
 */
const emitterFn: { [key in ECalendarType]: () => void } = {
  [ECalendarType.MONTH]: () => {
    emitter('getDateScope', [replenishCurrentDays.value[0].date, replenishCurrentDays.value[replenishCurrentDays.value.length - 1].date]);
  },
  [ECalendarType.DAY]: () => {
    emitter('getDateScope', [store.value.currentDate[0].date, store.value.currentDate[0].date]);
  },
  [ECalendarType.WEEK]: () => {
    emitter('getDateScope', [store.value.currentDate[0].date, store.value.currentDate[store.value.currentDate.length - 1].date]);
  },
  [ECalendarType.YEAR]: () => {},
};

watch(
  () => store.value.currentDate,
  () => {
    emitterFn[store.value.calendarView]();
  }
);

watch(
  () => store.value.calendarView,
  () => {
    store.value.currentDate = getDaysScope({ type: store.value.calendarView, date: currentDay.value });
  },
  {
    immediate: true,
  }
);

window.addEventListener('keydown', onKeydown);
window.addEventListener('keyup', onKeyup);
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  window.removeEventListener('keyup', onKeyup);
});
</script>
