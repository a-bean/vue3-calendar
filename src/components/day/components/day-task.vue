<template>
  <div
    class="task-default-opacity w100% bg-blue b-rd-2 font-size-3 color-white b-l-solid b-l-4 b-blue box-border position-absolute"
    :class="{ 'task-active-opacity': props.data?.id === store.selectedTaskId }"
    :style="{ top: `${top}%`, height: `${height}%`, backgroundColor: props.data.color, borderColor: props.data.color }"
    @click="selectedTask(props.data.id as number, props.data)"
    @mousedown="(e) => mousedown(e, props.data.id as number, ETaskMoveType.MOVE_WHOLE)"
  >
    <!--上拖拉的线-->
    <div
      class="h1 w100% position-absolute cursor-row-resize top--0.5"
      @mousedown.stop="(e) => mousedown(e, props.data.id as number, ETaskMoveType.MOVE_TOP)"
      @mouseenter="mouseenter(ETaskMoveType.MOVE_TOP)"
    ></div>
    <!--下拖拉的线-->
    <div
      class="h1 w100% position-absolute cursor-row-resize bottom--0.5"
      @mousedown.stop="(e) => mousedown(e, props.data.id as number, ETaskMoveType.MOVE_BOTTOM)"
      @mouseenter="mouseenter(ETaskMoveType.MOVE_BOTTOM)"
    ></div>
    <div>{{ getDate({ date: props.data.start, format: 'HH:mm' }) }} - {{ getDate({ date: props.data.end, format: 'HH:mm' }) }}</div>
    <div class="font-500">{{ props.data.title }}</div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { getDate, isBefore } from '@/date';
import { ONE_HOUR_HEIGHT, ETaskMoveType } from '@/config';
import { useDay } from '@/hooks/useDay';
import { useStore } from '@/hooks/useStore';
import { getEffectiveEndTime } from '@/utils';
import { TData } from '@/types';

const { mousedown, mouseenter } = useDay();
const { store, selectedTask } = useStore();

const props = defineProps<{
  data: TData;
}>();

const top = computed(() => {
  const isSmallThanToday = isBefore(props.data.start, store.value.currentDate[0].date);
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

  const startIsSmallThanToday = isBefore(props.data.start, store.value.currentDate[0].date);

  if (startIsSmallThanToday) {
    startTimeHour = '0';
    startTimeMinutes = '0';
  }

  let endTimeHour = '0';
  let endTimeMinutes = '0';
  const endIsBiggerThanToday = isBefore(store.value.currentDate[0].date, getDate({ date: props.data.end, format: 'YYYY-MM-DD' }));

  if (endIsBiggerThanToday) {
    endTimeHour = '24';
  } else {
    // 使用有效结束时间（考虑15分钟最小间隔）
    const effectiveEndTime = new Date(getEffectiveEndTime(props.data));
    endTimeHour = getDate({ date: effectiveEndTime.toISOString(), format: 'HH' });
    endTimeMinutes = getDate({ date: effectiveEndTime.toISOString(), format: 'mm' });
  }

  const h =
    Number(endTimeHour) * ONE_HOUR_HEIGHT +
    Number(endTimeMinutes) * (ONE_HOUR_HEIGHT / 60) -
    (Number(startTimeHour) * ONE_HOUR_HEIGHT + Number(startTimeMinutes) * (ONE_HOUR_HEIGHT / 60));

  return h;
});
</script>
