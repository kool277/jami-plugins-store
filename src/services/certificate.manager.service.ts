/*
 *  Copyright (C) 2023 Savoir-faire Linux Inc.
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301 USA.
 */
import {Service} from 'typedi';
import {FileManagerService} from './file.manager.service';
import {X509Certificate} from 'crypto';

@Service()
export class CertificateManager {
  constructor(private readonly fileManager: FileManagerService) {}

  async getIssuer(path: string, file: string): Promise<Record<string, string>> {
    const certificate = await this.readCertificate(path, file);
    return this.parseDN(certificate.issuer);
  }

  async getCaCrlPath(): Promise<string> {
    return await this.getCrlPath(
      // eslint-disable-next-line
      __dirname + '/../..' + (process.env.DATA_DIRECTORY as string),
      'root.crl'
    );
  }

  async getSflCrlPath(): Promise<string> {
    return await this.getCrlPath(
      // eslint-disable-next-line
      __dirname + '/../..' + (process.env.DATA_DIRECTORY as string),
      'SFL.crl'
    );
  }

  async getCrlPath(path: string, file: string): Promise<string> {
    const crlPath = path + '/' + file;
    const isCrlFileExist = await this.fileManager.isFileExist(crlPath);
    if (process.env.DATA_DIRECTORY === undefined || !isCrlFileExist) {
      return '';
    }
    return crlPath;
  }

  async getCaCrl(): Promise<Buffer> {
    if (process.env.DATA_DIRECTORY === undefined) {
      return Buffer.from('');
    }
    return await this.readCRL(
      // eslint-disable-next-line
      __dirname + '/../..' + process.env.DATA_DIRECTORY + '/' + 'root.crl'
    );
  }

  async getSflCrl(): Promise<Buffer> {
    if (process.env.DATA_DIRECTORY === undefined) {
      return Buffer.from('');
    }
    return await this.readCRL(
      // eslint-disable-next-line
      __dirname + '/../..' + process.env.DATA_DIRECTORY + '/' + 'sfl.crl'
    );
  }

  verifySignature(signature: Buffer, checkSignature: Buffer): boolean {
    return Buffer.compare(signature, checkSignature) === 0;
  }

  async readCertificate(path: string, file: string): Promise<X509Certificate> {
    return await this.fileManager
      .readArchive(path, file)
      .then((content: Buffer) => {
        return new X509Certificate(content);
      });
  }

  private async readCRL(file: string): Promise<Buffer> {
    return await this.fileManager.readFile(file);
  }

  parseDN(dn: string): Record<string, string> {
    return dn
      .split('\n')
      .reduce((acc: Record<string, string>, pair: string) => {
        const [key, value] = pair.split('=');
        acc[key] = value;
        return acc;
      }, {});
  }

  isSameKey(issuer: X509Certificate, plugin: X509Certificate): boolean {
    const key1Formatted = issuer.publicKey.export({
      format: 'pem',
      type: 'pkcs1',
    });
    const key2Formatted = plugin.publicKey.export({
      format: 'pem',
      type: 'pkcs1',
    });
    return key1Formatted === key2Formatted;
  }
}
