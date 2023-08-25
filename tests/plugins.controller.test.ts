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

import { createStubInstance, SinonStubbedInstance, restore } from 'sinon';
import { PluginsManager } from "../src/services/plugins_manager.service";
import { StatusCodes } from 'http-status-codes';
import { Application } from "../src/app";
import { Container } from "typedi";
import request from "supertest";
import fs from "fs";

describe('Routes', function () {

  let pluginsManagerServiceStub: SinonStubbedInstance<PluginsManager>;
  let expressApp: Express.Application;

  beforeEach(() => {
    pluginsManagerServiceStub = createStubInstance(PluginsManager);

    const app = Container.get(Application);
    Object.defineProperty(app['pluginsController'], 'pluginsManager', { value: pluginsManagerServiceStub });
    expressApp = app.app;
  });

  afterEach(() => {
    restore();
  });

  it("should fetch all plugins", (done) => {
    const expectedPlugins = [
      {
        id: 'test',
        name: 'test',
        version: '',
        description: '',
        icon: '',
        background: '',
        arches: ['test'],
        timestamp: '',
        author: ''
      }];
    pluginsManagerServiceStub.getPlugins.resolves(expectedPlugins);

    request(expressApp)
      .get("/?arch=test")
      .expect(StatusCodes.OK)
      .then((response) => {
        expect(response.body).toEqual(expectedPlugins);
        done();
      });
  });

  it("should not fetch all plugins if no arch is provided", (done) => {
    request(expressApp)
      .get("/")
      .expect(StatusCodes.BAD_REQUEST)
      .then((response) => {
        done();
      });
  });

  it("should not fetch all plugins if pluginsManager service throws an error", (done) => {
    pluginsManagerServiceStub.getPlugins.rejects();

    request(expressApp)
      .get("/?arch=test")
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .then((response) => {
        done();
      });
  });

  it("should fetch plugin details", (done) => {
    const expectedPlugin = { id: 'test', name: 'test', version: '', description: '', icon: '', author: '', timestamp: '', background: '' };
    pluginsManagerServiceStub.getPlugin.resolves(expectedPlugin);

    request(expressApp)
      .get("/details/test?arch=test")
      .expect(StatusCodes.OK)
      .then((response) => {
        expect(response.body).toEqual(expectedPlugin);
        done();
      });
  });

  it("should not fetch plugin details if no pluginId is provided", (done) => {
    request(expressApp)
      .get("/details/?arch=test")
      .expect(StatusCodes.NOT_FOUND)
      .then((response) => {
        done();
      });
  });

  it("should not fetch plugin details if no arch is provided", (done) => {
    request(expressApp)
      .get("/details/test")
      .expect(StatusCodes.BAD_REQUEST)
      .then((response) => {
        done();
      });
  });

  it("should not fetch plugin details if pluginManager service throws an error", (done) => {
    pluginsManagerServiceStub.getPlugin.rejects();

    request(expressApp)
      .get("/details/test?arch=test")
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .then((response) => {
        done();
      });
  });

  it("should download a plugin", (done) => {
    pluginsManagerServiceStub.getPluginPath.resolves('test');
    const expectedPlugin = { id: 'test', name: 'test', version: '', description: '', icon: '', author: '', timestamp: '', background: ''  };
    pluginsManagerServiceStub.getPlugin.resolves(expectedPlugin);

    fs.writeFileSync('test', 'test');

    request(expressApp)
      .get("/download/test/test")
      .expect(StatusCodes.OK)
      .then((response) => {
        expect(response.body).toEqual(Buffer.from('test'));
        fs.unlinkSync('test');
        done();
      });
  });

  it("should not download plugin if no id is provided", (done) => {
    request(expressApp)
      .get("/download/?arch=test")
      .expect(StatusCodes.NOT_FOUND)
      .then((response) => {
        done();
      });
  });

  it("should not download plugin if no arch and no id is provided", (done) => {
    request(expressApp)
      .get("/download/")
      .expect(StatusCodes.NOT_FOUND)
      .then((response) => {
        done();
      });
  });

  it("should not download plugin if pluginsManager service throws an error", (done) => {
    pluginsManagerServiceStub.getPluginPath.rejects();
    request(expressApp)
      .get("/download/test/test")
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      .then((response) => {
        done();
      });
  });

  it("should get icon if the given id is valid", (done) => {
    const expectedIcon = 'test';
    pluginsManagerServiceStub.getIcon.resolves(Buffer.from(expectedIcon));

    request(expressApp)
      .get("/icons/test?arch=test")
      .expect(StatusCodes.OK)
      .then((response) => {
        expect(response.body).toEqual(Buffer.from(expectedIcon));
        done();
      });
  });

  it("should not get icon if no arch is given", (done) => {
    request(expressApp)
      .get("/icons/test")
      .expect(StatusCodes.BAD_REQUEST)
      .then((response) => {
        done();
      });
  });

  it("should not fetch versions if an invalid id is given", (done) => {
    request(expressApp)
      .get("/versions/test/test")
      .expect(StatusCodes.NOT_FOUND)
      .then((response) => {
        done();
      });
  });

  it("should not fetch versions if pluginsManager service throws an error", (done) => {
    // Mock the error thrown by pluginsManager.getVersions
    const error = new Error("Error occurred in pluginsManager");
    pluginsManagerServiceStub.getVersions.rejects(error);

    request(expressApp)
      .get("/versions/?arch=test")
      .expect(StatusCodes.NOT_FOUND)
      .then((response) => {
        done();
      });
  });
});
