import { expect } from '@salesforce/command/lib/test';
import { FileWriter } from '../../src/lib/helpers/fileWriter';
import { core } from '@salesforce/command';
import * as fs from 'fs';

describe('FileWriter', () => {
    describe('writeTypeFile', () => {
        it('should create a directory and a file for custom metadata type', () => {
            const fileWriter = new FileWriter();
            const fileName = 'Candle';
            const fileContent = 'Wick';
            fileWriter.writeTypeFile(core.fs, fileName, fileContent);
            expect(fs.existsSync( `${fileName}__mdt`)).to.be.true;
            expect(fs.existsSync( `${fileName}__mdt/${fileName}__mdt.object-meta.xml`)).to.be.true;
            fs.readFile(`${fileName}__mdt/${fileName}__mdt.object-meta.xml`, { encoding: 'utf-8' }, function (err, data) {
                expect(data === fileContent).to.be.true;
            });
        });
        it('should create a directory and a file for custom metadata that is passed in with __mdt', () => {
            const fileWriter = new FileWriter();
            const fileName = 'Candle__mdt';
            const fileContent = 'Wick';
            fileWriter.writeTypeFile(core.fs, fileName, fileContent);
            expect(fs.existsSync(`${fileName}`)).to.be.true;
            expect(fs.existsSync(`${fileName}/${fileName}.object-meta.xml`)).to.be.true;
        });
        it('should convert an object name to a custom metadata name, i.e. name__c to name__mdt', () => {
            const fileWriter = new FileWriter();
            const fileName = 'Candle';
            const fileContent = 'Wick';
            fileWriter.writeTypeFile(core.fs, fileName + '__c', fileContent);
            expect(fs.existsSync(`${fileName}__mdt`)).to.be.true;
            expect(fs.existsSync(`${fileName}__mdt/${fileName}__mdt.object-meta.xml`)).to.be.true;
        });

    });
    describe('writeFieldFile', () => {
        it('should create a directory and a file for custom metadata field', () => {
            const fileWriter = new FileWriter();
            const fileName = 'Candle';
            const fileContent = 'Wick';
            fileWriter.writeFieldFile(core.fs, fileName, fileContent);
            expect(fs.existsSync('fields')).to.be.true;
            expect(fs.existsSync(`fields/${fileName}__c.field-meta.xml`)).to.be.true;
            fs.readFile(`${fileName}__mdt/${fileName}__mdt.object-meta.xml`, { encoding: 'utf-8' }, function (err, data) {
                expect(data === fileContent).to.be.true;
            });
        });
        it('should create a directory and a file for custom metadata field that is passed in with __c', () => {
            const fileWriter = new FileWriter();
            const fileName = 'Candle__c';
            const fileContent = 'Wick';
            fileWriter.writeFieldFile(core.fs, fileName, fileContent);
            expect(fs.existsSync('fields')).to.be.true;
            expect(fs.existsSync(`fields/${fileName}.field-meta.xml`)).to.be.true;
        });

    });

});
