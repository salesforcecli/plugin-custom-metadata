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
    exec(`rm -rf fields`);
  })

  test
  .withOrg({ username: 'test@org.com' }, true)
  .stdout()
  .withProject()
  .command(['force:cmdt:field:create', '--fieldname', 'myFi__eld','--fieldtype','Text'])
  .it('fails running force:cmdt:field:create --fieldname myFi__eld --fieldtype Text', ctx => {
    expect(ctx.stdout).to.contain('myFi__eld is not a valid field' );
  })

  test
  .withOrg({ username: 'test@org.com' }, true)
  .stdout()
  .withProject()
  .command(['force:cmdt:field:create', '--fieldname', 'myField','--fieldtype','Picklist'])
  .it('fails running force:cmdt:field:create --fieldname myField --fieldtype Picklist', ctx => {
    expect(ctx.stdout).to.contain('Picklist values are required when type is Picklist' );
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
