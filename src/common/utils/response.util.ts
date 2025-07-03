/**
 * 统一响应格式工具
 */
export class ResponseUtil {
  /**
   * 成功响应
   */
  static success<T = any>(data?: T, msg: string = '操作成功') {
    return {
      success: true,
      data: {
        msg,
        ...(data && typeof data === 'object' ? data : { result: data }),
      },
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