custommetadata
==============

Tools for working with custom metadata types and their records.

[![Version](https://img.shields.io/npm/v/custommetadata.svg)](https://npmjs.org/package/custommetadata)
[![CircleCI](https://circleci.com/gh/carolyng/custommetadata/tree/master.svg?style=shield)](https://circleci.com/gh/carolyng/custommetadata/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/carolyng/custommetadata?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/custommetadata/branch/master)
[![Codecov](https://codecov.io/gh/carolyng/custommetadata/branch/master/graph/badge.svg)](https://codecov.io/gh/carolyng/custommetadata)
[![Greenkeeper](https://badges.greenkeeper.io/carolyng/custommetadata.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/carolyng/custommetadata/badge.svg)](https://snyk.io/test/github/carolyng/custommetadata)
[![Downloads/week](https://img.shields.io/npm/dw/custommetadata.svg)](https://npmjs.org/package/custommetadata)
[![License](https://img.shields.io/npm/l/custommetadata.svg)](https://github.com/carolyng/custommetadata/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g custommetadata
$ custommetadata COMMAND
running command...
$ custommetadata (-v|--version|version)
custommetadata/0.0.0 win32-x64 node-v10.14.2
$ custommetadata --help [COMMAND]
USAGE
  $ custommetadata COMMAND
...
```
<!-- usagestop -->
```sh-session
$ npm install -g custommetadata
$ custommetadata COMMAND
running command...
$ custommetadata (-v|--version|version)
custommetadata/0.0.0 win32-x64 node-v10.14.2
$ custommetadata --help [COMMAND]
USAGE
  $ custommetadata COMMAND
...
```
<!-- usagestop -->
```sh-session
$ npm install -g custommetadata
$ custommetadata COMMAND
running command...
$ custommetadata (-v|--version|version)
custommetadata/0.0.0 win32-x64 node-v8.9.4
$ custommetadata --help [COMMAND]
USAGE
  $ custommetadata COMMAND
...
```
<!-- usagestop -->
```sh-session
$ npm install -g custommetadata
$ custommetadata COMMAND
running command...
$ custommetadata (-v|--version|version)
custommetadata/0.0.0 darwin-x64 node-v8.9.4
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

## `custommetadata force:cmdt:create [FILE]`

Creates a new custom metadata type in the current project

```
USAGE
  $ custommetadata force:cmdt:create [FILE]

OPTIONS
  -d, --outputdir=outputdir                       The directory to store the newly created files. The location can be an
                                                  absolute path or relative to the current working directory. The
                                                  default is the current directory.

  -l, --label=label                               MasterLabel for the type

  -n, --devname=devname                           (required) DeveloperName for the type

  -p, --plurallabel=plurallabel                   Plural label for the type. If blank, uses label

  -v, --visibility=(Protected|Public)             Visibility for the type. Valid values are 'Public' and 'Protected'. If
                                                  blank, uses 'Public'

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  $ sfdx force:cmdt:create --devname Country
       Created custom metadata type with developer name "Country", label "Country", plural label "Country", and 
  visibility "Public".
    
  $ sfdx force:cmdt:create --devname CustomType --label "Custom Type" --plurallabel "Custom Types" --visibility 
  Protected --outputdir force-app/main/default/object
       Created custom metadata type with developer name "CustomType", label "Custom Type", plural label "My Custom 
  Metadata Type", and visibility "Protected".
```

_See code: [src\commands\force\cmdt\create.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src\commands\force\cmdt\create.ts)_

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
      (required) The type of field that you are creating

  -l, --label=label
      Label of the new record

  -n, --fieldname=fieldname
      (required) Name of the custom field

  -p, --picklistvalues=picklistvalues
      List of picklist values that are added when creating a picklist

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)
      logging level for this command invocation

EXAMPLES
  $ sfdx force:cmdt:field:create --fieldname MyCheckbox --fieldtype Checkbox
       Created custom metadata field called MyCheckbox.
    
  $ sfdx force:cmdt:field:create --fieldname Picklist --fieldtype Picklist --picklistvalues A,B,C --outputdir 
  force-app/main/default/objects/CustomMetadate__mdt
       Created custom metadata field called Picklist.
```

_See code: [src\commands\force\cmdt\field\create.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src\commands\force\cmdt\field\create.ts)_

## `custommetadata force:cmdt:generate [FILE]`

generates a custom metadata type and all its records for the provided sobject

```
USAGE
  $ custommetadata force:cmdt:generate [FILE]

OPTIONS
  -d, --deploy=deploy                        Runs the force:source:push command after Source XML is created
  -i, --ignoreunsupported=ignoreunsupported  Flag to ignore non-supported field types (these fields will not be created)
  -l, --label=label                          The label of the new Custommetadata Type.
  -l, --loglevel=loglevel                    logging level for this command invocation

  -n, --devname=devname                      (required) The name of the new Custommetadata Type. The name can be up to
                                             40 characters and must start with a letter.

  -p, --plurallabel=plurallabel              The plural label of the new Custommetadata Type. If blank, uses label

  -s, --sobjectname=sobjectname              (required) The sObject name you are generating to Custommetadata

  -u, --targetusername=targetusername        username or alias for the target org; overrides default target org

  -v, --visibility=(Protected|Public)        Visibility for the type. Valid values are 'Public' and 'Protected'. If
                                             blank, uses 'Public'

  -x, --sourceusername=sourceusername        username or alias for the source org that contains the Custom Setting or
                                             SObject and data to be generateed

  --apiversion=apiversion                    override the api version used for api requests made by this command

  --json                                     format output as json

EXAMPLE
  "$ sfdx cmdt:generate ---devName ConfigObjectmeta --label Config Object meta --plurallabel Config Object meta 
  --sobjectname ConfigObject__c   --sourceusername SourceOrg
     Congrats! Created a ConfigObjectmeta__mdt type with 32 records!"
```

_See code: [src\commands\force\cmdt\generate.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src\commands\force\cmdt\generate.ts)_

## `custommetadata force:cmdt:record:create`

Creates a new record for a given custom metadata type in the current project

```
USAGE
  $ custommetadata force:cmdt:record:create

OPTIONS
  -l, --label=label                               Label of the new record

  -n, --inputdir=inputdir                         Specify the directory where the custom metadata type definition will
                                                  be pulled from (default is 'force-app/main/default/objects')

  -o, --outputdir=outputdir                       Specify the directory where the file will be created (default is
                                                  'force-app/main/default/customMetadata')

  -p, --protection=protection                     Visibility for the record. If blank, uses false

  -r, --recname=recname                           DeveloperName of the new record

  -t, --typename=typename                         DeveloperName of the type to create a record for

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  $ sfdx custommetadata:record:create --typename MyCMT --recname MyRecord
       Created custom metadata record of the type "MyCMT" with record developer name "MyRecord", label "MyRecord", and 
  visibility "Public".
    
  $ sfdx custommetadata:record:create --typename MyCMT --recname MyRecord --label "My Record" --protected true
       Created custom metadata record of the type "MyCMT" with record developer name "MyRecord", label "MyRecord", and 
  visibility "Protected".
```

_See code: [src\commands\force\cmdt\record\create.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src\commands\force\cmdt\record\create.ts)_
<!-- commandsstop -->
* [`custommetadata force:cmdt:create [FILE]`](#custommetadata-forcecmdtcreate-file)
* [`custommetadata force:cmdt:field:create [FILE]`](#custommetadata-forcecmdtfieldcreate-file)
* [`custommetadata force:cmdt:generate [FILE]`](#custommetadata-forcecmdtgenerate-file)
* [`custommetadata force:cmdt:record:create`](#custommetadata-forcecmdtrecordcreate)

## `custommetadata force:cmdt:create [FILE]`

Creates a new custom metadata type in the current project

```
USAGE
  $ custommetadata force:cmdt:create [FILE]

OPTIONS
  -d, --outputdir=outputdir                       The directory to store the newly created files. The location can be an
                                                  absolute path or relative to the current working directory. The
                                                  default is the current directory.

  -l, --label=label                               MasterLabel for the type

  -n, --devname=devname                           (required) DeveloperName for the type

  -p, --plurallabel=plurallabel                   Plural label for the type. If blank, uses label

  -v, --visibility=(Protected|Public)             Visibility for the type. Valid values are 'Public' and 'Protected'. If
                                                  blank, uses 'Public'

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  $ sfdx force:cmdt:create --devname Country
       Created custom metadata type with developer name "Country", label "Country", plural label "Country", and 
  visibility "Public".
    
  $ sfdx force:cmdt:create --devname CustomType --label "Custom Type" --plurallabel "Custom Types" --visibility 
  Protected --outputdir force-app/main/default/object
       Created custom metadata type with developer name "CustomType", label "Custom Type", plural label "My Custom 
  Metadata Type", and visibility "Protected".
```

_See code: [src\commands\force\cmdt\create.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src\commands\force\cmdt\create.ts)_

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
      (required) The type of field that you are creating

  -l, --label=label
      Label of the new record

  -n, --fieldname=fieldname
      (required) Name of the custom field

  -p, --picklistvalues=picklistvalues
      List of picklist values that are added when creating a picklist

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)
      logging level for this command invocation

EXAMPLES
  $ sfdx force:cmdt:field:create --fieldname MyCheckbox --fieldtype Checkbox
       Created custom metadata field called MyCheckbox.
    
  $ sfdx force:cmdt:field:create --fieldname Picklist --fieldtype Picklist --picklistvalues A,B,C --outputdir 
  force-app/main/default/objects/CustomMetadate__mdt
       Created custom metadata field called Picklist.
```

_See code: [src\commands\force\cmdt\field\create.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src\commands\force\cmdt\field\create.ts)_

## `custommetadata force:cmdt:generate [FILE]`

generates a custom metadata type and all its records for the provided sobject

```
USAGE
  $ custommetadata force:cmdt:generate [FILE]

OPTIONS
  -d, --deploy=deploy                        Runs the force:source:push command after Source XML is created
  -i, --ignoreunsupported=ignoreunsupported  Flag to ignore non-supported field types (these fields will not be created)
  -l, --label=label                          The label of the new Custommetadata Type.
  -l, --loglevel=loglevel                    logging level for this command invocation

  -n, --devname=devname                      (required) The name of the new Custommetadata Type. The name can be up to
                                             40 characters and must start with a letter.

  -p, --plurallabel=plurallabel              The plural label of the new Custommetadata Type. If blank, uses label

  -s, --sobjectname=sobjectname              (required) The sObject name you are generating to Custommetadata

  -u, --targetusername=targetusername        username or alias for the target org; overrides default target org

  -v, --visibility=(Protected|Public)        Visibility for the type. Valid values are 'Public' and 'Protected'. If
                                             blank, uses 'Public'

  -x, --sourceusername=sourceusername        username or alias for the source org that contains the Custom Setting or
                                             SObject and data to be generateed

  --apiversion=apiversion                    override the api version used for api requests made by this command

  --json                                     format output as json

EXAMPLE
  "$ sfdx cmdt:generate ---devName ConfigObjectmeta --label Config Object meta --plurallabel Config Object meta 
  --sobjectname ConfigObject__c   --sourceusername SourceOrg
     Congrats! Created a ConfigObjectmeta__mdt type with 32 records!"
```

_See code: [src\commands\force\cmdt\generate.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src\commands\force\cmdt\generate.ts)_

## `custommetadata force:cmdt:record:create`

Creates a new record for a given custom metadata type in the current project

```
USAGE
  $ custommetadata force:cmdt:record:create

OPTIONS
  -l, --label=label                               Label of the new record

  -n, --inputdir=inputdir                         Specify the directory where the custom metadata type definition will
                                                  be pulled from (default is 'force-app/main/default/objects')

  -o, --outputdir=outputdir                       Specify the directory where the file will be created (default is
                                                  'force-app/main/default/customMetadata')

  -p, --protection=protection                     Visibility for the record. If blank, uses false

  -r, --recname=recname                           DeveloperName of the new record

  -t, --typename=typename                         DeveloperName of the type to create a record for

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  $ sfdx custommetadata:record:create --typename MyCMT --recname MyRecord
       Created custom metadata record of the type "MyCMT" with record developer name "MyRecord", label "MyRecord", and 
  visibility "Public".
    
  $ sfdx custommetadata:record:create --typename MyCMT --recname MyRecord --label "My Record" --protected true
       Created custom metadata record of the type "MyCMT" with record developer name "MyRecord", label "MyRecord", and 
  visibility "Protected".
```

_See code: [src\commands\force\cmdt\record\create.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src\commands\force\cmdt\record\create.ts)_
<!-- commandsstop -->
* [`custommetadata force:cmdt:convert [FILE]`](#custommetadata-forcecmdtconvert-file)
* [`custommetadata force:cmdt:create [FILE]`](#custommetadata-forcecmdtcreate-file)
* [`custommetadata force:cmdt:field:create [FILE]`](#custommetadata-forcecmdtfieldcreate-file)
* [`custommetadata force:cmdt:record:create`](#custommetadata-forcecmdtrecordcreate)
* [`custommetadata hello:org [FILE]`](#custommetadata-helloorg-file)

## `custommetadata force:cmdt:convert [FILE]`

Converts a custom object and all its records to an equivalent custom metadata type

```
USAGE
  $ custommetadata force:cmdt:convert [FILE]

OPTIONS
  -n, --objname=objname                           DeveloperName of the object to create a type for
  -u, --targetusername=targetusername             username or alias for the target org; overrides default target org

  -v, --visibility=visibility                     Visibility for the type. Valid values are 'Public' and 'Protected'. If
                                                  blank, uses 'Public'

  --apiversion=apiversion                         override the api version used for api requests made by this command

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLE
  $ sfdx custommetadata:convert --objname ConfigObject__c --visibility Public -u myOrg@org.com
     Congrats! Created a ConfigObject__mdt type with 32 records!
```

_See code: [src\commands\force\cmdt\convert.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src\commands\force\cmdt\convert.ts)_

## `custommetadata force:cmdt:create [FILE]`

Creates a new custom metadata type in the current project

```
USAGE
  $ custommetadata force:cmdt:create [FILE]

OPTIONS
  -d, --devname=devname                           (required) DeveloperName for the type

  -d, --outputdir=outputdir                       Visibility for the type. Valid values are 'Public' and 'Protected'. If
                                                  blank, uses 'Public'

  -l, --label=label                               MasterLabel for the type

  -s, --plurallabel=plurallabel                   Plural label for the type. If blank, uses label

  -v, --visibility=visibility                     Visibility for the type. Valid values are 'Public' and 'Protected'. If
                                                  blank, uses 'Public'

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  $ sfdx force:cmdt:create --devname MyCMT
       Created custom metadata type with developer name "MyCMT", label "MyCMT", plural label "MyCMT", and visibility 
  "Public".
    
  $ sfdx force:cmdt:create --devname MyCMT --label "Custom Type" --plurallabel "Custom Types" --visibility Protected
       Created custom metadata type with developer name "MyCMT", label "Custom Type", plural label "My Custom Metadata 
  Type", and visibility "Protected".
```

_See code: [src\commands\force\cmdt\create.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src\commands\force\cmdt\create.ts)_

## `custommetadata force:cmdt:field:create [FILE]`

Creates a new custom metadata type in the current project

```
USAGE
  $ custommetadata force:cmdt:field:create [FILE]

OPTIONS
  -f, --fieldtype=fieldtype                       (required) MasterLabel for the type
  -l, --label=label                               Plural label for the type. If blank, uses label
  -n, --fieldname=fieldname                       (required) DeveloperName for the type
  -p, --picklistvalues=picklistvalues             Plural label for the type. If blank, uses label
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  $ sfdx force:cmdt:type:create --devname MyCMT
       Created custom metadata type with developer name "MyCMT", label "MyCMT", plural label "MyCMT", and visibility 
  "Public".
    
  $ sfdx force:cmdt:type:create --devname MyCMT --label "Custom Type" --plurallabel "Custom Types" --visibility 
  Protected
       Created custom metadata type with developer name "MyCMT", label "Custom Type", plural label "My Custom Metadata 
  Type", and visibility "Protected".
```

_See code: [src\commands\force\cmdt\field\create.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src\commands\force\cmdt\field\create.ts)_

## `custommetadata force:cmdt:record:create`

Creates a new record for a given custom metadata type in the current project

```
USAGE
  $ custommetadata force:cmdt:record:create

OPTIONS
  -d, --recname=recname                           DeveloperName of the new record
  -l, --label=label                               Label of the new record
  -p, --protection=protection                     Visibility for the record. If blank, uses false
  -t, --typename=typename                         DeveloperName of the type to create a record for
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  $ sfdx custommetadata:record:create --typename MyCMT --recname MyRecord
       Created custom metadata record of the type "MyCMT" with record developer name "MyRecord", label "MyRecord", and 
  visibility "Public".
    
  $ sfdx custommetadata:record:create --typename MyCMT --recname MyRecord --label "My Record" --protected true
       Created custom metadata record of the type "MyCMT" with record developer name "MyRecord", label "MyRecord", and 
  visibility "Protected".
```

_See code: [src\commands\force\cmdt\record\create.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src\commands\force\cmdt\record\create.ts)_

## `custommetadata hello:org [FILE]`

Prints a greeting and your org id(s)!

```
USAGE
  $ custommetadata hello:org [FILE]

OPTIONS
  -u, --targetusername=targetusername              username or alias for the target org; overrides default target org
  -v, --targetdevhubusername=targetdevhubusername  username or alias for the dev hub org; overrides default dev hub org
  --apiversion=apiversion                          override the api version used for api requests made by this command
  --json                                           format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)   logging level for this command invocation

EXAMPLES
  $ sfdx hello:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
     Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
     My hub org id is: 00Dxx000000001234
  
  $ sfdx hello:org --name myname --targetusername myOrg@example.com
     Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
```

_See code: [src\commands\hello\org.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src\commands\hello\org.ts)_
<!-- commandsstop -->
* [`custommetadata force:cmdt:convert [FILE]`](#custommetadata-forcecmdtconvert-file)
* [`custommetadata force:cmdt:create [FILE]`](#custommetadata-forcecmdtcreate-file)
* [`custommetadata force:cmdt:field:create [FILE]`](#custommetadata-forcecmdtfieldcreate-file)
* [`custommetadata force:cmdt:record:create`](#custommetadata-forcecmdtrecordcreate)
* [`custommetadata hello:org [FILE]`](#custommetadata-helloorg-file)

## `custommetadata force:cmdt:convert [FILE]`

Converts a custom object and all its records to an equivalent custom metadata type

```
USAGE
  $ custommetadata force:cmdt:convert [FILE]

OPTIONS
  -n, --objname=objname                           DeveloperName of the object to create a type for
  -u, --targetusername=targetusername             username or alias for the target org; overrides default target org

  -v, --visibility=visibility                     Visibility for the type. Valid values are 'Public' and 'Protected'. If
                                                  blank, uses 'Public'

  --apiversion=apiversion                         override the api version used for api requests made by this command

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLE
  $ sfdx custommetadata:convert --objname ConfigObject__c --visibility Public -u myOrg@org.com
     Congrats! Created a ConfigObject__mdt type with 32 records!
```

_See code: [src/commands/force/cmdt/convert.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src/commands/force/cmdt/convert.ts)_

## `custommetadata force:cmdt:create [FILE]`

Creates a new custom metadata type in the current project

```
USAGE
  $ custommetadata force:cmdt:create [FILE]

OPTIONS
  -d, --devname=devname                           (required) DeveloperName for the type
  -l, --label=label                               MasterLabel for the type
  -s, --plurallabel=plurallabel                   Plural label for the type. If blank, uses label

  -v, --visibility=visibility                     Visibility for the type. Valid values are 'Public' and 'Protected'. If
                                                  blank, uses 'Public'

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  $ sfdx force:cmdt:type:create --devname MyCMT
       Created custom metadata type with developer name "MyCMT", label "MyCMT", plural label "MyCMT", and visibility 
  "Public".
    
  $ sfdx force:cmdt:type:create --devname MyCMT --label "Custom Type" --plurallabel "Custom Types" --visibility 
  Protected
       Created custom metadata type with developer name "MyCMT", label "Custom Type", plural label "My Custom Metadata 
  Type", and visibility "Protected".
```

_See code: [src/commands/force/cmdt/create.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src/commands/force/cmdt/create.ts)_

## `custommetadata force:cmdt:field:create [FILE]`

Creates a new custom metadata type in the current project

```
USAGE
  $ custommetadata force:cmdt:field:create [FILE]

OPTIONS
  -f, --fieldtype=fieldtype                       (required) MasterLabel for the type
  -l, --label=label                               Plural label for the type. If blank, uses label
  -n, --fieldname=fieldname                       (required) DeveloperName for the type
  -p, --picklistvalues=picklistvalues             Plural label for the type. If blank, uses label
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  $ sfdx force:cmdt:type:create --devname MyCMT
       Created custom metadata type with developer name "MyCMT", label "MyCMT", plural label "MyCMT", and visibility 
  "Public".
    
  $ sfdx force:cmdt:type:create --devname MyCMT --label "Custom Type" --plurallabel "Custom Types" --visibility 
  Protected
       Created custom metadata type with developer name "MyCMT", label "Custom Type", plural label "My Custom Metadata 
  Type", and visibility "Protected".
```

_See code: [src/commands/force/cmdt/field/create.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src/commands/force/cmdt/field/create.ts)_

## `custommetadata force:cmdt:record:create`

Creates a new record for a given custom metadata type in the current project

```
USAGE
  $ custommetadata force:cmdt:record:create

OPTIONS
  -d, --recname=recname                           DeveloperName of the new record
  -l, --label=label                               Label of the new record
  -p, --protection=protection                     Visibility for the record. If blank, uses false
  -t, --typename=typename                         DeveloperName of the type to create a record for
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  $ sfdx custommetadata:record:create --typename MyCMT --recname MyRecord
       Created custom metadata record of the type "MyCMT" with record developer name "MyRecord", label "MyRecord", and 
  visibility "Public".
    
  $ sfdx custommetadata:record:create --typename MyCMT --recname MyRecord --label "My Record" --protected true
       Created custom metadata record of the type "MyCMT" with record developer name "MyRecord", label "MyRecord", and 
  visibility "Protected".
```

_See code: [src/commands/force/cmdt/record/create.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src/commands/force/cmdt/record/create.ts)_

## `custommetadata hello:org [FILE]`

Prints a greeting and your org id(s)!

```
USAGE
  $ custommetadata hello:org [FILE]

OPTIONS
  -u, --targetusername=targetusername              username or alias for the target org; overrides default target org
  -v, --targetdevhubusername=targetdevhubusername  username or alias for the dev hub org; overrides default dev hub org
  --apiversion=apiversion                          override the api version used for api requests made by this command
  --json                                           format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)   logging level for this command invocation

EXAMPLES
  $ sfdx hello:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
     Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
     My hub org id is: 00Dxx000000001234
  
  $ sfdx hello:org --name myname --targetusername myOrg@example.com
     Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
```

_See code: [src/commands/hello/org.ts](https://github.com/cgrabill/sfdx-custommetadata/blob/v0.0.0/src/commands/hello/org.ts)_
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
