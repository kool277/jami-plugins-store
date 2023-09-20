import 'reflect-metadata';
import 'module-alias/register';
import Sinon, { createStubInstance, restore, stub } from 'sinon';
import {BackgroundsService} from '../src/services/backgrounds.service';
import { PluginsManager } from '../src/services/plugins.manager.service';
import { FileManagerService } from '../src/services/file.manager.service';
import { ArchitectureManager } from '../src/services/architecture.manager';
import { Plugins } from '../src/interfaces/plugins';


describe('BackgroundsService', () => {
    let backgroundService: BackgroundsService;
    let pluginManagerStub: Sinon.SinonStubbedInstance<PluginsManager>;
    let fileManagerStub: Sinon.SinonStubbedInstance<FileManagerService>;
    let architectureManagerStub: Sinon.SinonStubbedInstance<ArchitectureManager>;
    beforeEach(() => {
        pluginManagerStub = createStubInstance(PluginsManager);
        fileManagerStub = createStubInstance(FileManagerService);
        architectureManagerStub = createStubInstance(ArchitectureManager);
        backgroundService = new BackgroundsService(pluginManagerStub, fileManagerStub, architectureManagerStub);
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
            background: 'test',
        } as Plugins;
        process.env.DATA_DIRECTORY = '/path/to/plugins';
        const expected = 'test';
        pluginManagerStub.findPlugin.resolves(plugin);
        fileManagerStub.readArchive.resolves(Buffer.from(expected));
        architectureManagerStub.getPlatform.returns('test');
        stub(Object.getPrototypeOf(backgroundService), 'getImageContentType').returns('test');

        const actual = await backgroundService.getImage("test", "test");

        expect(actual.content).toEqual(Buffer.from(expected));
    });
});
