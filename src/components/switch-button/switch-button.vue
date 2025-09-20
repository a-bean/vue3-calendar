<template>
  <div class="switch-container">
    <div class="switch-btn" @click="emitter(EEvents.change, -1)">
      <div class="chevron-icon">‹</div>
    </div>
    <div class="switch-btn switch-btn-today" @click="emitter(EEvents.recover)">今天</div>
    <div class="switch-btn">
      <div class="chevron-icon" @click="emitter(EEvents.change, +1)">›</div>
    </div>
  </div>
</template>

<script setup lang="ts">
enum EEvents {
  change = 'change',
  recover = 'recover',
}

const emitter = defineEmits<{
  (event: EEvents.change, value: number): void;
  (event: EEvents.recover): void;
}>();
</script>

<style>
.switch-container {
  @apply h5 flex cursor-pointer flex-items-center select-none;
}

.switch-btn {
  @apply h5 w5 flex justify-center flex-items-center
         b b-color-#ccc border-rd-1.2 b-solid hover:bg-gray active:bg-#e6e6e6;
}

.switch-btn-today {
  @apply ml-1px mr-1px w12 text-center font-size-3 line-height-5;
}

.chevron-icon {
  @apply text-center font-size-3 line-height-5;
  font-weight: bold;
}
</style>
