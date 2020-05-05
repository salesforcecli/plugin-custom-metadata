custommetadata
==============

Tools for working with custom metadata types and their records.

[![Version](https://img.shields.io/npm/v/custommetadata.svg)](https://npmjs.org/package/custommetadata)
[![CircleCI](https://circleci.com/gh/forcedotcom/sfdx-custommetadata/tree/master.svg?style=shield)](https://circleci.com/gh/forcedotcom/sfdx-custommetadata/tree/master)
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

creates a new custom metadata type in the current project

```
USAGE
  $ custommetadata force:cmdt:create [FILE]

OPTIONS
  -d, --outputdir=outputdir                             directory to store the newly-created custom metadata type files
  -l, --label=label                                     label for the custom metadata type
  -n, --typename=typename                               (required) unique object name for the custom metadata type
  -p, --plurallabel=plurallabel                         plural version of the label value; if blank, uses label
  -v, --visibility=(PackageProtected|Protected|Public)  [default: Public] visibility of the custom metadata type
  --json                                                format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)        logging level for this command invocation

EXAMPLES
  Create a custom metadata type with developer name 'MyCustomType'; this name will also be used as the label:
       $ sfdx force:cmdt:create --typename MyCustomType
  Create a protected custom metadata type with a specific label:
       $ sfdx force:cmdt:create --typename MyCustomType --label "Custom Type" --plurallabel "Custom Types" --visibility 
  Protected
```

_See code: [src/commands/force/cmdt/create.ts](https://github.com/forcedotcom/sfdx-custommetadata/blob/v0.0.0/src/commands/force/cmdt/create.ts)_

## `custommetadata force:cmdt:field:create [FILE]`

generate a custom metadata field based on the field type provided

```
USAGE
  $ custommetadata force:cmdt:field:create [FILE]

OPTIONS
  -d, --outputdir=outputdir
      directory to store newly-created field definition files

  -f, --fieldtype=(Checkbox|Date|DateTime|Email|Number|Percent|Phone|Picklist|Text|TextArea|LongTextArea|Url)
      (required) type of field

  -l, --label=label
      label for the field

  -n, --fieldname=fieldname
      (required) unique name for the field

  -p, --picklistvalues=picklistvalues
      comma-separated list of picklist values; required for Picklist fields

  -s, --decimalplaces=decimalplaces
      number of decimal places to use for Number or Percent fields

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)
      logging level for this command invocation

EXAMPLES
  Create a metadata file for a custom checkbox field:
       $ sfdx force:cmdt:field:create --fieldname MyField --fieldtype Checkbox
  Create a metadata file for a custom picklist field:
       $ sfdx force:cmdt:field:create --fieldname MyField --fieldtype Picklist --picklistvalues "A,B,C"
  Create a metadata file for a custom number field:
       $ sfdx force:cmdt:field:create --fieldname MyField --fieldtype Number --decimalplaces 2
```

_See code: [src/commands/force/cmdt/field/create.ts](https://github.com/forcedotcom/sfdx-custommetadata/blob/v0.0.0/src/commands/force/cmdt/field/create.ts)_

## `custommetadata force:cmdt:generate [FILE]`

generates a custom metadata type and all its records for the provided sObject

```
USAGE
  $ custommetadata force:cmdt:generate [FILE]

OPTIONS
  -d, --typeoutputdir=typeoutputdir                     [default: force-app/main/default/objects/] directory to store
                                                        newly-created custom metadata type files

  -i, --ignoreunsupported                               ignore unsupported field types

  -l, --label=label                                     label for the custom metadata type

  -n, --devname=devname                                 (required) name of the custom metadata type

  -p, --plurallabel=plurallabel                         plural version of the label value; if blank, uses label

  -r, --recordsoutputdir=recordsoutputdir               [default: force-app/main/default/customMetadata/] directory to
                                                        store newly-created custom metadata record files

  -s, --sobjectname=sobjectname                         (required) API name of the sObject source for custom metadata
                                                        generation

  -u, --targetusername=targetusername                   username or alias for the target org; overrides default target
                                                        org

  -v, --visibility=(PackageProtected|Protected|Public)  [default: Public] visibility of the custom metadata type

  --apiversion=apiversion                               override the api version used for api requests made by this
                                                        command

  --json                                                format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)        logging level for this command invocation

EXAMPLES
  Generate a custom metadata type from an sObject in the default target org:
       $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname MySourceObject__c
  Generate a custom metadata type from an sObject in the specified target org; ignore unsupported field types instead of 
  converting them to text:
       $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname MySourceObject__c  --ignoreunsupported --targetusername 
  'alias or user email of the org containing the source type'
  Generate a protected custom metadata type from an sObject in the default target org:
       $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname SourceCustomObject__c  --visibility Protected
  Generate a protected custom metadata type with a specific label from an sObject in the default target org:
       $ sfdx force:cmdt:generate --devname MyCMDT --label "My CMDT" --plurallabel "My CMDTs" --sobjectname 
  SourceCustomSetting__c  --visibility Protected
  Generate a custom metadata type from an sObject in the default target org; put the resulting type metadata file in the 
  specified directory:
       $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname SourceCustomSetting__c --typeoutputdir 
  'path/to/my/cmdt/directory'
  Generate a custom metadata type from an sObject in the default target org; put the resulting record metadata file(s) 
  in the specified directory:
       $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname SourceCustomSetting__c --recordsoutputdir 
  'path/to/my/cmdt/record/directory'
```

_See code: [src/commands/force/cmdt/generate.ts](https://github.com/forcedotcom/sfdx-custommetadata/blob/v0.0.0/src/commands/force/cmdt/generate.ts)_

## `custommetadata force:cmdt:record:create`

create a new record for a given custom metadata type in the current project

```
USAGE
  $ custommetadata force:cmdt:record:create

OPTIONS
  -d, --outputdir=outputdir                       [default: force-app/main/default/customMetadata] directory to store
                                                  newly-created custom metadata record files

  -i, --inputdir=inputdir                         [default: force-app/main/default/objects] directory to pull the custom
                                                  metadata type definition from

  -l, --label=label                               label for the new record

  -n, --recordname=recordname                     (required) name for the new record

  -p, --protected=true|false                      [default: false] protect the record when it is in a managed package

  -t, --typename=typename                         (required) API name of the custom metadata type to create a record for

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  Create a record metadata file for custom metadata type 'MyCMT' with values specified for two custom fields:
       $ sfdx force:cmdt:record:create --typename MyCMT__mdt --recordname MyRecord My_Custom_Field_1=Foo 
  My_Custom_Field_2=Bar
  Create a protected record metadata file for custom metadata type 'MyCMT' with a specific label and values specified 
  for two custom fields:
       $ sfdx force:cmdt:record:create --typename MyCMT__mdt --recordname MyRecord --label "My Record" --protected true 
  My_Custom_Field_1=Foo My_Custom_Field_2=Bar
```

_See code: [src/commands/force/cmdt/record/create.ts](https://github.com/forcedotcom/sfdx-custommetadata/blob/v0.0.0/src/commands/force/cmdt/record/create.ts)_

## `custommetadata force:cmdt:record:insert`

create new custom metadata type records from a CSV file

```
USAGE
  $ custommetadata force:cmdt:record:insert

OPTIONS
  -d, --outputdir=outputdir                       [default: force-app/main/default/customMetadata] directory to store
                                                  newly-created custom metadata record files

  -f, --filepath=filepath                         (required) path to the CSV file

  -i, --inputdir=inputdir                         [default: force-app/main/default/objects] directory to pull the custom
                                                  metadata type definition from

  -n, --namecolumn=namecolumn                     [default: Name] column that is used to determine the name of the
                                                  record

  -t, --typename=typename                         (required) API name of the custom metadata type

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  Create record metadata files for type 'My_CMDT_Name' (from your local project) based on values in a CSV file, using 
  'Name' as the column that specifies the record name:
       $ sfdx force:cmdt:record:insert --filepath path/to/my.csv --typename My_CMDT_Name
  Create record metadata files for type 'My_CMDT_Name' (from the specified directory) based on values in a CSV file, 
  using 'PrimaryKey' as the column that specifies the record name:
       $ sfdx force:cmdt:record:insert --filepath path/to/my.csv --typename My_CMDT_Name --inputdir 
  "path/to/my/cmdt/directory" --namecolumn "PrimaryKey"
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
