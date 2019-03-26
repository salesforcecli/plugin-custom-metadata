import { expect, test } from '@salesforce/command/lib/test';
import * as fs from 'fs';
import { promisify } from 'util';

const child_process = require('child_process');
const exec = promisify(child_process.exec);


describe('sfdx force:cmdt:record:insert', async () => {
  const fileDir = 'csv-upload';
  if (!fs.existsSync(fileDir)) {
  fs.mkdirSync(fileDir);
  }
  await fs.writeFile('csv-upload/countries.csv','Label,CountryCode__c,CountryName__c\nAustralia,AU,Australia\n',null,function(){});

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()

    .command(['force:cmdt:create', '--typename', 'Snapple', '--outputdir', 'csv-upload'])
    .command(['force:cmdt:field:create', '--fieldname', 'CountryCode', '--fieldtype', 'Text','--outputdir', 'csv-upload/Snapple__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'CountryName', '--fieldtype', 'Text','--outputdir', 'csv-upload/Snapple__mdt'])
    .command([
      'force:cmdt:record:insert',
      '--filepath', 'csv-upload/countries.csv',
      '--typename', 'Snapple__mdt',
      '--inputdir','csv-upload',
      '--outputdir','csv-upload/metadata'
    ])
    .it('runs force:cmdt:record:insert', ctx => {
      const fieldDirPath = 'csv-upload/metadata';
      const filePath = 'metadata/Snapple.Australia.md-meta.xml';
      const uxMessage = 'Created custom metadata type records from \'csv-upload/countries.csv\' at \'csv-upload/metadata\'.\n';

      expect(fs.existsSync(fieldDirPath)).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;
      expect(ctx.stdout).to.contain(uxMessage);


      exec(`rm -rf ${fileDir}`);
    });

    
});
