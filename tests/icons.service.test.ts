import 'reflect-metadata';
import 'module-alias/register';
import Sinon, { createStubInstance, restore, stub } from 'sinon';
import { IconsService } from '../src/services/icons.service';
import { PluginsManager } from '../src/services/plugins.manager.service';
import { FileManagerService } from '../src/services/file.manager.service';
import { ArchitectureManager } from '../src/services/architecture.manager';
import { Plugins } from '../src/interfaces/plugins';
describe('IconsService', () => {
    let iconsService: IconsService;
    let pluginManagerStub: Sinon.SinonStubbedInstance<PluginsManager>;
    let fileManagerStub: Sinon.SinonStubbedInstance<FileManagerService>;
    let architectureManagerStub: Sinon.SinonStubbedInstance<ArchitectureManager>;
    beforeEach(() => {
        pluginManagerStub = createStubInstance(PluginsManager);
        fileManagerStub = createStubInstance(FileManagerService);
        architectureManagerStub = createStubInstance(ArchitectureManager);
        iconsService = new IconsService(pluginManagerStub, fileManagerStub, architectureManagerStub);
    })
    afterEach(() => {
        restore();
    })
    it('should return the icon content for a valid plugin', async () => {
        const plugin = {
            name: 'test',
            id: 'test',
            version: '1.0.0',
            description: 'test',
            icon: 'test',
        } as Plugins;
        process.env.DATA_DIRECTORY = '/path/to/plugins';
        const expected = 'test';
        pluginManagerStub.findPlugin.resolves(plugin);
        fileManagerStub.readArchive.resolves(Buffer.from(expected));
        architectureManagerStub.getPlatform.returns('test');
        stub(Object.getPrototypeOf(iconsService), 'getImageContentType').returns('test');

        const actual = await iconsService.getImage("test", "test");

        expect(actual.content).toEqual(Buffer.from(expected));
    });
});
