/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// import { expect } from 'chai';
// import { Connection, Org, Messages } from '@salesforce/core';

// Messages.importMessagesDirectory(__dirname);

// const metadata = {
//   read() {
//     return {
//       fullName: 'TriggerSettings__c',
//       customSettingsType: 'List',
//       description: 'Used to declaratively enable/disable custom triggers.',
//       enableFeeds: 'false',
//       fields: [
//         {
//           fullName: 'IsAfterDeleteDisabled__c',
//           defaultValue: 'false',
//           externalId: 'false',
//           label: 'After Delete Disabled?',
//           trackTrending: 'false',
//           type: 'Checkbox',
//         },
//         {
//           fullName: 'IsDisabled__c',
//           defaultValue: 'false',
//           externalId: 'false',
//           inlineHelpText: 'Check this to disable the trigger',
//           label: 'Disabled?',
//           trackTrending: 'false',
//           type: 'Checkbox',
//         },
//         {
//           fullName: 'Test_Geo_location__c',
//           displayLocationInDecimal: 'true',
//           externalId: 'false',
//           label: 'Test Geo location',
//           required: 'false',
//           scale: '10',
//           trackHistory: 'false',
//           trackTrending: 'false',
//           type: 'Location',
//         },
//       ],
//       label: 'Trigger Settings',
//       visibility: 'Public',
//     };
//   },
// };

// const hierarchyMetadata = {
//   read() {
//     return {
//       fullName: 'TriggerSettings__c',
//       customSettingsType: 'Hierarchy',
//       visibility: 'Public',
//     };
//   },
// };

// const query = function () {
//   return {
//     totalSize: 2,
//     done: true,
//     records: [
//       {
//         Name: 'Record1',
//         IsAfterDeleteDisabled__c: true,
//         IsDisabled__c: false,
//         Test_Geo_location__c: { latitude: 12.34534534, longitude: 32.34534543 },
//       },
//       {
//         Name: 'Record2',
//         IsAfterDeleteDisabled__c: true,
//         IsDisabled__c: false,
//         Test_Geo_location__c: { latitude: 10.34534534, longitude: 42.34534543 },
//       },
//     ],
//   };
// };

// const errorQuery = function () {
//   return {
//     name: 'ERROR_NAME',
//     message: 'Failed due to an error.',
//     stack: 'ERROR_NAME: Failed due to an error',
//   };
// };

// describe('sfdx force:cmdt:generate', () => {
//   test
//     .skip()
//     .withOrg({ username: 'test@org.com' }, true)
//     .stdout()
//     .stderr()
//     .stub(Org.prototype, 'getConnection', () => ({ metadata: hierarchyMetadata, query }))
//     .command(['force:cmdt:generate', '-n', 'MyCMDT', '-s', 'TriggerSettings__c', '-u', 'test@org.com'])
//     .it(
//       'Cannot generate custom metadata for the c while running force:cmdt:generate -n MyCMDT -s TriggerSettings__c',
//       (ctx) => {
//         expect(ctx.stderr).to.contain(
//           'Cannot generate custom metadata for the custom setting TriggerSettings__c. Check type and visibility.'
//         );
//       }
//     );

//   test
//     .skip()
//     .withOrg({ username: 'test@org.com' }, true)
//     .stdout()
//     .stderr()
//     .stub(Org.prototype, 'getConnection', () => ({ metadata, query: errorQuery }))
//     .stub(Connection, 'create', () => ({ metadata, query: errorQuery }))
//     .command(['force:cmdt:generate', '-n', 'MyCMDT__mdt', '-s', 'TriggerSettings__c', '-u', 'test@org.com'])
//     .it('force:cmdt:generate -n MyCMDT -s TriggerSettings__c', (ctx) => {
//       expect(ctx.stderr).to.contain(
//         'Failed to generate custom metadata. Reason: sObjectRecords.records is not iterable.'
//       );
//     });
// });
