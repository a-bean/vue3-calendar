<template>
  <div ref="popoverRef" @dblclick.stop="show">
    <slot name="trigger"></slot>
    <div class="position-fixed z-100" :style="{ top: top, left: left }">
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const popoverRef = ref();

const top = ref('10000px');
const left = ref('0');

const setPosition = () => {
  const firstChild = popoverRef.value?.children[0].getBoundingClientRect();
  const secondChild = popoverRef.value?.children[1].getBoundingClientRect();

  // 当右边能放下时，放右边，如果右边放不下，在考虑放左边，当左边能放下时，放左边，放不下再考虑放上边，放不下再考虑放下边，放不下再考虑放下边，放不下再放中间
  // const r = firstChild.left + firstChild.width + secondChild.width;
  // const l = firstChild.left - secondChild.width;
  // const t = firstChild.top - secondChild.height;
  // const b = firstChild.top + firstChild.height + secondChild.height;

  const positionFn = {
    top: () => {
      top.value = `${firstChild.top - secondChild.height - 5}px`;
      left.value = `${firstChild.left + firstChild.width / 2 - secondChild.width / 2}px`;
    },

    right: () => {
      top.value = `${firstChild.top + firstChild.height / 2 - secondChild.height / 2}px`;
      left.value = `${firstChild.left + firstChild.width + 5}px`;
    },

    bottom: () => {
      top.value = `${firstChild.top + firstChild.height + 5}px`;
      left.value = `${firstChild.left + firstChild.width / 2 - secondChild.width / 2}px`;
    },

    left: () => {
      top.value = `${firstChild.top + firstChild.height / 2 - secondChild.height / 2}px`;
      left.value = `${firstChild.left - secondChild.width - 5}px`;
    },

    center: () => {
      top.value = `calc(50% - ${secondChild.height / 2}px)`;
      left.value = `calc(50% - ${secondChild.width / 2}px)`;
    },
  };

  // if (r < window.innerWidth) {
  //   return positionFn.right();
  // }

  // if (l > 0) {
  //   return positionFn.left();
  // }

  // if (t > 0) {
  //   return positionFn.top();
  // }

  // if (b < window.innerHeight) {
  //   return positionFn.bottom();
  // }

  return positionFn.center();
};

const show = () => {
  setPosition();
};

document.addEventListener('click', (e) => {
  if (popoverRef.value && !popoverRef.value.contains(e.target as Node)) {
    top.value = '10000px';
  }
});
</script>
