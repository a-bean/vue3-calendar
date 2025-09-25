<template>
  <div
    v-for="(item, index) of 24"
    :key="item"
    class="time-divider"
    :class="{ 'b-b-solid b-b': item === 24, 'b-r-solid b-r b-r-#ccc': props.needRightBorder }"
    :style="{ height: `${ONE_HOUR_HEIGHT}%` }"
    @dblclick="emitter('ondblclick', index)"
  ></div>
</template>

<script setup lang="ts">
import { ONE_HOUR_HEIGHT } from '@/config';

const props = defineProps<{
  needRightBorder?: boolean;
}>();

const emitter = defineEmits<{
  (event: 'ondblclick', hour: number): void;
}>();
</script>

<style>
.time-divider {
  @apply w100% b-t-solid b-t b-#ccc box-border b-#ccc;
}
</style>
