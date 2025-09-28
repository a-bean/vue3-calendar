<template>
  <div
    ref="boxRef"
    class="h100% flex flex-col position-relative"
    :data-date="props.data.date"
    @dragover="onDragover"
    @drop="onDrop"
    @dblclick="addTask(9, props.data.date)"
  >
    <div
      ref="titleRef"
      class="h6 flex flex-justify-between flex-items-center font-size-3.5 p2 pb0"
      :class="{ 'color-#c9cdd4': !props.data.isCurrentMonth }"
    >
      <div :class="{ 'border-b border-b-solid border-red ': props.data.isFirstDayOfLunarMonth }">
        {{ props.data.isFirstDayOfLunarMonth ? props.data.lunarMonth + props.data.lunarDay : props.data.lunarDay }}
      </div>
      <div v-if="props.data.isFirstDayOfMonth">
        {{ getDate({ date: props.data.date, format: 'MM月DD日' }) }}
      </div>
      <div v-else @dblclick="onDblclick(props.data.date)">
        <span v-if="props.data.isToday" class="is-today">
          {{ cutDay(props.data.date) }}
        </span>
        <span v-else>{{ cutDay(props.data.date) }} </span>
        日
      </div>
    </div>
    <div class="flex-1 mt1">
      <template v-for="item of props.data.dataList?.slice(0, 1)" :key="item.id">
        <Popover>
          <template #trigger>
            <MonthTask ref="taskRef" class="mb1px" :data="item" :style="{ width: getMonthTaskWidth(item) }" />
          </template>
          <template #default><slot :data="item"></slot></template>
        </Popover>
      </template>

      <template v-for="item of props.data.dataList?.slice(1, showTaskCount - 1)" :key="item.id">
        <Popover>
          <template #trigger>
            <MonthTask ref="taskRef" class="mb1px" :data="item" :style="{ width: getMonthTaskWidth(item) }" />
          </template>
          <template #default><slot :data="item"></slot></template>
        </Popover>
      </template>

      <div v-if="surplusTaskCount > 0" class="font-size-2.8 pl-2 pr-2">还有{{ surplusTaskCount }}项...</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { TData, TDate, ECalendarType } from '@/types';
import MonthTask from './month-task.vue';
import { useMonth } from '@/hooks/useMonth';
import { getDate, getTimeInterval, getWeekIndex, isBefore } from '@/date';
import Popover from '@/components/popover/popover.vue';
import { useStore } from '@/hooks/useStore';

const { onDrop, onDragover, taskBoxWidth } = useMonth();
const { addTask, setCalendarView, currentDay } = useStore();

const props = defineProps<{
  data: TDate & { dataList?: TData[] };
}>();

const getMonthTaskWidth = (data: TData) => {
  const currentFragmentStart = isBefore(data.start, props.data.date) ? props.data.date : data.start;
  const endHour = getDate({ date: data.end, format: 'HH:mm' });
  const interval = Math.min(
    endHour.endsWith('00:00')
      ? getTimeInterval({ bigDate: data.end, smallDate: currentFragmentStart, unit: 'day' })
      : getTimeInterval({ bigDate: data.end, smallDate: currentFragmentStart, unit: 'day' }) + 1,

    7 - getWeekIndex(currentFragmentStart)
  );

  return `calc(${interval}00% + ${interval}px)`;
};

const cutDay = (day: string) => (day.slice(-2).startsWith('0') ? day.slice(-1) : day.slice(-2));

const boxRef = ref<HTMLElement | null>(null);
const titleRef = ref<HTMLElement | null>(null);

const taskRef = ref<InstanceType<typeof MonthTask>[]>([]);

const showTaskCount = ref(props.data.dataList?.length || 0);
const surplusTaskCount = computed(() => {
  if (props.data.dataList?.length) {
    return props.data.dataList.length - showTaskCount.value + 1;
  }
  return 0;
});

const onTaskBoxResize = () => {
  taskBoxWidth.value = boxRef.value!.clientWidth; // 记录月视图每个日期的宽度

  const boxHeight = boxRef.value?.clientHeight;
  const titleHeight = titleRef.value?.clientHeight;
  if (!boxHeight || !titleHeight) return;
  // 不直接拿 month-body-item-list 的高度，因为没有设置溢出隐藏（为了实现跨日期的task）
  const taskBoxHeight = boxHeight - titleHeight;
  const taskHeight = taskRef.value[0]?.$el.clientHeight;
  if (!taskHeight || !taskBoxHeight || taskBoxHeight < 2 * taskHeight) return;
  // 这边的加1是为了抵消task的margin-bottom的影响，导致还有*项...的显示不完全
  showTaskCount.value = Math.floor(taskBoxHeight / (taskHeight + 1));
};

const onDblclick = (date: string) => {
  currentDay.value = date;
  setCalendarView(ECalendarType.DAY);
};

let timer: NodeJS.Timeout;
watch(
  () => props.data.dataList,
  () => {
    timer = setTimeout(() => {
      onTaskBoxResize();
    });
  }
);

nextTick(() => {
  onTaskBoxResize();
});

onMounted(() => {
  window.addEventListener('resize', onTaskBoxResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onTaskBoxResize);
  clearTimeout(timer);
});
</script>
