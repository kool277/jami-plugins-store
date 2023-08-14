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
import {type Stats, promises, watch, type FSWatcher, constants} from 'fs';
import {Service} from 'typedi';
import StreamZip from 'node-stream-zip';
@Service()
export class FileManagerService {
  async readFile(path: string): Promise<Buffer> {
    try {
      return await promises.readFile(path);
    } catch (e) {
      return Buffer.from('');
    }
  }

  async isFileExist(path: string): Promise<boolean> {
    return await promises
      .access(path, constants.F_OK)
      .then(() => true)
      .catch(() => false);
  }

  async listFiles(path: string): Promise<string[]> {
    try {
      // check if the path is a directory
      const stats = await promises.stat(path);
      if (!stats.isDirectory()) {
        console.log(`${path} is not a directory`);
        return [];
      }
      return await promises.readdir(path);
    } catch (e) {
      return [];
    }
  }

  async listArchiveFiles(path: string, folderPath: string): Promise<string[]> {
    try {
      const files: string[] = [];
      // eslint-disable-next-line
      const zip = new StreamZip.async({ file: path });
      const entries = await zip.entries();
      for (const entry of Object.values(entries)) {
        const lib = entry.name.split('/')[1];
        if (entry.name.startsWith(folderPath) && !files.includes(lib)) {
          files.push(lib);
        }
      }
      zip.close();
      return files;
    } catch (e) {
      return [];
    }
  }

  async readArchive(path: string, file: string): Promise<Buffer> {
    // eslint-disable-next-line
      const zip = new StreamZip.async({ file: path });
    const content = await zip.entryData(file);
    zip.close();
    return content;
  }

  async getStat(path: string): Promise<Stats> {
    return await promises.stat(path);
  }

  watchFile(path: string): FSWatcher | undefined {
    try {
      return watch(path, {recursive: true});
    } catch (e) {
      return undefined;
    }
  }
}
