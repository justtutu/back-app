import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = headers['x-forwarded-for'] || request.ip || 'unknown';

    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    // 记录请求开始日志
    this.logger.log(
      `[${timestamp}] ${method} ${url} - 开始处理请求 - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    // 记录请求参数（敏感信息需要过滤）
    const logBody = this.sanitizeBody(body);
    const logQuery = this.sanitizeQuery(query);
    const logParams = this.sanitizeParams(params);

    if (Object.keys(logBody).length > 0) {
      this.logger.log(`请求体: ${JSON.stringify(logBody)}`);
    }
    if (Object.keys(logQuery).length > 0) {
      this.logger.log(`查询参数: ${JSON.stringify(logQuery)}`);
    }
    if (Object.keys(logParams).length > 0) {
      this.logger.log(`路径参数: ${JSON.stringify(logParams)}`);
    }

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const statusCode = response.statusCode;

        // 记录成功响应日志
        this.logger.log(
          `[${new Date().toISOString()}] ${method} ${url} - 响应成功 - 状态码: ${statusCode} - 耗时: ${duration}ms`,
        );

        // 记录响应数据（可选，生产环境可能需要限制）
        if (process.env.NODE_ENV !== 'production') {
          this.logger.log(`响应数据: ${JSON.stringify(data)}`);
        }
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const statusCode = error.status || 500;

        // 记录错误响应日志
        this.logger.error(
          `[${new Date().toISOString()}] ${method} ${url} - 响应错误 - 状态码: ${statusCode} - 耗时: ${duration}ms`,
          error.stack,
        );

        throw error;
      }),
    );
  }

  /**
   * 清理请求体中的敏感信息
   */
  private sanitizeBody(body: any): any {
    if (!body) return {};

    const sensitiveFields = [
      'password',
      'token',
      'authorization',
      'secret',
      'key',
    ];
    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }

  /**
   * 清理查询参数中的敏感信息
   */
  private sanitizeQuery(query: any): any {
    if (!query) return {};

    const sensitiveFields = ['token', 'key', 'secret'];
    const sanitized = { ...query };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }

  /**
   * 清理路径参数中的敏感信息
   */
  private sanitizeParams(params: any): any {
    if (!params) return {};

    const sensitiveFields = ['token', 'key', 'secret'];
    const sanitized = { ...params };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }
}
