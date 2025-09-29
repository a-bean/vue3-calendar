<template>
  <div
    class="b-rd h5 line-height-5 pl-1.5 box-border color-white task-default-opacity bg-blue"
    :class="{ 'task-active-opacity': props.data?.id === store.selectedTaskId, invisible: typeof props.data?.id === 'string' }"
    :style="{ backgroundColor: props.data?.color }"
    draggable="true"
    :data-id="props.data?.id"
    @click="selectedTask(props.data!.id as number)"
    @dragstart="(e) => onDragStart(e, props.data)"
  >
    {{ props.data?.title }}
  </div>
</template>
<script setup lang="ts">
import { useWeek } from '@/hooks/useWeek';
import { useStore } from '@/hooks/useStore';
import { TData } from '@/types';

const { onDragStart } = useWeek();
const { selectedTask, store } = useStore();

const props = defineProps<{
  data?: TData;
}>();
</script>
