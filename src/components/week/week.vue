<template>
  <div class="w100% h100% flex flex-col select-none">
    <WeekHeader />
    <div ref="bodyRef" class="flex-1 flex overflow-scroll pt-1.6">
      <TimeScale class="w15" />
      <WeekBody v-slot="slotProps">
        <slot :data="slotProps.data"></slot>
      </WeekBody>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import WeekHeader from './components/week-header.vue';
import TimeScale from '@/components/time-scale/time-scale.vue';
import WeekBody from './components/week-body.vue';
import { useWeek } from '@/hooks/useWeek';

const { taskBodyHeight } = useWeek();

const bodyRef = ref<HTMLElement | null>(null);
const getBodyHeight = () => {
  taskBodyHeight.value = bodyRef.value?.clientHeight || 0;
};

onMounted(() => {
  getBodyHeight();
  window.addEventListener('resize', getBodyHeight);
});
onUnmounted(() => {
  window.removeEventListener('resize', getBodyHeight);
});
</script>
