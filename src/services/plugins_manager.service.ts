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
import {FileManagerService} from './file_manager.service';
import {type Plugins} from '../interfaces/plugins';
import {CertificateManagerService} from './certificate_manager';
import {basename, extname} from 'path';

@Service()
export class PluginsManager {
  private plugins: Plugins[] = [];

  constructor(
    private readonly fileManager: FileManagerService,
    private readonly certificateManager: CertificateManagerService
  ) {
    if (process.env.DATA_DIRECTORY === undefined) {
      return;
    }

    const watcher = this.fileManager.watchFile(
      // eslint-disable-next-line
      __dirname + '/../..' + process.env.DATA_DIRECTORY
    );
    if (watcher === undefined) {
      return;
    }
    // eslint-disable-next-line
    watcher.on('change', () => {
      this.setPlugins().catch(e => {
        console.log(e);
      });
    });
  }

  // need eslint disable because of the refactoring
  async getPlugins(arch: string): Promise<Array<Omit<Plugins, 'arches'>>> {
    if (this.plugins.length === 0) {
      await this.setPlugins();
    }
    return this.plugins
      .map((plugin: Plugins) => {
        return {
          name: plugin.name,
          version: plugin.version,
          description: plugin.description,
          icon: plugin.icon,
          timestamp: plugin.timestamp,
          author: plugin.author,
        };
      })
      .filter(plugin => this.isPluginAvailable(plugin.name, arch));
  }

  async getPlugin(id: string): Promise<
    | {
        name: string;
        version: string;
        description: string;
        icon: string;
        author: string;
        timestamp: string;
      }
    | undefined
  > {
    if (this.plugins.length === 0) {
      await this.setPlugins();
    }
    const plugin = this.plugins.find((plugin: Plugins) => plugin.name === id);

    return plugin === undefined
      ? undefined
      : {
          name: plugin.name,
          version: plugin.version,
          description: plugin.description,
          icon: plugin.icon,
          author: plugin.author,
          timestamp: plugin.timestamp,
        };
  }

  async getPluginPath(id: string, arch: string): Promise<string | undefined> {
    if (this.plugins.length === 0) {
      await this.setPlugins();
    }
    const plugin = this.plugins.find((plugin: Plugins) => plugin.name === id);
    if (
      plugin === undefined ||
      !this.isPluginAvailable(id, arch) ||
      process.env.DATA_DIRECTORY === undefined
    ) {
      return undefined;
    }
    return (
      // eslint-disable-next-line
      __dirname +
      '/../..' +
      process.env.DATA_DIRECTORY +
      '/' +
      plugin.name +
      '/' +
      arch +
      '/' +
      plugin.name +
      '.jpl'
    );
  }

  async getNewPlugin(
    path: string,
    arches: string[]
  ): Promise<Plugins | undefined> {
    try {
      const plugin = await this.readManifest(path);
      const timestamp = (await this.fileManager.getStat(path)).mtime.toString();
      const issuer = await this.certificateManager.getIssuer(
        path,
        basename(path, extname(path)) + '.crt'
      );
      if (issuer === undefined) {
        return;
      }
      return {
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        icon: plugin.icon,
        arches,
        timestamp,
        author: issuer.CN,
      };
    } catch (e) {
      console.error(e);
    }
    // eslint-disable-next-line
    return;
  }

  private isPluginAvailable(id: string, arch: string): boolean {
    const plugin = this.plugins.find((plugin: Plugins) => {
      return plugin.name === id && plugin.arches.includes(arch);
    });
    return plugin !== undefined;
  }

  removePlugin(id: string): void {
    this.plugins = this.plugins.filter((plugin: Plugins) => plugin.name !== id);
  }

  private async readManifest(path: string): Promise<{
    id: string;
    name: string;
    version: string;
    description: string;
    icon: string;
  }> {
    const manifest = JSON.parse(
      await this.fileManager.readArchive(path, 'manifest.json')
    );
    return {
      id: manifest.name,
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      icon: manifest.iconPath,
    };
  }

  async getIcon(
    id: string,
    arch: string | undefined = undefined
  ): Promise<string> {
    if (this.plugins.length === 0) {
      await this.setPlugins();
    }
    const plugin = this.plugins.find(
      (plugin: Plugins) =>
        plugin.name === id &&
        plugin.arches.includes(arch as string) &&
        arch !== undefined
    );
    if (plugin === undefined || process.env.DATA_DIRECTORY === undefined) {
      return '';
    }

    return await this.fileManager.readArchive(
      // eslint-disable-next-line
      __dirname +
        '/../..' +
        process.env.DATA_DIRECTORY +
        '/' +
        id +
        '/' +
        arch +
        '/' +
        id +
        '.jpl',
      'data/' + plugin.icon
    );
  }

  async getVersions(): Promise<Array<{id: string; version: string}>> {
    if (this.plugins.length === 0) {
      await this.setPlugins();
    }
    const versions: Array<{id: string; version: string}> = [];
    for (const plugin of this.plugins) {
      const version = plugin.version;
      if (version !== undefined) {
        versions.push({
          id: plugin.name,
          version,
        });
      }
    }
    return versions;
  }

  async getAllPluginArches(path: string): Promise<string[] | undefined> {
    // need to be refactored if we still use desktop and android as arch
    return await this.fileManager.listArchiveFiles(path, 'lib/');
  }

  private async setPlugins(): Promise<void> {
    let dataDirectory = process.env.DATA_DIRECTORY;
    if (dataDirectory === undefined) {
      return;
    }
    // eslint-disable-next-line
    dataDirectory = __dirname + '/../..' + dataDirectory;
    const plugins = [];
    const pluginsPath = await this.fileManager.listFiles(dataDirectory);
    if (pluginsPath === undefined || pluginsPath.length === 0) {
      return;
    }
    for (const pluginPath of pluginsPath) {
      const platformPaths = await this.fileManager.listFiles(
        dataDirectory + '/' + pluginPath
      );
      if (platformPaths === undefined || pluginPath.length === 0) {
        return;
      }
      for (const platformPath of platformPaths) {
        const plugin = await this.getNewPlugin(
          dataDirectory +
            '/' +
            pluginPath +
            '/' +
            platformPath +
            '/' +
            pluginPath +
            '.jpl',
          [platformPath]
        );
        if (plugin === undefined) {
          continue;
        }
        plugins.push(plugin);
      }
    }
    this.plugins = plugins;
  }
}
