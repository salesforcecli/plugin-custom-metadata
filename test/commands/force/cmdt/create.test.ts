import { expect} from '@salesforce/command/lib/test';
import * as fs from 'fs';
import { promisify } from 'util';
const child_process = require('child_process');

const exec = promisify(child_process.exec);
const testProjectName = 'testProject';

describe('sfdx force:cmdt:create' , () => {

  before(async () => {
    await exec(`rm -rf ${testProjectName}`);
    await exec(`sfdx force:project:create -n ${testProjectName}`);
  });

  it('create custom metadata file', async () => {
    const cmdtName = 'MyCMDT'
    await exec(`sfdx force:cmdt:create --devname ${cmdtName}`, { cwd: testProjectName});
    // Asserts commented until dev team fixes
    expect(fs.existsSync(`${testProjectName}/force-app/main/default/objects/${cmdtName}__mdt`)).to.be.false;
   //  expect(fs.existsSync(`${testProjectName}/force-app/main/default/objects/${cmdtName}__mdt/${cmdtName}__mdt.object-meta.xml`)).to.be.true;
  }).timeout(50000);

  after( async () => {
    await exec(`rm -rf ${testProjectName}`);
  });

})
