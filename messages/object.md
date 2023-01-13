# summary

Generate a new custom metadata type in the current project.

# description

This command creates a metadata file that describes the new custom metadata type. By default, the file is created in the MyCustomType__mdt directory in the current directory, where MyCustomType is the value of the required --type-name flag. Use the --output-directory to generate the file in a package directory with other custom metadata types, such as "force-app/main/default/objects".

# examples

- Generate a custom metadata type with developer name 'MyCustomType'; this name is also used as the label:

  <%= config.bin %> <%= command.id %> --type-name MyCustomType

- Generate a protected custom metadata type with a specific label:

  <%= config.bin %> <%= command.id %> --type-name MyCustomType --label "Custom Type" --plural-label "Custom Types" --visibility Protected

# flags.type-name.summary

Unique object name for the custom metadata type.

# flags.type-name.description

The name can contain only underscores and alphanumeric characters, and must be unique in your org. It must begin with a letter, not include spaces, not end with an underscore, and not contain two consecutive underscores.

# flags.label.summary

Label for the custom metadata type.

# flags.plural-label.summary

Plural version of the label value; if blank, uses label.

# flags.visibility.summary

Who can see the custom metadata type.

# flags.visibility.description

For more information on what each option means, see this topic in Salesforce Help: https://help.salesforce.com/s/articleView?id=sf.custommetadatatypes_ui_create.htm&type=5.

# flags.output-directory.summary

Directory to store the newly-created custom metadata type files

# flags.output-directory.description

The location can be an absolute path or relative to the current working directory. The default is the current directory.

# successResponse

Created custom metadata type with object name '%s', label '%s', plural label '%s', and visibility '%s' at '%s'.

# errorNotValidLabelName

'%s' is too long to be a label. The maximum length of the label is 40 characters.

# errorNotValidPluralLabelName

'%s' is too long to be a plural label. The maximum length of the plural label is 40 characters.

# targetDirectory

target dir = %s

# fileCreated

created %s

# fileUpdate

updated %s
