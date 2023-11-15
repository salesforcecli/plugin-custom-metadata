/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Messages } from '@salesforce/core';
import { expect, config } from 'chai';
import { TestSession, execCmd } from '@salesforce/cli-plugins-testkit';

Messages.importMessagesDirectory(path.dirname(fileURLToPath(import.meta.url)));
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'records');

config.truncateThreshold = 0;
let session: TestSession;
let projDir: string;

describe('force:cmdt:record:insert', () => {
  before(async () => {
    session = await TestSession.create({
      project: {
        name: 'cmdtRecordInsert',
      },
      devhubAuthStrategy: 'NONE',
    });
    projDir = session.project?.dir ?? '';
  });

  after(async () => {
    await session.zip(undefined, 'artifacts');
    await session.clean();
  });

  // Transforms on the recordname are to match the behavior of adding a new Custom Metadata Type record in the UI
  // - replace all non-alphanumeric characters with _
  // - prepend an X if the first character is a number
  // - replace multiple underscores with single underscore
  // - remove trailing underscore (if any)
  describe('record name transform', () => {
    before(() => {
      const fileDir = path.join(projDir, 'csv-upload');
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir);
      }
      fs.writeFileSync(path.join(fileDir, 'name-transform.csv'), 'MainLabel\n7test(this) #cmdt-\n');
    });

    it('runs force:cmdt:record:insert', () => {
      const fieldDirPath = path.join(projDir, 'csv-upload', 'metadata');
      const outputDir = path.join('csv-upload', 'Test__mdt');
      execCmd('force:cmdt:create --typename Test --outputdir csv-upload', { ensureExitCode: 0 });
      execCmd(`force:cmdt:field:create --fieldname MainLabel --fieldtype Text --outputdir ${outputDir}`, {
        ensureExitCode: 0,
      });
      const result = execCmd(
        `force:cmdt:record:insert --filepath ${path.join(
          'csv-upload',
          'name-transform.csv'
        )} --typename Test__mdt --namecolumn MainLabel --inputdir csv-upload --outputdir ${path.join(
          'csv-upload',
          'metadata'
        )}`,
        { ensureExitCode: 0 }
      );

      // Here is the new name after transform
      const filePath = path.join(fieldDirPath, 'Test.X7test_this_cmdt.md-meta.xml');
      const uxMessage = messages.getMessage('successResponse', [
        path.join('csv-upload', 'name-transform.csv'),
        path.join('csv-upload', 'metadata'),
      ]);
      expect(fs.existsSync(fieldDirPath), fieldDirPath).to.be.true;
      expect(fs.existsSync(filePath), filePath).to.be.true;
      expect(result.shellOutput.stdout).to.contain(uxMessage);
    });
  });

  describe('good csv', () => {
    before(() => {
      const fileDir = path.join(projDir, 'csv-upload');
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir);
      }
      fs.writeFileSync(
        path.join(fileDir, 'countries.csv'),
        'Name,CountryCode__c,CountryName__c\nAustralia,AU,Australia\n'
      );
    });

    it('runs force:cmdt:record:insert', () => {
      const fieldDirPath = path.join(projDir, 'csv-upload', 'metadata');
      const outputDir = path.join('csv-upload', 'Snapple__mdt');
      execCmd('force:cmdt:create --typename Snapple --outputdir csv-upload', { ensureExitCode: 0 });
      execCmd(`force:cmdt:field:create --fieldname CountryCode --fieldtype Text --outputdir ${outputDir}`, {
        ensureExitCode: 0,
      });
      execCmd(`force:cmdt:field:create --fieldname CountryName --fieldtype Text --outputdir ${outputDir}`, {
        ensureExitCode: 0,
      });
      const result = execCmd(
        `force:cmdt:record:insert --filepath ${path.join(
          'csv-upload',
          'countries.csv'
        )} --typename Snapple__mdt --inputdir csv-upload --outputdir ${path.join('csv-upload', 'metadata')}`,
        { ensureExitCode: 0 }
      );

      const filePath = path.join(fieldDirPath, 'Snapple.Australia.md-meta.xml');
      const uxMessage = messages.getMessage('successResponse', [
        path.join('csv-upload', 'countries.csv'),
        path.join('csv-upload', 'metadata'),
      ]);
      expect(fs.existsSync(fieldDirPath), fieldDirPath).to.be.true;
      expect(fs.existsSync(filePath), filePath).to.be.true;
      expect(result.shellOutput.stdout).to.contain(uxMessage);
    });
  });

  describe('bad csv', () => {
    const badCsvPathRelative = path.join('badCSV', 'countries.csv');

    beforeEach(() => {
      const secondTest = path.join(projDir, 'badCSV');
      const badCsvPath = path.join(secondTest, 'countries.csv');
      if (!fs.existsSync(secondTest)) {
        fs.mkdirSync(secondTest);
      }
      fs.writeFileSync(badCsvPath, 'Label,CountryCode__c,CountryName__c\nAustralia,AU,Australia\n');
    });

    it('fails force:cmdt:record:insert', () => {
      const result = execCmd(
        `force:cmdt:record:insert --filepath ${badCsvPathRelative} --typename Snapple__mdt --inputdir badCSV --outputdir ${path.join(
          'badCSV',
          'metadata'
        )} --namecolumn Label`,
        { ensureExitCode: 1 }
      );
      expect(
        /.*?no such file or directory, scandir.*?badCSV.*?Snapple__mdt.*?fields.*/g.test(result.shellOutput.stderr)
      ).to.be.equal(true);
    });

    it('fails force:cmdt:record:insert', () => {
      execCmd('force:cmdt:create --typename Snapple --outputdir badCSV');
      execCmd(
        `force:cmdt:field:create --fieldname CountryCode --fieldtype Text --outputdir ${path.join(
          'badCSV',
          'Snapple__mdt'
        )}`
      );
      const result = execCmd(
        `force:cmdt:record:insert --filepath ${badCsvPathRelative} --typename Snapple__mdt --inputdir badCSV --outputdir ${path.join(
          'badCSV',
          'metadata'
        )} --namecolumn Label`,
        { ensureExitCode: 1 }
      );
      const uxMessage = 'The column CountryName__c is not found on the custom metadata type Snapple';
      expect(result.shellOutput.stderr).to.contain(uxMessage);
    });

    it('fails force:cmdt:record:insert', () => {
      const result = execCmd(
        `force:cmdt:record:insert --filepath ${badCsvPathRelative} --typename Snape__mdt --inputdir csv-upload --outputdir ${path.join(
          'csv-upload',
          'metadata'
        )}`,
        { ensureExitCode: 1 }
      );
      expect(
        /.*?no such file or directory, scandir.*?csv-upload.*?Snape__mdt.*?fields.*/g.test(result.shellOutput.stderr)
      ).to.be.equal(true);
    });
  });
});
