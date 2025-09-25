<template>
  <div class="w16 border-rd-0.8 text-center active:bg-#e6e6e6 hover:bg-gray" :class="{ active: active === attrs.value }">
    <slot> </slot>
  </div>
</template>
<script setup lang="ts">
import { useAttrs, inject } from 'vue';

const active = inject('switcher');
const attrs = useAttrs();
</script>
<style>
.active {
  background-color: #f2f2f2;
}
</style>
