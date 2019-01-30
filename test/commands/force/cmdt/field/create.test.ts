import { expect,test } from '@salesforce/command/lib/test';
import * as fs from 'fs';

import { promisify } from 'util';
const child_process = require('child_process');

const exec = promisify(child_process.exec);


describe('sfdx force:cmdt:field:create' , () => {


  test
  .withOrg({ username: 'test@org.com' }, true)
  .stdout()
  .withProject()
  .command(['force:cmdt:field:create', '--fieldname', 'myField','--fieldtype','Text'])
  .it('runs force:cmdt:field:create --fieldname myField --fieldtype Text', ctx => {
    const cmdtName = 'myField';
    expect(fs.existsSync(`fields`)).to.be.true;
    expect(fs.existsSync(`fields/${cmdtName}__c.field-meta.xml`)).to.be.true;
    fs.readFile(`fields/${cmdtName}__c.field-meta.xml`, { encoding: 'utf-8' }, function (err, xml) {
      expect(xml.includes(`<fullName>myField__c</fullName>`)).to.be.true;
      expect(xml.includes(`<fieldManageability>DeveloperControlled</fieldManageability>`)).to.be.true;
      expect(xml.includes(`<label>myField</label>`)).to.be.true;
      expect(xml.includes(`<type>Text</type>`)).to.be.true;
      expect(xml.includes(`<unique>false</unique>`)).to.be.true;
      expect(xml.includes(`<length>100</length>`)).to.be.true;
    });
    exec(`rm -rf fields`);
  })

  test
  .withOrg({ username: 'test@org.com' }, true)
  .stderr()
  .withProject()
  .command(['force:cmdt:field:create', '--fieldname', 'myFi__eld','--fieldtype','Text'])
  .it('fails running force:cmdt:field:create --fieldname myFi__eld --fieldtype Text', ctx => {
    expect(ctx.stderr).to.contain('myFi__eld is an invalid field. Custom fields can only contain alphanumeric characters, must begin with a letter, cannot end with an underscore or contain two consecutive underscore characters.' );
  })

  test
  .withOrg({ username: 'test@org.com' }, true)
  .stderr()
  .withProject()
  .command(['force:cmdt:field:create', '--fieldname', 'myField','--fieldtype','Picklist'])
  .it('fails running force:cmdt:field:create --fieldname myField --fieldtype Picklist', ctx => {
    expect(ctx.stderr).to.contain('Picklist values are required when type is Picklist' );
  })

  test
  .withOrg({ username: 'test@org.com' }, true)
  .stdout()
  .withProject()
  .command(['force:cmdt:field:create', '--fieldname', 'myField','--fieldtype','Picklist','--picklistvalues','a,b,c','-d','picklistField'])
  .it('runs force:cmdt:field:create --fieldname myField --fieldtype Picklist --picklistvalues a,b,c', ctx => {
    const cmdtName = 'myField';
    expect(fs.existsSync(`picklistField/fields`)).to.be.true;
    expect(fs.existsSync(`picklistField/fields/${cmdtName}__c.field-meta.xml`)).to.be.true;
    exec(`rm -rf picklistField`);
  })

})
