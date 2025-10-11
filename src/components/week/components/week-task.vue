<template>
  <div
    class="task-default-opacity day-task"
    :class="{ 'task-active-opacity': props.data?.id === store.selectedTaskId }"
    :style="{ top: `${top}%`, height: `${height}%`, backgroundColor: props.data.color, borderColor: props.data.color }"
    @click="selectedTask(props.data.id as number, props.data as TData)"
    @mousedown="(e) => mousedown(e, props.data, ETaskMoveType.MOVE_WHOLE)"
  >
    <!--上拖拉的线-->
    <div
      class="day-drag-line top--0.5"
      @mousedown.stop="(e) => mousedown(e, props.data, ETaskMoveType.MOVE_TOP)"
      @mouseenter="mouseenter(ETaskMoveType.MOVE_TOP)"
    ></div>
    <!--下拖拉的线-->
    <div
      class="day-drag-line bottom--0.5"
      @mousedown.stop="(e) => mousedown(e, props.data, ETaskMoveType.MOVE_BOTTOM)"
      @mouseenter="mouseenter(ETaskMoveType.MOVE_BOTTOM)"
    ></div>
    <div>{{ getDate({ date: props.data.start, format: 'HH:mm' }) }}</div>
    <div class="font-500">{{ props.data.title }}</div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { getDate, isBefore } from '@/date';
import { ONE_HOUR_HEIGHT, ETaskMoveType } from '@/config';
import { useWeek } from '@/hooks/useWeek';
import { useStore } from '@/hooks/useStore';
import { getEffectiveEndTime } from '@/utils';
import { TData } from '@/types';

const props = defineProps<{
  data: TData;
  dateKey: string;
}>();

const { mousedown, mouseenter } = useWeek();
const { selectedTask, store } = useStore();

const top = computed(() => {
  const isSmallThanToday = isBefore(props.data.start, props.dateKey);
  if (isSmallThanToday) {
    return 0;
  }

  const hour = getDate({ date: props.data.start, format: 'HH' });
  const minutes = getDate({ date: props.data.start, format: 'mm' });
  return Number(hour) * ONE_HOUR_HEIGHT + Number(minutes) * (ONE_HOUR_HEIGHT / 60);
});

const height = computed(() => {
  let startTimeHour = getDate({ date: props.data.start, format: 'HH' });
  let startTimeMinutes = getDate({ date: props.data.start, format: 'mm' });

  const startIsSmallThanToday = isBefore(props.data.start, props.dateKey);

  if (startIsSmallThanToday) {
    startTimeHour = '0';
    startTimeMinutes = '0';
  }

  let endTimeHour = '0';
  let endTimeMinutes = '0';
  const endIsBiggerThanToday = isBefore(props.dateKey, getDate({ date: props.data.end, format: 'YYYY-MM-DD' }));

  if (endIsBiggerThanToday) {
    endTimeHour = '24';
  } else {
    // 使用有效结束时间（考虑15分钟最小间隔）
    const effectiveEndTime = new Date(getEffectiveEndTime(props.data));
    endTimeHour = getDate({ date: effectiveEndTime.toISOString(), format: 'HH' });
    endTimeMinutes = getDate({ date: effectiveEndTime.toISOString(), format: 'mm' });
  }

  return (
    Number(endTimeHour) * ONE_HOUR_HEIGHT +
    Number(endTimeMinutes) * (ONE_HOUR_HEIGHT / 60) -
    (Number(startTimeHour) * ONE_HOUR_HEIGHT + Number(startTimeMinutes) * (ONE_HOUR_HEIGHT / 60))
  );
});
</script>
<style>
.day-task {
  @apply w100% bg-blue font-size-3 color-white box-border position-absolute;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  /* 移除影响位置变化的动画，只保留阴影和透明度动画 */
  transition: box-shadow 0.2s ease, opacity 0.2s ease;
}

.day-task:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.day-drag-line {
  @apply h3 w100% position-absolute cursor-row-resize;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.day-task:hover .day-drag-line {
  opacity: 1;
}
</style>
