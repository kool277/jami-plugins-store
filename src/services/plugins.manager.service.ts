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
import {type Plugins} from '../interfaces/plugins';
import {TranslationService} from './translation.service';
import {CertificateManager} from './certificate.manager.service';
import {ArchitectureManager} from './architecture.manager';
import {basename, extname} from 'path';

@Service()
export class PluginsManager {
  private plugins: Plugins[] = [];
  constructor(
    private readonly architectureManager: ArchitectureManager,
    private readonly translation: TranslationService,
    private readonly fileManager: FileManagerService,
    private readonly certificateManager: CertificateManager
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
    watcher.on('change', (_, filename: string | Buffer) => {
      const filePath =
        // eslint-disable-next-line
        __dirname +
        '/../..' +
        process.env.DATA_DIRECTORY +
        '/' +
        filename.toString();
      // check if the file signature is valid and not in the list
      this.checkPluginAlreadyPull(filePath).then(isValid => {
        if (!isValid) {
          return;
        }
        this.setPlugins().catch(e => {
          console.log(e);
        });
      });
    });
  }

  // need eslint disable because of the refactoring
  async getPlugins(
    arch: string,
    lang: string
  ): Promise<Array<Omit<Omit<Plugins, 'arches'>, 'signature'>>> {
    if (this.plugins.length === 0) {
      await this.setPlugins();
    }
    return await Promise.all(
      this.plugins
        .filter(plugin => plugin.arches.includes(arch))
        .map(async (plugin: Plugins) => {
          return {
            id: plugin.id,
            name: await this.translation.formatText(
              plugin.id,
              lang,
              plugin.name,
              await this.getPluginPath(plugin.id, arch)
            ),
            version: plugin.version,
            description: await this.translation.formatText(
              plugin.id,
              lang,
              plugin.description,
              await this.getPluginPath(plugin.id, arch)
            ),
            icon: plugin.icon,
            background: plugin.background,
            timestamp: plugin.timestamp,
            author: plugin.author,
          };
        })
    );
  }

  async getPlugin(
    id: string,
    lang: string
  ): Promise<
    | {
        id: string;
        name: string;
        version: string;
        description: string;
        icon: string | undefined;
        background: string | undefined;
        author: string;
        timestamp: string;
      }
    | undefined
  > {
    if (this.plugins.length === 0) {
      await this.setPlugins();
    }
    const plugin = this.plugins.find((plugin: Plugins) => plugin.id === id);

    return plugin === undefined
      ? undefined
      : {
          id: plugin.id,
          name: await this.translation.formatText(
            id,
            lang,
            plugin.name,
            await this.getPluginPath(id, plugin.arches[0])
          ),
          version: plugin.version,
          description: await this.translation.formatText(
            id,
            lang,
            plugin.description,
            await this.getPluginPath(id, plugin.arches[0])
          ),
          icon: plugin.icon,
          background: plugin.background,
          author: plugin.author,
          timestamp: plugin.timestamp,
        };
  }

  async findPlugin(id: string, arch: string): Promise<Plugins | undefined> {
    if (this.plugins.length === 0) {
      await this.setPlugins();
    }
    return this.plugins.find(
      (plugin: Plugins) =>
        plugin.id === id && plugin.arches.includes(arch) && arch !== undefined
    );
  }

  async getPluginPath(id: string, arch: string): Promise<string | undefined> {
    if (this.plugins.length === 0) {
      await this.setPlugins();
    }
    const plugin = this.plugins.find((plugin: Plugins) => plugin.id === id);
    if (
      plugin === undefined ||
      !this.isPluginAvailable(id, arch) ||
      process.env.DATA_DIRECTORY === undefined
    ) {
      return undefined;
    }
    const platform = this.architectureManager.getPlatform(arch);
    if (platform === undefined) {
      return undefined;
    }
    return (
      // eslint-disable-next-line
      __dirname +
      '/../..' +
      process.env.DATA_DIRECTORY +
      '/' +
      id +
      '/' +
      platform +
      '/' +
      id +
      '.jpl'
    );
  }

  private isPluginAvailable(id: string, arch: string): boolean {
    const plugin = this.plugins.find((plugin: Plugins) => {
      return plugin.id === id && plugin.arches.includes(arch);
    });
    return plugin !== undefined;
  }

  async getNewPlugin(
    path: string,
    platforms: string[]
  ): Promise<Plugins | undefined> {
    try {
      const plugin = await this.readManifest(path);
      const timestamp = (await this.fileManager.getStat(path)).mtime.toString();
      const issuer = await this.certificateManager.getIssuer(
        path,
        basename(path, extname(path)) + '.crt'
      );
      const arches = await this.architectureManager.getAllPluginArches(path);
      if (issuer === undefined || arches === undefined) {
        return;
      }
      this.architectureManager.addPluginArch(platforms, arches);
      return {
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        icon: plugin.icon,
        arches,
        timestamp,
        author: issuer.CN,
        background: plugin.background,
        signature: await this.fileManager.readArchive(path, 'signatures.sig'),
      };
    } catch (e) {
      console.error(e);
    }
    // eslint-disable-next-line
    return;
  }

  removePlugin(id: string): void {
    this.plugins = this.plugins.filter((plugin: Plugins) => plugin.id !== id);
  }

  private async readManifest(path: string): Promise<{
    id: string;
    name: string;
    version: string;
    description: string;
    icon: string;
    background: string;
  }> {
    const manifest = JSON.parse(
      (await this.fileManager.readArchive(path, 'manifest.json')).toString()
    );
    return {
      id: manifest.id === undefined ? manifest.name : manifest.id,
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      icon: manifest.iconPath,
      background: manifest.backgroundPath,
    };
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
          id: plugin.id,
          version,
        });
      }
    }
    return versions;
  }

  private async setPlugins(): Promise<void> {
    let dataDirectory = process.env.DATA_DIRECTORY;
    if (dataDirectory === undefined) {
      return;
    }
    // eslint-disable-next-line
    dataDirectory = __dirname + '/../..' + dataDirectory;
    const plugins: Plugins[] = [];
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
        // TODO: should refactor this because it's possible that two plugins in different platform have the same id
        if (plugin === undefined) {
          continue;
        }
        plugins.push(plugin);
      }
    }
    this.plugins = plugins;
  }

  private async checkPluginAlreadyPull(pluginPath: string): Promise<boolean> {
    const id = pluginPath.split('/').at(-1)?.split('.').at(0);
    const arches = await this.architectureManager.getAllPluginArches(
      pluginPath
    );
    if (id === undefined || arches === undefined) {
      return false;
    }
    const pluginAlreadyInstalled = await this.findPlugin(id, arches[0]);
    if (pluginAlreadyInstalled === undefined) {
      return true;
    }
    const signature = await this.fileManager.readArchive(
      pluginPath,
      'signatures.sig'
    );
    return !(Buffer.compare(signature, pluginAlreadyInstalled.signature) === 0);
  }
}
