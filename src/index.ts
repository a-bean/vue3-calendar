import { App } from 'vue';
import Calendar from './index.vue';
import 'uno.css'; // 导入UnoCSS基础样式

// 导出组件
export { default as Calendar } from './index.vue';

// 导出类型
export type { TData, ECalendarType } from './types';

// 导出工具函数
export { getDaysScope } from './date';

// Vue插件安装函数
export function install(app: App) {
  app.component('Calendar', Calendar);
}

// 默认导出
export default {
  install,
  Calendar,
};

// 支持全局注册
declare module '@vue/runtime-core' {
  interface GlobalComponents {
    Calendar: typeof Calendar;
  }
}
