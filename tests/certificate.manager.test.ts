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
import { promises } from 'fs';
import Sinon, { createStubInstance, restore, stub } from 'sinon';
import { FileManagerService } from '../src/services/file.manager.service';
import { CertificateManager } from '../src/services/certificate.manager.service';

describe('Certificate manager service tests', function () {
    let fileManager: Sinon.SinonStubbedInstance<FileManagerService>;
    let certificateManager: CertificateManager;

    beforeEach(() => {
        process.env.DATA_DIRECTORY = '/path/to/plugins';
        fileManager = createStubInstance(FileManagerService);
        certificateManager = new CertificateManager(fileManager);
    });

    afterEach(() => {
        restore();
    });

    it('should return the issuer of the certificate', async () => {
        const path = '/path/to/certificates';
        const file = 'certificate.crt';
        const fakeCertificate = { CN: 'test' };
        const expectedIssuer = { CN: 'test' };

        stub(Object.getPrototypeOf(certificateManager), 'readCertificate').resolves(fakeCertificate);
        stub(certificateManager, 'parseDN').returns(expectedIssuer);

        const actual = await certificateManager.getIssuer(path, file);

        expect(actual).toEqual(expectedIssuer);
    });

    it('should return certificate', async () => {
        const path = '/path/to/certificates';
        const file = 'certificate.crt';
        const expectedCertificate = await promises.readFile(`${__dirname}/TestCertificate.crt`);
        const expectedSubject = 'CN=Test';

        fileManager.readArchive.resolves(expectedCertificate);

        const actual = await certificateManager['readCertificate'](path, file);

        expect(actual.subject).toEqual(expectedSubject);
    });

    it('should return CRL', async () => {
        const path = '/path/to/certificates';
        const file = 'ca.crl';
        const expectedCRL = 'test';
        fileManager.readFile.resolves(Buffer.from(expectedCRL, 'utf-8'));
        const crl = await certificateManager['readCRL'](path + '/' + file);
        expect(crl).toEqual(Buffer.from(expectedCRL, 'utf-8'));
    });

    it('should return sfl crl', async () => {
        const expectedCRL = 'test';
        fileManager.readFile.resolves(Buffer.from(expectedCRL, 'utf-8'));
        const crl = await certificateManager.getSflCrl();
        expect(crl).toEqual(Buffer.from(expectedCRL, 'utf-8'));
    });

    it('should return ca crl', async () => {
        const expectedCRL = 'test';
        fileManager.readFile.resolves(Buffer.from(expectedCRL, 'utf-8'));
        const crl = await certificateManager.getCaCrl();
        expect(crl).toEqual(Buffer.from(expectedCRL, 'utf-8'));
    });
    it('should parse the DN correctly', () => {
        const dn = 'CN=John Doe\nO=Acme Corp';

        const expected = {
            CN: 'John Doe',
            O: 'Acme Corp'
        };

        const actual = certificateManager.parseDN(dn);

        expect(actual).toEqual(expected);
    });
});