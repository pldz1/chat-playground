import store from "@/store";
import { apiRequest } from "./axios-request.js";
import { dsAlert, isArrayTypeStr, isValidModelSetting } from "@/utils";
import { tr } from "@/i18n";

/**
 * 发送登录请求
 * @param {string} user - 用户名
 * @param {string} password - 密码
 * @return {Promise<{ flag: boolean, uid: string, log: string, role: string }>} 服务器返回的登录结果
 */
export const loginAPI = (username, password) => apiRequest("post", "/api/v1/login", { username, password });

/**
 * 发送获得全部模型内容的请求
 * @return {Promise<{ flag: boolean, data: string, log: string }>} 服务器返回的登录结果
 */
export const getModelsAPI = (username) => apiRequest("post", "/api/v1/user/getModels", { username });

/**
 * 发送全部模型的请求
 * @return {Promise<{ flag: boolean, data: string, log: string }>} 服务器返回的登录结果
 */
export const setModelsAPI = (username, data) => apiRequest("post", "/api/v1/user/setModels", { username, data });

/**
 * 发送获得对话模型的全部内容的请求
 * @return {Promise<{ flag: boolean, data: string, log: string }>} 服务器返回的登录结果
 */
export const getChatInsTemplateListAPI = (username) => apiRequest("post", "/api/v1/user/getChatInsTemplateList", { username });

/**
 * 发送设置对话模型的请求
 * @return {Promise<{ flag: boolean, data: string, log: string }>} 服务器返回的登录结果
 */
export const setChatInsTemplateListAPI = (username, data) => apiRequest("post", "/api/v1/user/setChatInsTemplateList", { username, data });

/**
 * 发送登录请求
 * @param {string} user - 用户名
 * @param {string} password - 密码
 * @return {Promise<boolean>} 服务器返回的登录结果
 */
export async function login(username, password) {
  const res = await loginAPI(username, password);
  if (!res.flag) {
    dsAlert({ type: "error", message: tr("toast.loginFailed", { error: res.log }) });
    return false;
  }

  dsAlert({ type: "success", message: tr("toast.loginSuccess") });
  await store.dispatch("login", username);
  return true;
}

/**
 * 获取全部的对话模型信息然后更新store
 * @returns {Promise<object | null>}
 */
export async function getModels(updateStore = true) {
  const username = store.state.username;
  const isLoggedIn = store.state.isLoggedIn;
  if (!isLoggedIn || !username) return false;

  let res = await getModelsAPI(username);

  if (!res.flag) {
    dsAlert({ type: "error", message: tr("toast.userModelsFetchFailed", { error: res.log }) });
    return false;
  }

  if (res.data == "") {
    dsAlert({
      type: "warn",
      message: tr("toast.userModelsMissing"),
    });
    return false;
  }

  try {
    const models = JSON.parse(res.data);
    const isValid = isValidModelSetting(models);
    if (isValid) {
      if (updateStore) await store.dispatch("setModels", models);
      return models;
    } else {
      dsAlert({
        type: "error",
        message: tr("toast.userModelsInvalid", { error: `${err}: ${res.data}` }),
      });
      return null;
    }
  } catch (err) {
    dsAlert({
      type: "error",
      message: tr("toast.userModelsInvalid", { error: `${err}: ${res.data}` }),
    });
    return null;
  }
}

/**
 * 将store内用到的全部模型存到数据库
 * @returns {Promise<boolean>}
 */
export async function setModels() {
  const username = store.state.username;
  const isLoggedIn = store.state.isLoggedIn;
  if (!isLoggedIn || !username) return false;

  const models = store.state.models;
  const res = await setModelsAPI(username, JSON.stringify(models));
  if (!res.flag) {
    dsAlert({ type: "error", message: tr("toast.userModelsSaveFailed", { error: res.log }) });
    return false;
  }
  return true;
}

/**
 * 获取全部的对话指令
 * @returns {Promise<boolean>}
 */
export async function getChatInsTemplateList() {
  const username = store.state.username;
  const isLoggedIn = store.state.isLoggedIn;
  if (!isLoggedIn || !username) return false;

  const res = await getChatInsTemplateListAPI(username);

  if (!res.flag) {
    dsAlert({
      type: "error",
      message: tr("toast.userTemplatesFetchFailed", { error: res.log }),
    });
    return false;
  } else {
    if (isArrayTypeStr(res.data)) {
      await store.dispatch("setChatInsTemplateList", JSON.parse(res.data));
    } else {
      await store.dispatch("setChatInsTemplateList", []);
    }
    return true;
  }
}

/**
 * 获取全部的对话指令模板
 * @returns {Promise<boolean>}
 */
export async function setChatInsTemplateList(data) {
  await store.dispatch("setChatInsTemplateList", data);

  const username = store.state.username;
  const isLoggedIn = store.state.isLoggedIn;
  if (!isLoggedIn || !username) return false;
  const res = await setChatInsTemplateListAPI(username, JSON.stringify(data));

  if (!res.flag) {
    dsAlert({
      type: "error",
      message: tr("toast.userTemplatesSaveFailed", { error: res.log }),
    });
    return false;
  }
  return true;
}
