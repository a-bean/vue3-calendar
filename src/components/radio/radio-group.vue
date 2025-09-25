<template>
  <div class="inline-block cursor-pointer select-none">
    <div class="flex justify-center flex-items-center b-1 b-#ccc border-rd b-solid" @click="onClick">
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, provide, watch } from 'vue';
import { ECalendarType } from '@/types';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const active = ref<ECalendarType>(ECalendarType.DAY);
provide('switcher', active);
watch(
  () => props.modelValue,
  () => {
    active.value = props.modelValue;
  },
  {
    immediate: true,
  }
);

const onClick = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLElement).getAttribute('value'));
  active.value = (e.target as HTMLElement).getAttribute('value') as ECalendarType;
};
</script>
