import { expect,test } from '@salesforce/command/lib/test';
import * as fs from 'fs';

import { promisify } from 'util';
const child_process = require('child_process');

const exec = promisify(child_process.exec);


describe('sfdx force:cmdt:create' , () => {


  test
  .withOrg({ username: 'test@org.com' }, true)
  .stdout()
  .withProject()
  .command(['force:cmdt:create', '--devname', 'MyCMDT','--outputdir','sample'])
  .it('runs force:cmdt:create --devname MyCMDT --outputdir test', ctx => {
    const cmdtName = 'MyCMDT';
    expect(fs.existsSync(`sample/${cmdtName}__mdt`)).to.be.true;
    expect(fs.existsSync(`sample/${cmdtName}__mdt/${cmdtName}__mdt.object-meta.xml`)).to.be.true;
    exec(`rm -rf sample`);
  })

  test
  .withOrg({ username: 'test@org.com' }, true)
  .stdout()
  .withProject()
  .command(['force:cmdt:create', '--devname', 'MyCMDT'])
  .it('runs force:cmdt:create --devname MyCMDT', ctx => {
    const cmdtName = 'MyCMDT';
    expect(fs.existsSync(`${cmdtName}__mdt`)).to.be.true;
    expect(fs.existsSync(`${cmdtName}__mdt/${cmdtName}__mdt.object-meta.xml`)).to.be.true;
    exec(`rm -rf ${cmdtName}__mdt`);
  })


  test
  .withOrg({ username: 'test@org.com' }, true)
  .stdout()
  .withProject()
  .command(['force:cmdt:create', '--devname', 'MyC__MDT'])
  .it('runs force:cmdt:create --devname MyC__MDT', ctx => {
    expect(ctx.stdout).to.contain("'MyC__MDT' is not a valid api name for a custom metadata object." );
  })

  test
  .withOrg({ username: 'test@org.com' }, true)
  .stdout()
  .withProject()
  .command(['force:cmdt:create', '--devname', 'MyC', '--label', 'Label is more than the 40 characters that are allowed'])
  .it('runs force:cmdt:create --devname MyC__MDT --label "Label is more than the 40 characters that are allowed"', ctx => {
    expect(ctx.stdout).to.contain("'Label is more than the 40 characters that are allowed' is not a valid label for a custom metadata object." );
  })

  test
  .withOrg({ username: 'test@org.com' }, true)
  .stdout()
  .withProject()
  .command(['force:cmdt:create', '--devname', 'MyC', '--plurallabel', 'More Than 40 characters in this plural label name'])
  .it('runs force:cmdt:create --devname MyC__MDT --plurallabel "More Than 40 characters in this plural label name"', ctx => {
    expect(ctx.stdout).to.contain("'More Than 40 characters in this plural label name' is not a valid plural label for a custom metadata object." );
  })


})
