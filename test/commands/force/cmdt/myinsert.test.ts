import { expect, test } from '@salesforce/command/lib/test';


describe('hello:org', () => {
  test
  .withOrg({ username: 'test@org.com' }, true) // Remove this and we get a different error
    .withProject()
    .withConnectionRequest(request => {
      if (request['url'].equals('/services/Soap/m/42.0')) {
        return Promise.resolve({ records: 'Jim' });
      }
      return Promise.resolve({ records: [] });
    })
    .stdout()
    .command(['force:cmdt:myinsert', '--targetusername', 'test@org.com'])
    .it('runs hello:org --targetusername test@org.com', ctx => {
      expect(ctx.stdout).to.contain('Hello world! This is org: Super Awesome Org and I will be around until Tue Mar 20 2018!');
    });
});