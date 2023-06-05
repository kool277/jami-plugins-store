/*
 * Copyright (C) 2023 Savoir-faire Linux Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301 USA.
 */
import {type Server} from 'http';
import request from 'supertest';
import app from '../src/index';

let appInstance: Server;

beforeAll(() => {
  appInstance = app.listen(3000);
});

afterAll(done => {
  appInstance.close(done);
});

describe('GET /', () => {
  test('should retrieve the list of plugins', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 'GreenScreen',
        name: 'Green Screen',
        description:
          'This plugin hides your background during a call. Your background can be blured or changed with another image.',
        version: '2.0.0',
        iconPath: 'https://jami.net/plugins/download?id=GreenScreen/icon.svg',
      },
      {
        id: 'WaterMark',
        name: 'Water Mark',
        description:
          "With this plugin you'll be able to add a water mark to a call video. This water mark is basically an image but can also contain location, day and time.",
        version: '2.1.0',
        iconPath: 'https://jami.net/plugins/download?id=WaterMark/icon.svg',
      },
      {
        id: 'AudioFilter',
        name: 'Audio Filter',
        description: 'Provides audio filter for audio and video calls: reverb',
        version: '0.1.0',
        iconPath: 'https://jami.net/plugins/download?id=AduioFilter/icon.svg',
      },
    ]);
  });
});

describe('GET /details/:id', () => {
  test('should retrieve plugin details by ID', async () => {
    const pluginId = 'GreenScreen'; // Provide an existing plugin ID

    const response = await request(app).get(`/details/${pluginId}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'GreenScreen',
      name: 'Green Screen',
      description:
        'This plugin hides your background during a call. Your background can be blured or changed with another image.',
      version: '2.0.0',
      iconPath: 'https://jami.net/plugins/download?id=GreenScreen/icon.svg',
    });
  });

  test('should return 404 if plugin ID is not found', async () => {
    const pluginId = 'MalwareRobotsNonExistentPlugin'; // Provide a non-existing plugin ID

    const response = await request(app).get(`/details/${pluginId}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({error: 'Plugin not found'});
  });
});

describe('GET /download/:id', () => {
  test('should download the plugin file by ID', async () => {
    const pluginId = 'GreenScreen'; // Provide an existing plugin ID

    const response = await request(app).get(`/download/${pluginId}.jpl`);
    expect(response.status).toBe(200);
    expect(response.header['content-disposition']).toContain(
      `attachment; filename="${pluginId}.jpl"`
    );
  });

  test('should return 404 if plugin ID is not found', async () => {
    const pluginId = 'NonExistingPlugin'; // Provide a non-existing plugin ID

    const response = await request(app).get(`/download/${pluginId}.jpl`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Plugin not found',
    });
  });
});

describe('GET /download/:id', () => {
  const pluginIds = ['GreenScreen', 'AudioFilter', 'WaterMark'];

  test.each(pluginIds)(
    'should download the plugin file by ID: %s',
    async pluginId => {
      const response = await request(app).get(`/download/${pluginId}.jpl`);
      expect(response.status).toBe(200);
      expect(response.header['content-disposition']).toContain(
        `attachment; filename="${pluginId}.jpl"`
      );
    }
  );

  test('should return 404 if plugin ID is not found', async () => {
    const pluginId = 'NonExistingPlugin'; // Provide a non-existing plugin ID

    const response = await request(app).get(`/download/${pluginId}.jpl`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Plugin not found',
    });
  });
});
