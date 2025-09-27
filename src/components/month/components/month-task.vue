<template>
  <div
    class="h4 font-size-2.8 border-rd pl-2 pr-2 flex flex-items-center justify-between box-border relative z1 bg-blue color-white task-default-opacity"
    :class="{ 'task-active-opacity': props.data?.id === store.selectedTaskId, invisible: typeof props.data?.id === 'string' }"
    :style="{ backgroundColor: props.data?.color }"
    draggable="true"
    :data-id="props.data?.id"
    @click="selectedTask(props.data!.id as number)"
    @dragstart="(e) => onDragStart(e, props.data)"
  >
    <div class="flex flex-items-center">
      <div class="h1.4 w1.4 b-rd-50% mr1 bg-white"></div>
      {{ props.data?.title }}
    </div>
    <div>{{ getDate({ date: props.data?.start, format: 'MM-DD' }) }}-{{ getDate({ date: props.data?.end, format: 'MM-DD' }) }}</div>
  </div>
</template>
<script setup lang="ts">
import { useMonth } from '@/hooks/useMonth';
import { useStore } from '@/hooks/useStore';
import { TData } from '@/types';
import { getDate } from '@/date';

const { onDragStart } = useMonth();
const { selectedTask, store } = useStore();

const props = defineProps<{
  data?: TData;
}>();
</script>
