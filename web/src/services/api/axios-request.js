import axios from "axios";
import store from "@/store";
import { mockApiRequest } from "./mock-local-server.js";

const LONGTIME = 180000;
let backendMode = "unknown";
let backendModeHost = null;

function normalizeHostUrl(hostUrl) {
  return hostUrl || "";
}

function shouldUseMockFallback(error) {
  if (!error?.response) return true;
  return [404, 405, 501, 502, 503, 504].includes(error.response.status);
}

function syncBackendMode(hostUrl) {
  const normalizedHost = normalizeHostUrl(hostUrl);
  if (backendModeHost !== normalizedHost) {
    backendModeHost = normalizedHost;
    backendMode = "unknown";
  }
}

function withBackendMeta(result, mode) {
  if (result && typeof result === "object") {
    return { ...result, __backendMode: mode };
  }
  return result;
}

/** 调用登录的接口
 * Axios中，第一个参数是URL
 *          第二个参数是数据body体，对应fast api封装的class.
 *          第三个参数是 axios 请求的配置选项，例如headers.
 * 比较规范的写法建议是将第二参数的body体内的变量做到与fast api的class格式一一对应.
 * */
export async function apiRequest(method, endpoint, body = {}, headers = { "Content-Type": "application/json" }, timeout = LONGTIME) {
  const hostUrl = normalizeHostUrl(store.state.hostUrl);
  syncBackendMode(hostUrl);

  if (backendMode === "mock") {
    return withBackendMeta(await mockApiRequest(endpoint, body), "mock");
  }

  try {
    const response = await axios({
      method: method,
      url: `${hostUrl + endpoint}`,
      data: body,
      headers: headers,
      timeout: timeout,
      withCredentials: true,
    });
    backendMode = "remote";
    return withBackendMeta(response.data, "remote");
  } catch (error) {
    if (shouldUseMockFallback(error)) {
      backendMode = "mock";
      console.warn(`API server unavailable, fallback to localStorage mock for ${endpoint}.`);
      return withBackendMeta(await mockApiRequest(endpoint, body), "mock");
    }

    if (error.code === "ECONNABORTED") {
      console.error("Request timeout!");
    } else {
      console.error(error.message);
    }

    return { data: error.message || "Request failed!" };
  }
}
