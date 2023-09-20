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

import {NotFoundException} from '../interfaces/NotFoundException';
import {Image} from '../class/image';
import {PluginsManager} from './plugins.manager.service';
import {ArchitectureManager} from './architecture.manager';
import {FileManagerService} from './file.manager.service';
import {Service} from 'typedi';

@Service()
export class IconsService extends Image {
  constructor(
    private readonly pluginsManager: PluginsManager,
    private readonly fileManager: FileManagerService,
    private readonly architectureManager: ArchitectureManager
  ) {
    super();
  }

  async getImage(
    id: string,
    arch: string
  ): Promise<{content: Buffer; type: string}> {
    const plugin = await this.pluginsManager.findPlugin(id, arch);
    const platform = this.architectureManager.getPlatform(arch);
    console.log(plugin, process.env.DATA_DIRECTORY, platform);
    if (
      plugin === undefined ||
      process.env.DATA_DIRECTORY === undefined ||
      plugin.icon === undefined ||
      platform === undefined
    ) {
      throw new NotFoundException('Plugin not found');
    }
    const content = await this.fileManager.readArchive(
      // eslint-disable-next-line
          __dirname +
        '/../..' +
        process.env.DATA_DIRECTORY +
        '/' +
        plugin.id +
        '/' +
        platform +
        '/' +
        plugin.id +
        '.jpl',
      'data/' + plugin.icon
    );
    return {
      content,
      type: this.getImageContentType(content),
    };
  }
}
