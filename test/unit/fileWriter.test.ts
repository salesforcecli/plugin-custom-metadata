/*
 * Copyright (c) 2018-2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from '@salesforce/command/lib/test';
import { FileWriter } from '../../src/lib/helpers/fileWriter';
import * as fs from 'fs';
import { promisify } from 'util';
const child_process = require('child_process');

const exec = promisify(child_process.exec);

describe('FileWriter', () => {

    describe('writeTypeFile', () => {
        it('should create a directory and a file for custom metadata type', async () => {
            const fileWriter = new FileWriter();
            const fileName = 'Candle';
            const fileContent = 'Wick';
            await fileWriter.writeTypeFile(fs, '', fileName, fileContent);
            expect(fs.existsSync(`${fileName}__mdt`)).to.be.true;
            expect(fs.existsSync(`${fileName}__mdt/${fileName}__mdt.object-meta.xml`)).to.be.true;
            fs.readFile(`${fileName}__mdt/${fileName}__mdt.object-meta.xml`, { encoding: 'utf-8' }, function (err, data) {
                expect(data === fileContent).to.be.true;
            });
            await exec(`rm -rf ${fileName}__mdt`);
        });
        it('should create a directory and a file for custom metadata that is passed in with __mdt', async () => {
            const fileWriter = new FileWriter();
            const fileName = 'Torch__mdt';
            const fileContent = 'rag';
            await fileWriter.writeTypeFile(fs, '', fileName, fileContent);
            expect(fs.existsSync(`${fileName}`)).to.be.true;
            expect(fs.existsSync(`${fileName}/${fileName}.object-meta.xml`)).to.be.true;
            await exec(`rm -rf ${fileName}`);
        });
        it('should convert an object name to a custom metadata name, i.e. name__c to name__mdt', async () => {
            const fileWriter = new FileWriter();
            const fileName = 'Lantern';
            const apiName = `${fileName}__c`;
            const fileContent = 'oil';
            await fileWriter.writeTypeFile(fs, '', apiName, fileContent);
            expect(fs.existsSync(`${fileName}__mdt`)).to.be.true;
            expect(fs.existsSync(`${fileName}__mdt/${fileName}__mdt.object-meta.xml`)).to.be.true;
            await exec(`rm -rf ${fileName}__mdt`);
        });
        it('should convert an object name to a custom metadata name, i.e. name__c to name__mdt', async () => {
            const fileWriter = new FileWriter();
            const fileName = 'Lantern';
            const apiName = `${fileName}__c`;
            const fileContent = 'oil';
            await fileWriter.writeTypeFile(fs, 'sampledir/', apiName, fileContent);
            expect(fs.existsSync(`sampledir/${fileName}__mdt`)).to.be.true;
            expect(fs.existsSync(`sampledir/${fileName}__mdt/${fileName}__mdt.object-meta.xml`)).to.be.true;
            await exec(`rm -rf sampledir`);
        });

    });
    describe('writeFieldFile', () => {
        it('should create a directory and a file for custom metadata field', async () => {
            const fileWriter = new FileWriter();
            const fileName = 'Candle';
            const fileContent = 'Wick';
            await fileWriter.writeFieldFile(fs, '', fileName, fileContent);
            expect(fs.existsSync('fields')).to.be.true;
            expect(fs.existsSync(`fields/${fileName}__c.field-meta.xml`)).to.be.true;
            fs.readFile(`fields/${fileName}__c.field-meta.xml`, { encoding: 'utf-8' }, function (err, data) {
                expect(data === fileContent).to.be.true;
            });
            exec(`rm -rf fields`);
        });
        it('should create a directory and a file for custom metadata field that is passed in with __c', async () => {
            const fileWriter = new FileWriter();
            const fileName = 'Lantern__c';
            const fileContent = 'Oil';
            await fileWriter.writeFieldFile(fs, 'fieldFolder', fileName, fileContent);
            expect(fs.existsSync('fieldFolder/fields')).to.be.true;
            expect(fs.existsSync(`fieldFolder/fields/${fileName}.field-meta.xml`)).to.be.true;
            exec(`rm -rf fieldFolder`);

        });

    });

});
