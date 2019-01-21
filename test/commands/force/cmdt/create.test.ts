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
  .it('runs hello:org --targetusername test@org.com', ctx => {
    expect(ctx.stdout).to.contain("'MyC__MDT' is not a valid api name for a custom metadata object." );
  })

})
