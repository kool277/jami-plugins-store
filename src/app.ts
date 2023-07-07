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
import cors from 'cors';
import express, {type NextFunction} from 'express';
import {Service} from 'typedi';
import {PluginsController} from './controllers/plugins.controller';
import swaggerJSDoc = require('swagger-jsdoc');
import * as swaggerUi from 'swagger-ui-express';

@Service()
export class Application {
  app: express.Application;
  private readonly swaggerOptions: swaggerJSDoc.Options;

  constructor(private readonly pluginsController: PluginsController) {
    this.app = express();

    this.swaggerOptions = {
      swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'Swagger API documentation',
          version: '1.0.0',
        },
      },
      apis: ['**/*.ts'],
    };

    this.config();
    this.bindRoutes();
  }

  bindRoutes(): void {
    this.app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerJSDoc(this.swaggerOptions))
    );
    this.app.all('*', (req: express.Request, _, next: NextFunction) => {
      console.log(`[${req.method}] ${req.originalUrl}`);
      next();
    });
    this.app.use('/', this.pluginsController.router);
  }

  private config(): void {
    // Middlewares configuration
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: true}));
    this.app.use(cors());
  }
}
