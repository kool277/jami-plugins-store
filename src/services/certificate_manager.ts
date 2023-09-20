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
export class CertificateManagerService {
  constructor(private readonly fileManager: FileManagerService) {}

  async getIssuer(path: string, file: string): Promise<Record<string, string>> {
    const certificate = await this.readCertificate(path, file);
    return this.parseDN(certificate.issuer);
  }

  private async readCertificate(
    path: string,
    file: string
  ): Promise<X509Certificate> {
    return await this.fileManager
      .readArchive(path, file)
      .then((content: Buffer) => {
        return new X509Certificate(content);
      });
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
}
