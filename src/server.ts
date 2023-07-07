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
import {Application} from './app';
import * as http from 'http';
import {type AddressInfo} from 'net';
import {Service} from 'typedi';

@Service()
export class Server {
  private static readonly appPort: string | number | boolean =
    Server.normalizePort('3000');

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  private static readonly baseDix: number = 10;
  private server: http.Server | undefined;

  constructor(private readonly application: Application) {}

  private static normalizePort(
    val: number | string
  ): number | string | boolean {
    const port: number =
      typeof val === 'string' ? parseInt(val, this.baseDix) : val;
    if (isNaN(port)) {
      return val;
    } else if (port >= 0) {
      return port;
    } else {
      return false;
    }
  }

  init(): void {
    this.application.app.set('port', Server.appPort);

    this.server = http.createServer(this.application.app);

    this.server.listen(Server.appPort);
    this.server.on('error', (error: NodeJS.ErrnoException) => {
      this.onError(error);
    });
    this.server.on('listening', () => {
      this.onListening();
    });
  }

  private onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const bind: string =
      typeof Server.appPort === 'string'
        ? 'Pipe ' + Server.appPort
        : 'Port ' + String(Server.appPort);
    switch (error.code) {
      case 'EACCES':
        // eslint-disable-next-line no-console
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
      // process exit kills the server, break is useless
      // eslint-disable-next-line no-fallthrough
      case 'EADDRINUSE':
        // eslint-disable-next-line no-console
        console.error(`${bind} is already in use`);
        process.exit(1);
      // eslint-disable-next-line no-fallthrough
      default:
        throw error;
    }
  }

  /**
   * Se produit lorsque le serveur se met à écouter sur le port.
   */
  private onListening(): void {
    if (this.server === undefined) {
      return;
    }
    const addr = this.server.address() as AddressInfo;
    const bind: string =
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Listening on ${bind}`);
  }
}
