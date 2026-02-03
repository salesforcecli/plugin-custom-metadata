/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from 'node:fs';
import path from 'node:path';
import { expect } from 'chai';
import { TestSession, execCmd } from '@salesforce/cli-plugins-testkit';

let session: TestSession;
let projDir: string;

describe('force:cmdt:create', () => {
  before(async () => {
    session = await TestSession.create({
      project: {
        name: 'CreateCMDT',
      },
      devhubAuthStrategy: 'NONE',
    });
    projDir = session.project?.dir ?? '';
  });

  after(async () => {
    await session.zip(undefined, 'artifacts');
    await session.clean();
  });

  const getFolderName = (name: string) => `${name}__mdt`;
  const getObjectName = (name: string) => path.join(getFolderName(name), `${name}__mdt.object-meta.xml`);

  describe('successes', () => {
    it('runs force:cmdt:create --typename MyCMDT --outputdir sample', async () => {
      const typeName = 'MyCMDT';
      execCmd(`force:cmdt:create --typename ${typeName} --outputdir sample`, { ensureExitCode: 0 });
      const sampleFolder = path.join(projDir, 'sample', getFolderName(typeName));
      const sampleObjectPath = path.join(projDir, 'sample', getObjectName(typeName));
      expect(fs.existsSync(sampleFolder)).to.be.true;
      expect(fs.existsSync(sampleObjectPath)).to.be.true;
      const xml = await fs.promises.readFile(sampleObjectPath, { encoding: 'utf-8' });
      expect(xml).to.include('<label>MyCMDT</label>');
      expect(xml).to.include('<pluralLabel>MyCMDT</pluralLabel>');
      expect(xml).to.include('<visibility>Public</visibility>');
    });

    it('runs force:cmdt:create --typename MyCMDT2', () => {
      const typeName = 'MyCMDT2';

      execCmd(`force:cmdt:create --typename ${typeName}`, { ensureExitCode: 0 });
      expect(fs.existsSync(path.join(projDir, getFolderName(typeName)))).to.be.true;
      expect(fs.existsSync(path.join(projDir, getObjectName(typeName)))).to.be.true;
    });

    it('runs force:cmdt:create --typename MyCMDT --visibility PackageProtected', () => {
      const typeName = 'MyCMDT3';
      execCmd(`force:cmdt:create --typename ${typeName} --visibility PackageProtected`, { ensureExitCode: 0 });
      expect(fs.existsSync(path.join(projDir, getFolderName(typeName)))).to.be.true;
      expect(fs.existsSync(path.join(projDir, getObjectName(typeName)))).to.be.true;
    });
  });

  describe('failures', () => {
    it('runs force:cmdt:create --typename MyC___MDT', () => {
      const result = execCmd('force:cmdt:create --typename MyC___MDT', { ensureExitCode: 'nonZero' });
      expect(result.shellOutput.stderr).to.contain(
        "'MyC___MDT' is not a valid API name for a custom metadata type. Metadata names can contain only underscores and alphanumeric characters, must begin with a letter, cannot end with an underscore, and cannot contain two consecutive underscore characters."
      );
    });

    it('runs force:cmdt:create --typename MyC__MDT --label "Label is more than the 40 characters that are allowed"', () => {
      const result = execCmd(
        'force:cmdt:create --typename MyC__MDT --label "Label is more than the 40 characters that are allowed"',
        { ensureExitCode: 'nonZero' }
      );

      expect(result.shellOutput.stderr).to.contain(
        "'Label is more than the 40 characters that are allowed' is too long to be a label. The maximum length of the label is 40 characters."
      );
    });

    it('runs force:cmdt:create --typename MyC__MDT --plurallabel "More Than 40 characters in this plural label name"', () => {
      const result = execCmd(
        'force:cmdt:create --typename MyC__MDT --plurallabel "More Than 40 characters in this plural label name"',
        { ensureExitCode: 'nonZero' }
      );
      expect(result.shellOutput.stderr).to.contain(
        "'More Than 40 characters in this plural label name' is too long to be a plural label. The maximum length of the plural label is 40 characters."
      );
    });

    it('runs force:cmdt:create --typename MyC__MDT --visibility "Invalid"', () => {
      const result = execCmd('force:cmdt:create --typename MyC --visibility Invalid', { ensureExitCode: 'nonZero' });
      expect(result.shellOutput.stderr).to.contain(
        'Expected --visibility=Invalid to be one of: PackageProtected, Protected, Public'
      );
    });
  });
});
