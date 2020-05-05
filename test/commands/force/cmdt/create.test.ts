import { expect, test } from '@salesforce/command/lib/test';
import * as fs from 'fs';

import { promisify } from 'util';
const child_process = require('child_process');

const exec = promisify(child_process.exec);


describe('sfdx force:cmdt:create', () => {


  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()
    .command(['force:cmdt:create', '--typename', 'MyCMDT', '--outputdir', 'sample'])
    .it('runs force:cmdt:create --typename MyCMDT --outputdir sample', ctx => {
      const cmdtName = 'MyCMDT';
      expect(fs.existsSync(`sample/${cmdtName}__mdt`)).to.be.true;
      expect(fs.existsSync(`sample/${cmdtName}__mdt/${cmdtName}__mdt.object-meta.xml`)).to.be.true;
      fs.readFile(`sample/${cmdtName}__mdt/${cmdtName}__mdt.object-meta.xml`, { encoding: 'utf-8' }, function (err, xml) {
        expect(xml.includes(`<label>MyCMDT</label>`)).to.be.true;
        expect(xml.includes(`<pluralLabel>MyCMDT</pluralLabel>`)).to.be.true;
        expect(xml.includes(`<visibility>Public</visibility>`)).to.be.true;
      });
      exec(`rm -rf sample`);
    })

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()
    .command(['force:cmdt:create', '--typename', 'MyCMDT'])
    .it('runs force:cmdt:create --typename MyCMDT', ctx => {
      const cmdtName = 'MyCMDT';
      expect(fs.existsSync(`${cmdtName}__mdt`)).to.be.true;
      expect(fs.existsSync(`${cmdtName}__mdt/${cmdtName}__mdt.object-meta.xml`)).to.be.true;
      exec(`rm -rf ${cmdtName}__mdt`);
    })

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()
    .command(['force:cmdt:create', '--typename', 'MyCMDT', '--visibility', 'PackageProtected'])
    .it('runs force:cmdt:create --typename MyCMDT --visibility PackageProtected', ctx => {
      const cmdtName = 'MyCMDT';
      expect(fs.existsSync(`${cmdtName}__mdt`)).to.be.true;
      expect(fs.existsSync(`${cmdtName}__mdt/${cmdtName}__mdt.object-meta.xml`)).to.be.true;
      exec(`rm -rf ${cmdtName}__mdt`);
    })

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .withProject()
    .command(['force:cmdt:create', '--typename', 'MyC__MDT'])
    .it('runs force:cmdt:create --typename MyC__MDT', ctx => {
      expect(ctx.stderr).to.contain("'MyC__MDT' is not a valid API name for a custom metadata type. Metadata names can contain only underscores and alphanumeric characters, must begin with a letter, cannot end with an underscore, and cannot contain two consecutive underscore characters.");
    })

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .withProject()
    .command(['force:cmdt:create', '--typename', 'MyC', '--label', 'Label is more than the 40 characters that are allowed'])
    .it('runs force:cmdt:create --typename MyC__MDT --label "Label is more than the 40 characters that are allowed"', ctx => {
      expect(ctx.stderr).to.contain("'Label is more than the 40 characters that are allowed' is too long to be a label. The maximum length of the label is 40 characters.");
    })

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .withProject()
    .command(['force:cmdt:create', '--typename', 'MyC', '--plurallabel', 'More Than 40 characters in this plural label name'])
    .it('runs force:cmdt:create --typename MyC__MDT --plurallabel "More Than 40 characters in this plural label name"', ctx => {
      expect(ctx.stderr).to.contain("'More Than 40 characters in this plural label name' is too long to be a plural label. The maximum length of the plural label is 40 characters.");
    })

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .withProject()
    .command(['force:cmdt:create', '--typename', 'MyC', '--visibility', 'Invalid'])
    .it('runs force:cmdt:create --typename MyC__MDT --visibility "Invalid"', ctx => {
      expect(ctx.stderr).to.contain("Expected --visibility=Invalid to be one of: PackageProtected, Protected, Public");
    })
})
