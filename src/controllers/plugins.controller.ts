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

import {PluginsManager} from '../services/plugins.manager.service';
import {type Request, type Response, Router} from 'express';
import fs from 'fs';
import {Service} from 'typedi';
import {NotFoundException} from '../interfaces/NotFoundException';
import {StatusCodes} from 'http-status-codes';
import {IconsService} from '../services/icons.service';
import {BackgroundsService} from '../services/backgrounds.service';
import {TranslationService} from '../services/translation.service';

@Service()
export class PluginsController {
  router = Router();

  constructor(
    private readonly pluginsManager: PluginsManager,
    private readonly translation: TranslationService,
    private readonly iconsManager: IconsService,
    private readonly backgroundsManager: BackgroundsService
  ) {
    this.configureRouter();
  }

  private configureRouter(): void {
    if (this.router === undefined) {
      this.router = Router();
    }
    /**
     * @swagger
     * tags:
     *   name: Example
     *   description: Example API endpoints
     *   externalDocs:
     *     description: Find out more about Example
     *     url: http://example.com
     *
     * /plugins:
     *   get:
     *     summary: Get plugins for a given architecture
     *     description: Returns the plugins for a given architecture.
     *     tags: [Example, Time]
     *     parameters:
     *       - name: arch
     *         in: query
     *         description: The architecture for which plugins are requested.
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Successful response with the plugins data.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   name:
     *                     type: string
     *                   version:
     *                     type: string
     *                   author:
     *                     type: string
     *       '400':
     *         description: Bad request - When the 'arch' parameter is missing.
     *       '500':
     *         description: Internal server error - Something went wrong on the server.
     */
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        let langs = req.get('Accept-Language');
        if (langs === undefined) {
          langs = 'en';
        }
        const lang = this.translation.getLanguage(langs);
        const arch: string = req.query.arch as string;
        if (arch === undefined) {
          res.status(StatusCodes.BAD_REQUEST).send();
          return;
        }
        const plugins = await this.pluginsManager.getPlugins(arch, lang);
        res.status(StatusCodes.OK).send(plugins);
      } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
      }
    });

    /**
     * @swagger
     *
     * /details/:id:
     *   get:
     *     summary: Get details of a plugin for a given ID and architecture
     *     description: Returns details of a plugin for a given ID and architecture.
     *     tags: [Example, Time]
     *     parameters:
     *       - name: id
     *         in: path
     *         description: The ID of the plugin.
     *         required: true
     *         schema:
     *           type: string
     *       - name: arch
     *         in: query
     *         description: The architecture for which the plugin details are requested.
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Successful response with the plugin details.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 name:
     *                   type: string
     *                 version:
     *                   type: string
     *                 author:
     *                   type: string
     *       '400':
     *         description: Bad request - When the 'id' or 'arch' parameter is missing.
     *       '404':
     *         description: Not found - When the plugin with the specified ID is not found.
     *       '500':
     *         description: Internal server error - Something went wrong on the server.
     */
    // GET /details/:id?arch=:arch
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.router.get('/details/:id', async (req: Request, res: Response) => {
      try {
        let langs = req.get('Accept-Language');
        if (langs === undefined) {
          langs = 'en';
        }
        const lang = this.translation.getLanguage(langs);
        const pluginId: string = req.params.id;
        const arch: string = req.query.arch as string;
        if (pluginId === undefined || arch === undefined) {
          res.status(StatusCodes.BAD_REQUEST).send();
          return;
        }
        const plugin = await this.pluginsManager.getPlugin(pluginId, lang);
        if (plugin === undefined) {
          res.status(StatusCodes.NOT_FOUND).send();
          return;
        }
        res.status(StatusCodes.OK).send(plugin);
        return;
      } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
      }
    });

    /**
     * @swagger
     *
     * /download/{arch}/{id}:
     *   get:
     *     summary: Download a plugin file for a given ID and architecture
     *     description: Download a plugin file for a given ID and architecture.
     *     tags: [Example, Time]
     *     parameters:
     *       - name: id
     *         in: path
     *         description: The ID of the plugin to be downloaded.
     *         required: true
     *         schema:
     *           type: string
     *       - name: arch
     *         in: path
     *         description: The architecture for which the plugin is requested.
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Successful response with the plugin file download.
     *         content:
     *           application/octet-stream:
     *             schema:
     *               type: string
     *               format: binary
     *       '400':
     *         description: Bad request - When the 'id' or 'arch' parameter is missing.
     *       '404':
     *         description: Not found - When the plugin file with the specified ID and architecture is not found.
     *       '500':
     *         description: Internal server error - Something went wrong on the server.
     *
     */

    // GET /download/:arch/:id
    this.router.get(
      '/download/:arch/:id',
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (req: Request, res: Response) => {
        try {
          if (req.params.id === undefined || req.params.arch === undefined) {
            res.status(StatusCodes.BAD_REQUEST).send();
            return;
          }
          const pluginFilePath = await this.pluginsManager.getPluginPath(
            req.params.id,
            req.params.arch
          );
          if (pluginFilePath === undefined) {
            res.status(StatusCodes.NOT_FOUND).send();
            return;
          }
          fs.access(pluginFilePath, fs.constants.F_OK, err => {
            if (err != null) {
              res.status(StatusCodes.NOT_FOUND);
            } else {
              res
                .status(StatusCodes.OK)
                .download(pluginFilePath, `${req.params.id}.jpl`);
            }
          });
          return;
        } catch (e) {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
        }
      }
    );

    /**
     * @swagger
     *
     * /icons/{id}:
     *   get:
     *     summary: Get the icon for a plugin with a given ID and architecture
     *     description: Returns the icon for a plugin with a given ID and architecture.
     *     tags: [Example, Time]
     *     parameters:
     *       - name: id
     *         in: path
     *         description: The ID of the plugin to get the icon for.
     *         required: true
     *         schema:
     *           type: string
     *       - name: arch
     *         in: query
     *         description: The architecture for which the plugin icon is requested.
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Successful response with the plugin icon image.
     *         content:
     *           image/svg+xml:
     *             schema:
     *               type: string
     *               format: binary
     *       '400':
     *         description: Bad request - When the 'id' or 'arch' parameter is missing.
     *       '404':
     *         description: Not found - When the plugin icon with the specified ID and architecture is not found.
     *       '500':
     *         description: Internal server error - Something went wrong on the server.
     */

    // GET /icons/:id?arch=:arch
    // eslint-disable-next-line
    this.router.get('/icons/:id', async (req: Request, res: Response) => {
      try {
        if (req.params.id === undefined || req.query.arch === undefined) {
          res.status(StatusCodes.BAD_REQUEST).send();
          return;
        }
        const icon = await this.iconsManager.getImage(
          req.params.id,
          req.query.arch as string
        );
        res
          .setHeader('Content-Type', icon.type)
          .status(StatusCodes.OK)
          .send(icon.content);
      } catch (e) {
        if (e instanceof NotFoundException) {
          res.status(StatusCodes.NOT_FOUND).send();
          return;
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
      }
    });

    /**
     * @swagger
     *
     * /versions:
     *   get:
     *     summary: Get the versions of a plugin for a given architecture
     *     description: Returns the versions of a plugin for a given architecture.
     *     tags: [Example, Time]
     *     parameters:
     *       - name: arch
     *         in: query
     *         description: The architecture for which plugin versions are requested.
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Successful response with the plugin versions.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: string
     *       '400':
     *         description: Bad request - When the 'arch' parameter is missing.
     *       '404':
     *         description: Not found - When no plugin versions are available for the specified architecture.
     *       '500':
     *         description: Internal server error - Something went wrong on the server.
     */

    // GET /versions/:id?arch=:arch
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.router.get('/versions/:id', async (req: Request, res: Response) => {
      try {
        if (req.query.arch === undefined) {
          res.status(StatusCodes.BAD_REQUEST).send();
          return;
        }
        const versions = await this.pluginsManager.getVersions();
        res
          .status(
            versions.length === 0 ? StatusCodes.NOT_FOUND : StatusCodes.OK
          )
          .send(versions === undefined ? undefined : versions);
        return;
      } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
      }
    });
    /**
     * @swagger
     *
     * /backgrounds/{id}:
     *   get:
     *     summary: Get the background for a plugin with a given ID and architecture
     *     description: Returns the background for a plugin with a given ID and architecture.
     *     tags: [Example, Time]
     *     parameters:
     *       - name: arch
     *         in: query
     *         description: The architecture the given plugin.
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Successful response with the plugin's background.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: string
     *       '400':
     *          description: Bad request - When the 'arch' parameter is missing.
     *       '404':
     *         description: Not found - When no plugin's background is available for the specified plugin.
     *       '500':
     *         description: Internal server error - Something went wrong on the server.
     */
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.router.get('/backgrounds/:id', async (req: Request, res: Response) => {
      try {
        if (req.query.arch === undefined) {
          res.status(StatusCodes.BAD_REQUEST).send();
          return;
        }
        const background = await this.backgroundsManager.getImage(
          req.params.id,
          req.query.arch as string
        );
        res
          .setHeader('Content-Type', background.type)
          .status(StatusCodes.OK)
          .send(background.content);
        return;
      } catch (e) {
        if (e instanceof NotFoundException) {
          res.status(StatusCodes.NOT_FOUND).send();
          return;
        }
        res.status(StatusCodes.NOT_FOUND).send();
      }
    });
  }
}

export default Router;
