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
import express, {type Request, type Response, type NextFunction} from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const router = express.Router();
const dataPath = path.join(
  __dirname,
  '..',
  process.env.DATA_DIRECTORY ?? 'data'
);
const filePath = path.join(dataPath, 'data.json');

// GET /plugins
router.get('/', (req: Request, res: Response) => {
  res.sendFile(filePath);
});

// GET /details/:id
router.get(
  '/details/:id',
  (req: Request, res: Response, next: NextFunction) => {
    const pluginId: string = req.params.id;

    // Define plugin data
    fs.promises
      .readFile(filePath, 'utf-8')
      .then(data => {
        const plugins = JSON.parse(data) as Array<{id: string}>;

        const plugin = plugins.find(
          (plugin: {id: string}) => plugin.id === pluginId
        );

        if (plugin === undefined) {
          res.status(404).json({error: 'Plugin not found'});
        } else {
          res.json(plugin);
        }
      })
      .catch(err => {
        next(err);
      });
  }
);

// GET /download/:id
router.get(
  '/download/:id',
  (req: Request, res: Response, next: NextFunction) => {
    const plugin: string = req.params.id;
    // Construct the file path
    const pluginFilePath = path.join(dataPath, plugin);
    // Check if the file exists
    fs.access(pluginFilePath, fs.constants.F_OK, err => {
      if (err != null) {
        res.status(404).json({error: 'Plugin not found'});
        return;
      }

      // Set the header attachment filename
      const fileName = plugin;
      res.setHeader(
        'Content-disposition',
        `attachment; filename="${fileName}"`
      );

      // Download the plugin file
      res.download(pluginFilePath, fileName);
    });
  }
);

export default router;
