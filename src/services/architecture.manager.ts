import {Service} from 'typedi';
import {FileManagerService} from './file.manager.service';

@Service()
export class ArchitectureManager {
  private readonly archesResolution = new Map<string, string[]>();

  constructor(private readonly fileManager: FileManagerService) {}

  async getAllPluginArches(path: string): Promise<string[] | undefined> {
    // need to be refactored if we still use desktop and android as arch
    return await this.fileManager.listArchiveFiles(path, 'lib/');
  }

  addPluginArch(platforms: string[], arches: string[]): void {
    for (const platform of platforms) {
      if (this.archesResolution.has(platform)) {
        const oldArches = this.archesResolution.get(platform);
        if (oldArches === undefined) {
          this.archesResolution.set(
            platform,
            JSON.parse(JSON.stringify(arches))
          );
          continue;
        }
        for (const arch of arches) {
          if (!oldArches.includes(arch)) {
            oldArches.push(arch);
          }
        }
        this.archesResolution.set(
          platform,
          JSON.parse(JSON.stringify(oldArches))
        );
      } else {
        this.archesResolution.set(platform, JSON.parse(JSON.stringify(arches)));
      }
    }
  }

  getPlatform(arch: string): string | undefined {
    return Array.from(this.archesResolution.entries()).find(([_, value]) =>
      value.includes(arch)
    )?.[0];
  }
}
