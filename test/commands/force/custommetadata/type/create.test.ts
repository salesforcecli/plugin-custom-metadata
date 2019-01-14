import { expect} from '@salesforce/command/lib/test';
import * as fs from 'fs';
import { promisify } from 'util';
const child_process = require('child_process');

const exec = promisify(child_process.exec);
const testProjectName = 'testProject';

describe('sfdx force:custommetadata:type:create' , () => {

  before(async () => {
    await exec(`rm -rf ${testProjectName}`);
    await exec(`sfdx force:project:create -n ${testProjectName}`);
  });

  it('create custom metadata file', async () => {
    const cmdtName = 'MyCMDT'
    await exec(`sfdx force:custommetadata:type:create --devname ${cmdtName}`, { cwd: testProjectName});
    expect(fs.existsSync(`${testProjectName}/force-app/main/default/objects/${cmdtName}__mdt`)).to.be.true;
    expect(fs.existsSync(`${testProjectName}/force-app/main/default/objects/${cmdtName}__mdt/${cmdtName}__mdt.object-meta.xml`)).to.be.true;
  }).timeout(50000);

  after( async () => {
    await exec(`rm -rf ${testProjectName}`);
  });

})
