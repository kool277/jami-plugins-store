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

import {PluginsManager} from '../services/plugins_manager.service';
import {type Request, type Response, Router} from 'express';
import fs from 'fs';
import {Service} from 'typedi';
import {StatusCodes} from 'http-status-codes';

@Service()
export class PluginsController {
  router = Router();

  constructor(private readonly pluginsManager: PluginsManager) {
    this.configureRouter();
  }

  /**
   * @swagger
   *
   * /plugins:arch:
   *   get:
   *     description: Returns the plugins for a given architecture
   *     tags:
   *       - Example
   *       - Time
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         schema:
   *           $ref: '#/definitions/Message'
   */
  private configureRouter(): void {
    // GET /plugins
    if (this.router === undefined) {
      this.router = Router();
    }
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const arch: string = req.query.arch as string;
        if (arch === undefined) {
          res.status(StatusCodes.BAD_REQUEST).send();
          return;
        }
        const plugins = await this.pluginsManager.getPlugins(arch);
        res.status(StatusCodes.OK).send(plugins);
      } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
      }
    });

    // GET /details/:id?arch=:arch
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.router.get('/details/:id', async (req: Request, res: Response) => {
      try {
        const pluginId: string = req.params.id;
        const arch: string = req.query.arch as string;
        if (pluginId === undefined || arch === undefined) {
          res.status(StatusCodes.BAD_REQUEST).send();
          return;
        }
        const plugin = await this.pluginsManager.getPlugin(pluginId);
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

    // GET /download/:arch/:id
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
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

    // GET /icon/:id?arch=:arch
    // eslint-disable-next-line
    this.router.get('/icons/:id', async (req: Request, res: Response) => {
      try {
        if (req.params.id === undefined || req.query.arch === undefined) {
          res.status(StatusCodes.BAD_REQUEST).send();
          return;
        }
        const icon = await this.pluginsManager.getIcon(
          req.params.id,
          req.query.arch as string
        );
        if (icon === '') {
          console.log('sending not found ' + icon);
          res.status(StatusCodes.NOT_FOUND).send();
          return;
        }
        res.status(StatusCodes.OK).send(icon);
      } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
      }
    });

    // GET /versions/:id?arch=:arch
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.router.get('/versions/', async (req: Request, res: Response) => {
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
  }
}

export default Router;
