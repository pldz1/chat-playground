import { createApp } from "vue";
import App from "./App.vue";

/**
 * 使用vue3的路由
 * https://juejin.cn/post/7143890189524402183
 */
import router from "./router";
import i18n from "./i18n";

/**
 * 使用vuex实现存储全局变量
 * https://vuex.vuejs.org/zh/
 */
import store from "./store";
import { applyTheme, getStoredTheme } from "./utils/theme";
import { setAppLocale } from "./i18n";

// 引入自定义全局样式文件
import "./assets/style/index.scss";

const app = createApp(App);
app.use(store);
app.use(router);
app.use(i18n);
applyTheme(getStoredTheme());
setAppLocale(i18n.global.locale.value);
app.mount("#app");
