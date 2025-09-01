<template>
  <div class="current-timeline" :style="{ top: `${top}%` }">{{ props.showTime ? time : '' }}</div>
</template>
<script setup lang="ts">
import { onUnmounted, ref, onMounted } from 'vue';
import { getDate } from '@/date';
import { ONE_HOUR_HEIGHT } from '@/config';

const props = defineProps<{
  showTime?: boolean;
}>();

const time = ref(getDate({ format: 'HH:mm' }));

const getTop = () => {
  const hour = getDate({ format: 'HH' });
  const minutes = getDate({ format: 'mm' });

  return Number(hour) * ONE_HOUR_HEIGHT + Number(minutes) * (ONE_HOUR_HEIGHT / 60);
};

const top = ref(getTop());

let timer: NodeJS.Timer;

onMounted(() => {
  timer = setInterval(() => {
    time.value = getDate({ format: 'HH:mm' });
    top.value = getTop();
  }, 1000 * 60);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style>
.current-timeline {
  @apply h1px bg-red font-size-2 text-left;
}
</style>
