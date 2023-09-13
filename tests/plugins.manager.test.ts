/*
 *  Copyright (C) 2023-2032 Savoir-faire Linux Inc.
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

import 'reflect-metadata';
import 'module-alias/register';
import { PluginsManager } from "../src/services/plugins_manager.service";
import Sinon, { createStubInstance, restore, stub } from 'sinon';
import { FileManagerService } from '../src/services/file_manager.service';
import { CertificateManagerService } from '../src/services/certificate_manager';
import { Stats } from 'fs';

describe('Plugins manager service tests', function () {
    let pluginsManagerService: PluginsManager;
    let fileManager: Sinon.SinonStubbedInstance<FileManagerService>;
    let certificateManager: Sinon.SinonStubbedInstance<CertificateManagerService>;

    beforeEach(() => {
        fileManager = createStubInstance(FileManagerService);
        certificateManager = createStubInstance(CertificateManagerService);
        pluginsManagerService = new PluginsManager(fileManager, certificateManager);
    });

    afterEach(() => {
        restore();
    });

    it('should return a list of plugins', async () => {
        const fakePlugin = [
            {
                id: 'test',
                name: 'test',
                version: '',
                description: '',
                icon: '',
                arches: ['test'],
                timestamp: '',
                author: '',
                background: ''
            }];

        const expectedPlugin = [
            {
                id: 'test',
                name: 'test',
                version: '',
                description: '',
                icon: '',
                background: '',
                timestamp: '',
                author: ''
            }];

        stub(Object.getPrototypeOf(pluginsManagerService), 'isPluginAvailable').returns(true);
        pluginsManagerService['plugins'] = fakePlugin;
        const actual = await pluginsManagerService.getPlugins('test', 'en');
        expect(actual).toEqual(expectedPlugin);
    });

    it('should return a plugin', async () => {
        const plugin =
        {
            id: 'test',
            name: 'test',
            version: '1.0.0',
            description: 'test',
            icon: 'test',
            background: 'test',
            timestamp: 'test',
            author: 'test',
        }

        const expected = [{
            ...plugin,
            arches: ["test"],
        }];

    pluginsManagerService['plugins'] = expected;

        const actual = await pluginsManagerService.getPlugin("test", 'en');

        expect(actual).toEqual(plugin);
    });

    it('should return undefined if plugin not found', async () => {
        const actual = await pluginsManagerService.getPlugin("test", 'en');
        expect(actual).toBeUndefined();
    });

    it('should return plugin path', async () => {
        const plugin = {
            id: 'test',
            name: 'test',
            version: '1.0.0',
            description: 'test',
            icon: 'test',
            background: 'test',
            timestamp: 'test',
            author: 'test',
        };

        const expected = [{
            ...plugin,
            arches: ["test"],
        }];

        const expectedPath =
            '/path/to/plugins/test/test/test.jpl';

        pluginsManagerService['plugins'] = expected;

        // Stub the required methods for this test
        fileManager.listArchiveFiles.resolves(['test']);
        process.env.DATA_DIRECTORY = '/path/to/plugins';

        stub(Object.getPrototypeOf(pluginsManagerService), 'isPluginAvailable').returns(true);
        stub(Object.getPrototypeOf(pluginsManagerService), 'getPlatform').returns(['test']);
        const actualPath = await pluginsManagerService.getPluginPath('test', 'test');

        expect(actualPath).toContain(expectedPath);
    })

    it('should return undefined if plugin path not found', async () => {
        const actual = await pluginsManagerService.getPluginPath("test", "test");
        expect(actual).toBeUndefined();
    })

    it('should add a plugin', async () => {
        const pluginPath = '/path/to/plugin.jpl';

        const manifest = {
            name: 'test',
            version: '1.0.0',
            description: 'test',
            icon: 'test',
        };
        const expectedTimestamp = 'test';
        stub(Object.getPrototypeOf(pluginsManagerService), 'readManifest').resolves(manifest);
        stub(Object.getPrototypeOf(pluginsManagerService), 'getAllPluginArches').resolves(['arch1', 'arch2']);
        fileManager.getStat.resolves({ mtime: { toString: () => expectedTimestamp } } as Stats);

        certificateManager.getIssuer.resolves({ CN: 'author' });

        // Get the modification timestamp of the file

        const newPlugin = await pluginsManagerService.getNewPlugin(pluginPath, ['arch1', 'arch2']);

        const expectedPlugin = {
            name: 'test',
            version: '1.0.0',
            description: 'test',
            icon: 'test',
            arches: ['arch1', 'arch2'],
            timestamp: expectedTimestamp,
            author: 'author',
        };

        expect(newPlugin).toEqual(expectedPlugin);
    });


    it('should remove plugin', async () => {
        const pluginPath = '/path/to/plugin.jpl';

        const manifest = {
            name: 'test',
            version: '1.0.0',
            description: 'test',
            icon: 'test',
        };
        const expectedTimestamp = 'test';
        stub(Object.getPrototypeOf(pluginsManagerService), 'readManifest').resolves(manifest);
        stub(Object.getPrototypeOf(pluginsManagerService), 'getAllPluginArches').resolves(['arch1', 'arch2']);
        fileManager.getStat.resolves({ mtime: { toString: () => expectedTimestamp } } as Stats);

        certificateManager.getIssuer.resolves({ CN: 'author' });

        // Get the modification timestamp of the file

        await pluginsManagerService.getNewPlugin(pluginPath, ['test']);
        await pluginsManagerService.removePlugin('test');
        const isAvailable = pluginsManagerService['isPluginAvailable']('test', 'test');
        expect(isAvailable).toBeFalsy();
    });

    it('should return true if plugin is available', () => {
        const plugin = {
            id: 'test',
            name: 'test',
            version: '1.0.0',
            description: 'test',
            icon: 'test',
            background: 'test',
            timestamp: 'test',
            author: 'test',
        };

        const expected = [{
            ...plugin,
            arches: ["test"],
        }];

        pluginsManagerService['plugins'] = expected;

        const isAvailable = pluginsManagerService['isPluginAvailable']('test', 'test');

        expect(isAvailable).toBeTruthy();
    });

    it('should return false if plugin is not available', async () => {
        const isAvailable = pluginsManagerService['isPluginAvailable']('test', 'test');
        expect(isAvailable).toBeFalsy();
    });

    it('should return manifest', async () => {
        const pluginPath = '/path/to/plugin.jpl';

        const manifest = {
            name: 'test',
            version: '1.0.0',
            description: 'test',
            iconPath: 'test.svg',
        };

        const expected = {
            description: 'test',
            icon: 'test.svg',
            id: "test",
            name: 'test',
            version: '1.0.0',
        };

        fileManager.readArchive.resolves(JSON.stringify(manifest));

        const actual = await pluginsManagerService['readManifest'](pluginPath);

        expect(actual).toEqual(expected);
    });

    it('should return the icon content for a valid plugin', async () => {

        const plugin = {
            id: 'test',
            name: 'test',
            version: '1.0.0',
            description: 'test',
            icon: 'test',
            background: 'test',
            timestamp: 'test',
            author: 'test',
        };

        const pluginVamped = [{
            ...plugin,
            arches: ["test"],
        }];

        pluginsManagerService['plugins'] = pluginVamped;

        const manifest = {
            name: 'test',
            version: '1.0.0',
            description: 'test',
            iconPath: 'test',
        };

        const expected = 'test';

        fileManager.readArchive.resolves(JSON.stringify(manifest));
        fileManager.readArchive.resolves(expected);
        stub(Object.getPrototypeOf(pluginsManagerService), 'getPlatform').returns(['test']);
        const actual = await pluginsManagerService['getIcon']("test", "test");

        expect(actual).toEqual(expected);
    });

    it('should return an array of plugin versions', async () => {
        const plugins = [
            {
                id: 'plugin1',
                name: 'plugin1',
                version: '1.0.0',
                description: 'Plugin 1',
                icon: 'icon1',
                background: 'background1',
                arches: ['x64'],
                timestamp: 'timestamp1',
                author: 'author1',
            },
            {
                id: 'plugin2',
                name: 'plugin2',
                version: '2.0.0',
                description: 'Plugin 2',
                icon: 'icon2',
                background: 'background2',
                arches: ['x86', 'x64'],
                timestamp: 'timestamp2',
                author: 'author2',
            },
            {
                id: 'plugin3',
                name: 'plugin3',
                version: '3.0.0',
                description: 'Plugin 3',
                icon: 'icon3',
                background: 'background3',
                arches: ['x64'],
                timestamp: 'timestamp3',
                author: 'author3',
            },
        ];

        pluginsManagerService['plugins'] = plugins;

        const expectedVersions = [
            { id: 'plugin1', version: '1.0.0' },
            { id: 'plugin2', version: '2.0.0' },
            { id: 'plugin3', version: '3.0.0' },
        ];

        const actualVersions = await pluginsManagerService.getVersions();

        expect(actualVersions).toEqual(expectedVersions);
    });

    it('should return an array of plugin arches', async () => {
        const pluginPath = '/path/to/plugin.jpl';
        const expectedArches = ['x64', 'x86'];

        // Stub the required method for this test
        fileManager.listArchiveFiles.withArgs(pluginPath, 'lib/').resolves(expectedArches);

        const actualArches = await pluginsManagerService['getAllPluginArches'](pluginPath);

        expect(actualArches).toEqual(expectedArches);
    });

    it('should return undefined', async () => {

        const actual = await pluginsManagerService['setPlugins']();

        expect(actual).toBeUndefined();
    });

    it('should set plugins', async () => {
        const dataDirectory = '/path/to/plugins';
        const pluginsPath = '/path/to/plugins/plugin1';
        const platformPath = 'platform1';
        // Mock the necessary methods for this test
        process.env.DATA_DIRECTORY = dataDirectory;
        fileManager.listFiles.onFirstCall().resolves([pluginsPath]).onSecondCall().resolves([platformPath]);

        // Create a spy for the getNewPlugin method
        const getNewPluginStub = Sinon.stub(pluginsManagerService, 'getNewPlugin');

        await pluginsManagerService['setPlugins']();

        // Assert that the getNewPlugin method was called once
        expect(getNewPluginStub.calledOnce).toBeTruthy();

        // Restore the original getNewPlugin method
        getNewPluginStub.restore();
    });


});