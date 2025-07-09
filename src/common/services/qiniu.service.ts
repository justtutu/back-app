import { Injectable } from '@nestjs/common';
import * as qiniu from 'qiniu';

@Injectable()
export class QiniuService {
  private accessKey = process.env.QINIU_ACCESS_KEY!;
  private secretKey = process.env.QINIU_SECRET_KEY!;
  private bucket = process.env.QINIU_BUCKET!;
  private domain = process.env.QINIU_DOMAIN!;

  private mac = new qiniu.auth.digest.Mac(this.accessKey, this.secretKey);
  private config = new qiniu.conf.Config();

  async uploadFile(buffer: Buffer, key: string): Promise<string> {
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: `${this.bucket}:${key}`,
    });
    const uploadToken = putPolicy.uploadToken(this.mac);
    const formUploader = new qiniu.form_up.FormUploader(this.config);
    const putExtra = new qiniu.form_up.PutExtra();
    return new Promise((resolve, reject) => {
      formUploader.put(
        uploadToken,
        key,
        buffer,
        putExtra,
        (err, body, info) => {
          if (err) return reject(err);
          if (info.statusCode === 200) {
            // 生成私有空间带 token 的下载链接
            const bucketManager = new qiniu.rs.BucketManager(
              this.mac,
              this.config,
            );
            // 有效期 1 小时（3600 秒）
            const deadline = Math.floor(Date.now() / 1000) + 3600;
            const privateUrl = bucketManager.privateDownloadUrl(
              this.domain.replace(/\/$/, ''),
              body.key.replace(/^\//, ''),
              deadline,
            );
            resolve(privateUrl);
          } else {
            reject(body);
          }
        },
      );
    });
  }

  /**
   * 根据已上传的coverUrl生成带token的私有下载链接
   * @param coverUrl 完整的七牛云公开URL
   * @param expires 有效期（秒），默认3600
   */
  getPrivateDownloadUrl(coverUrl: string, expires = 3600): string {
    if (!coverUrl) return '';
    // 提取key
    let key = coverUrl;
    if (coverUrl.startsWith(this.domain)) {
      key = coverUrl.replace(this.domain, '').replace(/^\//, '');
    } else {
      // 兼容http/https
      const domainNoProtocol = this.domain.replace(/^https?:\/\//, '');
      key = coverUrl
        .replace(new RegExp(`^https?://` + domainNoProtocol), '')
        .replace(/^\//, '');
    }
    const bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
    const deadline = Math.floor(Date.now() / 1000) + expires;
    return bucketManager.privateDownloadUrl(
      this.domain.replace(/\/$/, ''),
      key,
      deadline,
    );
  }
}
