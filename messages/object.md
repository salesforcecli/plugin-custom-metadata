# commandDescription

creates a new custom metadata type in the current project

# commandLongDescription

Creates a new custom metadata type in the current project.

# examples

- Create a custom metadata type with developer name 'MyCustomType'; this name will also be used as the label:

  <%= config.bin %> <%= command.id %> --type-name MyCustomType

- Create a protected custom metadata type with a specific label:

  <%= config.bin %> <%= command.id %> --type-name MyCustomType --label Custom Type --plural-label Custom Types --visibility Protected

# nameFlagDescription

unique object name for the custom metadata type

# nameFlagLongDescription

The unique name of the object in the API. This name can contain only underscores and alphanumeric characters, and must be unique in your org. It must begin with a letter, not include spaces, not end with an underscore, and not contain two consecutive underscores.

# labelFlagDescription

label for the custom metadata type

# labelFlagLongDescription

A label for the custom metadata type.

# plurallabelFlagDescription

plural version of the label value; if blank, uses label

# plurallabelFlagLongDescription

The plural version of the label value. If this flag is missing or blank, the singular label is used as the plural label.

# visibilityFlagDescription

visibility of the custom metadata type

# visibilityFlagLongDescription

The visibility of the custom metadata type.

# outputDirectoryFlagDescription

directory to store the newly-created custom metadata type files

# outputDirectoryFlagLongDescription

The directory to store the newly-created custom metadata type files. The location can be an absolute path or relative to the current working directory. The default is the current directory.

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