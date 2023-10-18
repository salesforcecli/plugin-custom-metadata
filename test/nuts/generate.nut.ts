/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable camelcase */

import * as path from 'path';
import * as fs from 'fs';
import { expect } from 'chai';
import { TestSession, execCmd } from '@salesforce/cli-plugins-testkit';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'fromorg');

const validationMessages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'validation');

let mainFolder: string;
let objectsFolder: string;
let metadataFolder: string;

let session: TestSession;

describe('force:cmdt:generate', () => {
  before(async () => {
    session = await TestSession.create({
      project: {
        gitClone: 'https://github.com/trailheadapps/dreamhouse-lwc',
      },
      scratchOrgs: [
        {
          config: path.join('config', 'project-scratch-def.json'),
          setDefault: true,
        },
      ],
      devhubAuthStrategy: 'AUTO',
    });
    // we rely on their being some custom object and records
    execCmd('force:source:push', { ensureExitCode: 0, cli: 'sf' });
    execCmd('force:user:permset:assign -n dreamhouse', { ensureExitCode: 0, cli: 'sf' });
    execCmd(`force:data:tree:import -p ${path.join('data', 'sample-data-plan.json')}`, {
      ensureExitCode: 0,
      cli: 'sf',
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mainFolder = path.join(session.project.dir, 'force-app', 'main', 'default');
    objectsFolder = path.join(mainFolder, 'objects');
    metadataFolder = path.join(mainFolder, 'customMetadata');
  });

  it('turns Broker__c into MyCMDT', () => {
    const cmdtNameSupplied = 'MyCMDT__mdt';
    const cmdtName = 'MyCMDT';

    execCmd(`force:cmdt:generate -n ${cmdtNameSupplied} -s Broker__c`, { ensureExitCode: 0 });
    expect(fs.existsSync(path.join(objectsFolder, `${cmdtName}__mdt`))).to.be.true;
    expect(fs.existsSync(path.join(objectsFolder, `${cmdtName}__mdt`, 'fields', 'Email__c.field-meta.xml'))).to.be.true;
    expect(fs.existsSync(path.join(objectsFolder, `${cmdtName}__mdt`, 'fields', 'Title__c.field-meta.xml'))).to.be.true;
    expect(fs.existsSync(path.join(objectsFolder, `${cmdtName}__mdt`, 'fields', 'Picture_IMG__c.field-meta.xml'))).to.be
      .true;
    expect(fs.existsSync(path.join(metadataFolder, `${cmdtName}.Caroline_Kingsley.md-meta.xml`))).to.be.true;
    expect(fs.existsSync(path.join(metadataFolder, `${cmdtName}.Michael_Jones.md-meta.xml`))).to.be.true;
  });

  it('turns Broker__c into MyCMDT when no suffix supplied', () => {
    const cmdtName = 'MyCMDT2';

    const response = execCmd(`force:cmdt:generate -n ${cmdtName} -s Broker__c`, { ensureExitCode: 0 });
    expect(fs.existsSync(path.join(objectsFolder, `${cmdtName}__mdt`))).to.be.true;
    expect(fs.existsSync(path.join(objectsFolder, `${cmdtName}__mdt`, 'fields', 'Email__c.field-meta.xml'))).to.be.true;
    expect(fs.existsSync(path.join(objectsFolder, `${cmdtName}__mdt`, 'fields', 'Title__c.field-meta.xml'))).to.be.true;
    expect(fs.existsSync(path.join(objectsFolder, `${cmdtName}__mdt`, 'fields', 'Picture_IMG__c.field-meta.xml'))).to.be
      .true;
    expect(fs.existsSync(path.join(metadataFolder, `${cmdtName}.Caroline_Kingsley.md-meta.xml`))).to.be.true;
    expect(fs.existsSync(path.join(metadataFolder, `${cmdtName}.Michael_Jones.md-meta.xml`))).to.be.true;

    expect(response.shellOutput.stderr).to.contain('custom metadata type and records creation in completed');
  });

  it('errors on missing object', () => {
    const cmdtName = 'badCMDT';

    const response = execCmd(`force:cmdt:generate -n ${cmdtName} -s NoSuchObject__c --json`, {
      ensureExitCode: 1,
    }).jsonOutput;
    expect(response?.message).to.contain(messages.getMessage('sobjectnameNoResultError', ['NoSuchObject__c']));
    expect(fs.existsSync(path.join(objectsFolder, `${cmdtName}__mdt`))).to.be.false;
  });

  it('errors on invalid object api name', () => {
    const cmdtName = 'badCMDT';
    const response = execCmd(`force:cmdt:generate -n ${cmdtName} -s Trigger__Settings__c --json`, {
      ensureExitCode: 1,
    }).jsonOutput;
    expect(response?.message).to.contain(
      validationMessages.getMessage('sobjectnameFlagError', ['Trigger__Settings__c'])
    );
    expect(fs.existsSync(path.join(objectsFolder, `${cmdtName}__mdt`))).to.be.false;
  });

  it('errors on invalid cmdt name object', () => {
    const cmdtName = 'MyCM__DT';
    const response = execCmd(`force:cmdt:generate -n ${cmdtName} -s Broker__c --json`, {
      ensureExitCode: 1,
    }).jsonOutput;
    expect(response?.message).to.contain(validationMessages.getMessage('invalidCMDTApiName', ['MyCM__DT']));
    expect(fs.existsSync(path.join(objectsFolder, `${cmdtName}__mdt`))).to.be.false;
  });

  after(async () => {
    await session.zip(undefined, 'artifacts');
    await session.clean();
  });
});
