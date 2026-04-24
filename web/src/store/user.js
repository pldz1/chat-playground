import { defModelType, getModelChatParamDefs } from "@/constants";

const USER_SESSION_KEY = "chat-playground.user-session.v1";

function readUserSession() {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.warn("Failed to read user session:", error);
    return {};
  }
}

function writeUserSession(state) {
  try {
    const payload = {
      username: state.username || "",
      password: state.password || "",
      uid: state.uid || "",
      isLoggedIn: Boolean(state.isLoggedIn),
      hostUrl: state.hostUrl || "",
    };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to persist user session:", error);
  }
}

const persistedUserSession = readUserSession();

export const UserState = {
  /**
   * 当前的用户名称
   * @type {string}
   */
  username: persistedUserSession.username || "",

  /**
   * 当前的用户密码
   * @type {string}
   */
  password: persistedUserSession.password || "",

  /**
   * 当前的用户客户端id
   * @type {string}
   */
  uid: persistedUserSession.uid || "",

  /**
   * 简单的base64加密的认证字符
   * @type {string}
   */
  basicAuth: "",

  /**
   * 是否处于登录状态
   * @type {boolean}
   */
  isLoggedIn: Boolean(persistedUserSession.isLoggedIn),

  /**
   * 全部模型
   * @property {any[]} chat 对话模型列表
   * @property {any[]} image 图像模型列表
   * @property {any[]} rtaduio 实时语音模型列表
   */
  models: { chat: [], image: [], rtaudio: [] },

  /**
   * 当前的对话模型信息
   */
  curChatModel: structuredClone(defModelType),

  /**
   * 当前用户有的对话指令
   */
  chatInsTemplateList: [],

  /**
   * 当前的对话id
   */
  curChatId: "",

  /**
   * 网页接口的server的host
   */
  hostUrl: persistedUserSession.hostUrl || "",

  /**
   * 设置用户登录后的信息
   */
  setUserLoginInfo(data) {
    this.username = data.username;
    this.password = data.password;
    this.uid = data.uid;
    this.basicAuth = "";
    writeUserSession(this);
  },

  /**
   * 设置当前登录的状态
   */
  setIsLoggedIn(data) {
    this.isLoggedIn = data;
    writeUserSession(this);
  },

  /**
   * 设置全部模型
   */
  setModels(data) {
    const normalizeModels = (items = [], withChatParamDefs = false) =>
      items.map((item) => ({
        ...structuredClone(defModelType),
        ...item,
        chatParamDefs: withChatParamDefs ? getModelChatParamDefs(item) : Array.isArray(item?.chatParamDefs) ? item.chatParamDefs : [],
      }));

    this.models = {
      chat: normalizeModels(data?.chat, true),
      image: normalizeModels(data?.image),
      rtaudio: normalizeModels(data?.rtaudio),
    };
  },

  /**
   * 设置对话指令列表
   */
  setChatInsTemplateList(data) {
    this.chatInsTemplateList = data;
  },

  /**
   * 设置当前对话模型的信息
   */
  setCurChatModel(data) {
    this.curChatModel = {
      ...structuredClone(defModelType),
      ...(data || {}),
      chatParamDefs: getModelChatParamDefs(data),
    };
  },

  /**
   * 设置当前对话
   */

  setCurChatId(data) {
    this.curChatId = data;
  },

  /**
   * 设置网页请求的host url.
   */

  setHostUrl(data) {
    this.hostUrl = data;
    writeUserSession(this);
  },
};
