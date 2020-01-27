custommetadata
==============

Tools for working with custom metadata types and their records.

[![Version](https://img.shields.io/npm/v/custommetadata.svg)](https://npmjs.org/package/custommetadata)
[![CircleCI](https://circleci.com/gh/forcedotcom/sfdx-custommetadata/tree/master.svg?style=shield)](https://circleci.com/gh/forcedotcom/sfdx-custommetadata/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/forcedotcom/sfdx-custommetadata?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/custommetadata/branch/master)
[![Codecov](https://codecov.io/gh/forcedotcom/sfdx-custommetadata/branch/master/graph/badge.svg)](https://codecov.io/gh/forcedotcom/sfdx-custommetadata)
[![Greenkeeper](https://badges.greenkeeper.io/forcedotcom/sfdx-custommetadata.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/forcedotcom/sfdx-custommetadata/badge.svg)](https://snyk.io/test/github/forcedotcom/sfdx-custommetadata)
[![Downloads/week](https://img.shields.io/npm/dw/custommetadata.svg)](https://npmjs.org/package/custommetadata)
[![License](https://img.shields.io/npm/l/custommetadata.svg)](https://github.com/forcedotcom/sfdx-custommetadata/blob/master/cmtPlugin/custommetadata/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g custommetadata
$ custommetadata COMMAND
running command...
$ custommetadata (-v|--version|version)
custommetadata/0.0.0 darwin-x64 node-v12.12.0
$ custommetadata --help [COMMAND]
USAGE
  $ custommetadata COMMAND
...
```
<!-- usagestop -->

<!-- commands -->
* [`custommetadata force:cmdt:create [FILE]`](#custommetadata-forcecmdtcreate-file)
* [`custommetadata force:cmdt:field:create [FILE]`](#custommetadata-forcecmdtfieldcreate-file)
* [`custommetadata force:cmdt:generate [FILE]`](#custommetadata-forcecmdtgenerate-file)
* [`custommetadata force:cmdt:record:create`](#custommetadata-forcecmdtrecordcreate)
* [`custommetadata force:cmdt:record:insert`](#custommetadata-forcecmdtrecordinsert)

## `custommetadata force:cmdt:create [FILE]`

Creates a new custom metadata type in the current project

```
USAGE
  $ custommetadata force:cmdt:create [FILE]

OPTIONS
  -d, --outputdir=outputdir                             The directory to store the newly created files. The location can
                                                        be an absolute path or relative to the current working
                                                        directory. The default is the current directory.

  -l, --label=label                                     Label for the custom metadata type

  -n, --typename=typename                               (required) Object Name for the custom metadata type

  -p, --plurallabel=plurallabel                         Plural label for the custom metadata type. If blank, uses label

  -v, --visibility=(PackageProtected|Protected|Public)  Visibility for the type. Valid values are 'Public', 'Protected',
                                                        and 'PackageProtected'. If blank, uses Public

  --json                                                format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)        logging level for this command invocation

EXAMPLES
  $ sfdx force:cmdt:create --typename MyCustomType
  $ sfdx force:cmdt:create --typename MyCustomType --label "Custom Type" --plurallabel "Custom Types" --visibility 
  Public
```

_See code: [src/commands/force/cmdt/create.ts](https://github.com/forcedotcom/sfdx-custommetadata/blob/v0.0.0/src/commands/force/cmdt/create.ts)_

## `custommetadata force:cmdt:field:create [FILE]`

generates a custom metadata field based on the field type provided

```
USAGE
  $ custommetadata force:cmdt:field:create [FILE]

OPTIONS
  -d, --outputdir=outputdir
      The directory to store the newly created files. The location can be an absolute path or relative to the current 
      working directory. The default is the current directory.

  -f, --fieldtype=(Checkbox|Date|DateTime|Email|Number|Percent|Phone|Picklist|Text|TextArea|LongTextArea|Url)
      (required) The type of field.

  -l, --label=label
      Label for the new field

  -n, --fieldname=fieldname
      (required) Name for the field

  -p, --picklistvalues=picklistvalues
      List of picklist values that are added when creating a picklist

  -s, --decimalplaces=decimalplaces
      Number of decimal places

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)
      logging level for this command invocation

EXAMPLES
  $ sfdx force:cmdt:field:create --fieldname MyField --fieldtype Checkbox
  $ sfdx force:cmdt:field:create --fieldname MyField --fieldtype Picklist --picklistvalues "A,B,C"
```

_See code: [src/commands/force/cmdt/field/create.ts](https://github.com/forcedotcom/sfdx-custommetadata/blob/v0.0.0/src/commands/force/cmdt/field/create.ts)_

## `custommetadata force:cmdt:generate [FILE]`

generates a custom metadata type and all its records for the provided sobject

```
USAGE
  $ custommetadata force:cmdt:generate [FILE]

OPTIONS
  -d, --typeoutputdir=typeoutputdir                     Specify the directory where the custom metadata will be created
                                                        (default is 'force-app/main/default/objects')

  -i, --ignoreunsupported                               Flag to ignore non-supported field types (these fields will not
                                                        be created). Default is to create text fields and convert source
                                                        to text.

  -l, --label=label                                     Label for the custom metadata type

  -l, --loglevel=loglevel                               logging level for this command invocation

  -n, --devname=devname                                 (required) The name of the new custom metadata type.

  -p, --plurallabel=plurallabel                         Plural label for the custom metadata type. If blank, uses label

  -r, --recordsoutputdir=recordsoutputdir               Specify the directory where the custom metadata will be created
                                                        (default is 'force-app/main/default/customMetadata')

  -s, --sobjectname=sobjectname                         (required) The API Name of the sObject you are generating to
                                                        Custommetadata

  -u, --targetusername=targetusername                   username or alias for the target org; overrides default target
                                                        org

  -v, --visibility=(PackageProtected|Protected|Public)  Visibility for the type. Valid values are 'Public', 'Protected',
                                                        and 'PackageProtected'. If blank, uses 'Public'

  -x, --sourceusername=sourceusername                   username or alias for the source org that contains the Custom
                                                        Setting or SObject and data to be generated

  --apiversion=apiversion                               override the api version used for api requests made by this
                                                        command

  --json                                                format output as json

EXAMPLES
  $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname MySourceObject__c
  $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname MySourceObject__c  --ignoreunsupported --sourceusername 
  'alias or the email of the source org'
  $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname SourceCustomObject__c  --visibility Protected
  $ sfdx force:cmdt:generate --devname MyCMDT --label "My CMDT" --plurallabel "My CMDTs" --sobjectname 
  SourceCustomSetting__c  --visibility Protected
  $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname SourceCustomSetting__c --typeoutputdir 'your desired Path 
  for custom metadata'
  $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname SourceCustomSetting__c --recordsoutputdir 'your desired Path 
  for custom metadata Records'
```

_See code: [src/commands/force/cmdt/generate.ts](https://github.com/forcedotcom/sfdx-custommetadata/blob/v0.0.0/src/commands/force/cmdt/generate.ts)_

## `custommetadata force:cmdt:record:create`

creates a new record for a given custom metadata type in the current project

```
USAGE
  $ custommetadata force:cmdt:record:create

OPTIONS
  -d, --outputdir=outputdir                       Specify the directory where the file will be created (default is
                                                  'force-app/main/default/customMetadata')

  -l, --label=label                               Label for the new record

  -n, --inputdir=inputdir                         Specify the directory where the custom metadata type definition will
                                                  be pulled from (default is 'force-app/main/default/objects')

  -p, --protection=protection                     Visibility for the record. Valid values are 'true' and 'false'.  If
                                                  blank, uses false.

  -r, --recname=recname                           RecordName for the new record

  -t, --typename=typename                         API Name of the custom metadata type to create a record for

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  $ sfdx force:cmdt:record:create --typename MyCMT__mdt --recname MyRecord My_Custom_Field_1=Foo My_Custom_Field_2=Bar
  $ sfdx force:cmdt:record:create --typename MyCMT__mdt --recname MyRecord --label "My Record" --protected true 
  My_Custom_Field_1=Foo My_Custom_Field_2=Bar
```

_See code: [src/commands/force/cmdt/record/create.ts](https://github.com/forcedotcom/sfdx-custommetadata/blob/v0.0.0/src/commands/force/cmdt/record/create.ts)_

## `custommetadata force:cmdt:record:insert`

creates new custom metadata type records from a CSV

```
USAGE
  $ custommetadata force:cmdt:record:insert

OPTIONS
  -d, --outputdir=outputdir                       Specify the directory where the file will be created (default is
                                                  'force-app/main/default/customMetadata')

  -f, --filepath=filepath                         (required) Path to the CSV file

  -l, --namecolumn=namecolumn                     Column that is used to determine the name of the record. Defaults to
                                                  Name

  -n, --inputdir=inputdir                         Specify the directory where the custom metadata type definition will
                                                  be pulled from (default is 'force-app/main/default/objects')

  -t, --typename=typename                         (required) API Name of the custom metadata type

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  $ sfdx force:cmdt:record:insert -f path/to/my.csv -t My_CMDT_Name
  $ sfdx force:cmdt:record:insert -f path/to/my.csv -t My_CMDT_Name -n path/to/my/cmdtDirectory
```

_See code: [src/commands/force/cmdt/record/insert.ts](https://github.com/forcedotcom/sfdx-custommetadata/blob/v0.0.0/src/commands/force/cmdt/record/insert.ts)_
<!-- commandsstop -->

<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
