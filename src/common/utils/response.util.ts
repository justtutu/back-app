/**
 * 统一响应格式工具
 */
export class ResponseUtil {
  /**
   * 成功响应
   */
  static success<T = any>(data?: T, msg: string = '操作成功') {
    let resp: any = { msg };
    if (Array.isArray(data)) {
      resp.data = data;
    } else if (data && typeof data === 'object') {
      resp = { ...resp, ...data };
    } else {
      resp.data = data ?? null;
    }
    return {
      success: true,
      data: resp,
    };
  }

  /**
   * 失败响应
   */
  static error(msg: string = '操作失败', data?: any) {
    return {
      success: false,
      data: {
        msg,
        ...(data && typeof data === 'object' ? data : { result: data }),
      },
    };
  }

  /**
   * 微信小程序登录响应格式
   */
  static loginSuccess(token: string, userInfo: any) {
    return {
      success: true,
      data: {
        msg: '登录成功',
        token,
        userInfo,
      },
    };
  }
}
