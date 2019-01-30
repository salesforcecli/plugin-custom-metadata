import { SfdxCommand} from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';

export default class Org extends SfdxCommand {



  public static examples = [
  `$ sfdx hello:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
  Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
  My hub org id is: 00Dxx000000001234
  `,
  `$ sfdx hello:org --name myname --targetusername myOrg@example.com
  Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
  `
  ];

  public static args = [{name: 'file'}];

  // protected static flagsConfig2 = {
  //   // flag with a value (-n, --name=VALUE)
  //   name: flags.string({char: 'n', description: messages.getMessage('nameFlagDescription')}),
  //   force: flags.boolean({char: 'f', description: messages.getMessage('forceFlagDescription')})
  // };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    const name = this.flags.name || 'world';

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();
    console.log(conn);
    // Query the org

    // Query call works
    // ------ START OF QUERY CALL ------
    // const query = 'Select Name, TrialExpirationDate from Organization';
    // // The type we are querying for
    // interface Organization {
    //   Name: string;
    //   TrialExpirationDate: string;
    // }
    // // Query the org
    // const result = await conn.query<Organization>(query);
    // console.log(result);
    // ------ END OF QUERY CALL ------
    
    // metadata call does not work

    const result2 = await conn.metadata.read('CustomObject', 'Account', (err, meta) => {
      if (err) {
        console.error(err);
        return err;
      }
      console.log(meta);
      return meta;
    });
    

      console.log(result2);
    // Organization always only returns one result
    const orgName = 'jim';
    const trialExpirationDate = 'dude';

    let outputString = `Hello ${name}! This is org: ${orgName}`;
    if (trialExpirationDate) {
      outputString = `${outputString} and I will be around until ${trialExpirationDate}!`;
    }
    this.ux.log(outputString);

    // this.hubOrg is NOT guaranteed because supportsHubOrgUsername=true, as opposed to requiresHubOrgUsername.
    if (this.hubOrg) {
      const hubOrgId = this.hubOrg.getOrgId();
      this.ux.log(`My hub org id is: ${hubOrgId}`);
    }

    if (this.flags.force && this.args.file) {
      this.ux.log(`You input --force and --file: ${this.args.file}`);
    }

    // Return an object to be displayed with --json
    return { orgId: this.org.getOrgId(), outputString };
  }
}