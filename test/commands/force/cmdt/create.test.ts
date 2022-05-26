/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@salesforce/command/lib/test';

describe('sfdx force:cmdt:create', () => {
  const cmdtName = 'MyCMDT';
  const mdtFolder = `${cmdtName}__mdt`;
  const mdtObject = path.join(mdtFolder, `${cmdtName}__mdt.object-meta.xml`);
  test
    .finally(() => {
      fs.rmSync('sample', { recursive: true });
    })
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .command(['force:cmdt:create', '--typename', cmdtName, '--outputdir', 'sample'])
    .it('runs force:cmdt:create --typename MyCMDT --outputdir sample', (ctx) => {
      const sampleFolder = path.join('sample', mdtFolder);
      const sampleObjectPath = path.join('sample', mdtObject);
      expect(fs.existsSync(sampleFolder)).to.be.true;
      expect(fs.existsSync(sampleObjectPath)).to.be.true;
      fs.readFile(sampleObjectPath, { encoding: 'utf-8' }, function (err, xml) {
        expect(xml).to.include('<label>MyCMDT</label>');
        expect(xml).to.include('<pluralLabel>MyCMDT</pluralLabel>');
        expect(xml).to.include('<visibility>Public</visibility>');
      });
    });

  test
    .finally(() => {
      fs.rmSync(mdtFolder, { recursive: true });
    })
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .command(['force:cmdt:create', '--typename', cmdtName])
    .it('runs force:cmdt:create --typename MyCMDT', (ctx) => {
      expect(fs.existsSync(mdtFolder)).to.be.true;
      expect(fs.existsSync(mdtObject)).to.be.true;
    });

  test
    .finally(() => {
      fs.rmSync(mdtFolder, { recursive: true });
    })
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .command(['force:cmdt:create', '--typename', cmdtName, '--visibility', 'PackageProtected'])
    .it('runs force:cmdt:create --typename MyCMDT --visibility PackageProtected', (ctx) => {
      expect(fs.existsSync(mdtFolder)).to.be.true;
      expect(fs.existsSync(mdtObject)).to.be.true;
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .command(['force:cmdt:create', '--typename', 'MyC___MDT'])
    .it('runs force:cmdt:create --typename MyC___MDT', (ctx) => {
      expect(ctx.stderr).to.contain(
        "'MyC___MDT' is not a valid API name for a custom metadata type. Metadata names can contain only underscores and alphanumeric characters, must begin with a letter, cannot end with an underscore, and cannot contain two consecutive underscore characters."
      );
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .command([
      'force:cmdt:create',
      '--typename',
      'MyC',
      '--label',
      'Label is more than the 40 characters that are allowed',
    ])
    .it(
      'runs force:cmdt:create --typename MyC__MDT --label "Label is more than the 40 characters that are allowed"',
      (ctx) => {
        expect(ctx.stderr).to.contain(
          "'Label is more than the 40 characters that are allowed' is too long to be a label. The maximum length of the label is 40 characters."
        );
      }
    );

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .command([
      'force:cmdt:create',
      '--typename',
      'MyC',
      '--plurallabel',
      'More Than 40 characters in this plural label name',
    ])
    .it(
      'runs force:cmdt:create --typename MyC__MDT --plurallabel "More Than 40 characters in this plural label name"',
      (ctx) => {
        expect(ctx.stderr).to.contain(
          "'More Than 40 characters in this plural label name' is too long to be a plural label. The maximum length of the plural label is 40 characters."
        );
      }
    );

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .command(['force:cmdt:create', '--typename', 'MyC', '--visibility', 'Invalid'])
    .it('runs force:cmdt:create --typename MyC__MDT --visibility "Invalid"', (ctx) => {
      expect(ctx.stderr).to.contain('Expected --visibility=Invalid to be one of: PackageProtected, Protected, Public');
    });
});
