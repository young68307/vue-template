import axios from "axios";
import router from "../router";
import { message, notification } from "ant-design-vue";
import NProgress from "nprogress";
/**
 * 请求前拦截
 * 用于处理需要在请求前的操作
 */
axios.interceptors.request.use(
  config => {
    // return config
    NProgress.start();
    // if (window.localStorage.getItem("token")) {
    //   if (config.url !== "/upload") {
    //     config.headers.Authorization = window.localStorage.getItem("token");
    //   }
    // } else {
    //   router.replace("/login");
    // }
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

/**
 * 请求响应拦截
 * 用于处理需要在请求返回后的操作
 */
axios.interceptors.response.use(
  response => {
    NProgress.done();
    if (response.data.status === -1) {
      switch (response.data.errorMsg) {
        case "0X0001":
          message.warning("令牌解密异常");
          break;
        case "0X0002":
          message.warning("令牌反序列化异常");
          break;
        case "0X0003":
          message.warning("无效的请求标示");
          break;
        case "0X0004":
          message.warning("令牌已过期");
          router.push("/login");
          break;
        case "0X1001":
          message.warning("无效的签名");
          break;
        case "0X1002":
          message.warning("签名篡改");
          break;
        default:
          notification["error"]({
            message: "失败",
            description: response.data.errorMsg
          });
      }
      return response.data;
    }
    return response.data;
  },
  error => {
    if (error.response.status === 404) {
      message.warning("请求接口不存在");
    } else if (error.response.status === 403) {
      router.replace("/login");
      window.localStorage.removeItem("token");
      return;
    } else if (error.response.status === 500) {
      message.warning("内部服务器出错");
    }
    // 断网 或者 请求超时 状态
    if (!error.response) {
      // 请求超时状态
      if (error.message.includes("timeout")) {
        message.error("请求超时，请检查网络是否连接正常");
      } else {
        message.error("请求失败，请检查网络是否已连接");
      }
      return;
    }
    return Promise.reject(error);
  }
);

export function handleService(url, data, method = "GET") {
  if (method === "GET") {
    if (data) {
      Object.keys(data).forEach(key => {
        if (data[key] === "") {
          data[key] = undefined;
        }
      });
    }
    return axios({
      url: url,
      params: data,
      method: method
    });
  } else {
    return axios({
      url: url,
      data: data,
      method: method
    });
  }
}
