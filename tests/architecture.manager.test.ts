import { ArchitectureManager } from '../src/services/architecture.manager';
import { FileManagerService } from '../src/services/file.manager.service';
import Sinon, { createStubInstance, restore } from 'sinon';

describe('ArchitectureManager', () => {
  let architectureManager: ArchitectureManager;
  let fileManagerService: Sinon.SinonStubbedInstance<FileManagerService>;

  beforeEach(() => {
    fileManagerService = createStubInstance(FileManagerService);
    architectureManager = new ArchitectureManager(fileManagerService);
  });

  afterEach(() => {
    restore();
  });
  describe('getAllPluginArches', () => {
    it('should return undefined if no arches are found', async () => {
      fileManagerService.listArchiveFiles.resolves([]);
      const result = await architectureManager.getAllPluginArches('path');
      expect(result).toEqual([]);
    });

    it('should return the list of arches if arches are found', async () => {
      fileManagerService.listArchiveFiles.resolves(['lib/x86', 'lib/arm64']);
      const result = await architectureManager.getAllPluginArches('path');
      expect(result).toEqual(['lib/x86', 'lib/arm64']);
    });
  });

  describe('addPluginArch', () => {
    it('should add new arches to existing platforms', () => {
      architectureManager.addPluginArch(['android'], ['x86']);
      architectureManager.addPluginArch(['android'], ['arm64']);
      expect(architectureManager['archesResolution'].get('android')).toEqual([
        'x86',
        'arm64',
      ]);
    });

    it('should create new platforms if they do not exist', () => {
      architectureManager.addPluginArch(['ios'], ['arm64']);
      expect(architectureManager['archesResolution'].get('ios')).toEqual([
        'arm64',
      ]);
    });
  });

  describe('getPlatform', () => {
    it('should return the platform for a given arch', () => {
      architectureManager['archesResolution'].set('android', ['x86', 'arm64']);
      const result = architectureManager.getPlatform('x86');
      expect(result).toEqual('android');
    });

    it('should return undefined if the arch is not found', () => {
      architectureManager['archesResolution'].set('android', ['x86', 'arm64']);
      const result = architectureManager.getPlatform('arm');
      expect(result).toBeUndefined();
    });
  });
});