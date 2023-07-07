"""
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
"""
import os
import argparse

def create_plugins_environment(jpl_path: str, arch: str) -> None:
    data_path = os.path.dirname(os.path.abspath(__file__)) + '/data'
    if not os.path.isdir(data_path):
        os.mkdir(data_path)
    jplName = os.path.splitext(os.path.basename(jpl_path))[0]
    if not os.path.isdir(f'{data_path}/{jplName}'):
        os.mkdir(f'{data_path}/{jplName}')
    if not os.path.isdir(f'{data_path}/{jplName}/{arch}'):
        os.mkdir(f'{data_path}/{jplName}/{arch}')
    os.system(f'cp {jpl_path} {data_path}/{jplName}/{arch}/')
    return None


def parser() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Add a new plugin to the dev environment')
    parser.add_argument('--plugin',
                            required=True,
                            help='Specified if it\'s a plugin path.',
                            type=str,
                        )
    parser.add_argument('--arch',
                            required=True,
                            help='Specified the architecture of the plugin.',
                            type=str,
                        )
    return parser.parse_args()

if __name__ == '__main__':
    parsed_args = parser()
    if parsed_args.plugin is None or parsed_args.arch is None:
        raise Exception('You must specify the plugin path and the architecture of the plugin')
    create_plugins_environment(parsed_args.plugin, parsed_args.arch)
