import {NotFoundException} from '../interfaces/NotFoundException';
import {FileManagerService} from './file.manager.service';
import {Image} from '../class/image';
import {PluginsManager} from './plugins.manager.service';
import {ArchitectureManager} from './architecture.manager';
import {Service} from 'typedi';

@Service()
export class BackgroundsService extends Image {
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
    if (
      plugin === undefined ||
      process.env.DATA_DIRECTORY === undefined ||
      plugin.background === undefined ||
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
      'data/' + plugin.background
    );
    return {
      content,
      type: this.getImageContentType(content),
    };
  }
}
