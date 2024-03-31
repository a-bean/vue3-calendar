<template>
  <div ref="bodyRef" class="flex-1 position-relative">
    <TimeDivider @ondblclick="timeDividerDblclick" />
    <CurrentTimeline class="w100% position-absolute" />
    <template v-for="item of props.data" :key="item.id">
      <Popover>
        <template #trigger>
          <DayTask :data="item" :style="{ width: `${100 / item.width!}%`, left: `${ 100*(item.left!-1)/item.left!}%` }" />
        </template>
        <template #default><slot :data="item"></slot></template>
      </Popover>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import TimeDivider from '@/components/time-divider/time-divider.vue';
import CurrentTimeline from '@/components/current-timeline/current-timeline.vue';
import DayTask from './day-task.vue';
import { useDay } from '@/hooks/useDay';
import { TData } from '@/types';
import Popover from '@/components/popover/popover.vue';
import { useStore } from '@/hooks/useStore';

const { store, addTask } = useStore();
const props = defineProps<{
  data: TData[];
}>();

const { taskBodyHeight } = useDay();

const bodyRef = ref<HTMLElement | null>(null);
const getBodyHeight = () => {
  taskBodyHeight.value = bodyRef.value?.clientHeight || 0;
};

const timeDividerDblclick = (index: number) => {
  addTask(index, store.value.currentDate[0].date);
};

onMounted(() => {
  getBodyHeight();
  window.addEventListener('resize', getBodyHeight);
});
onUnmounted(() => {
  window.removeEventListener('resize', getBodyHeight);
});
</script>
