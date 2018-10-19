import {core, flags, SfdxCommand} from '@salesforce/command';
import * as memFs from 'mem-fs';
import * as editor from 'mem-fs-editor';


// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('custommetadata', 'createType');

export default class Create extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx custommetadata:type:create --devname MyCMT 
  Created custom metadata type with developer name "MyCMT", label "MyCMT", plural label "MyCMT", and visibility "Public".
  `,
  `$ sfdx custommetadata:type:create --devname MyCMT --label "Custom Type" --plurallabel "Custom Types" --visibility Protected
  Created custom metadata type with developer name "MyCMT", label "Custom Type", plural label "My Custom Metadata Type", and visibility "Protected".
  `,
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    //name: flags.string({char: 'n', description: messages.getMessage('nameFlagDescription')}),
    //force: flags.boolean({char: 'f', description: messages.getMessage('forceFlagDescription')})
    devname: flags.string({char: 'd', description: messages.getMessage('nameFlagDescription')}), //TODO figure out how to make this required
    label: flags.string({char: 'l', description: messages.getMessage('labelFlagDescription')}),
    plurallabel: flags.string({char: 's', description: messages.getMessage('plurallabelFlagDescription')}),
    visibility: flags.string({char: 'v', description: messages.getMessage('visibilityFlagDescription')})
  };

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<core.AnyJson> {
    const devname = this.flags.devname; //this should become the new file name
    const label = this.flags.label || this.flags.devname; 
    const plurallabel = this.flags.plurallabel || label;
    const visibility = this.flags.visibility || 'Public';


    const newTypeContent = 
`<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>${label}</label>
    <pluralLabel>${plurallabel}</pluralLabel>
    <visibility>${visibility}</visibility>
</CustomObject>`;

    var store = memFs.create();
    var fs = editor.create(store);

    const outputFilePath = `force-app/main/default/objects/${devname}__mdt/${devname}__mdt.object-meta.xml`;

    fs.write(outputFilePath, newTypeContent);
    fs.commit(() => {}); //pass in an empty callback or else it freaks out

    let outputString = `Created custom metadata type with developer name "${devname}", label "${label}", plural label "${plurallabel}", and visibility "${visibility}".`;
    this.ux.log(outputString);

    // Return an object to be displayed with --json
    return {
      devname: devname,
      label: label,
      plurallabel: plurallabel,
      visibility: visibility
    };

  }

}
