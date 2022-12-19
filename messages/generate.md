# commandDescription

generates a custom metadata type and all its records for the provided sObject

# commandLongDescription

Generates a custom metadata type and all its records for the provided sObject.

# exampleCaption1

Generate a custom metadata type from an sObject in the default target org:

# exampleCaption2

Generate a custom metadata type from an sObject in the specified target org; ignore unsupported field types instead of converting them to text:

# exampleCaption3

Generate a protected custom metadata type from an sObject in the default target org:

# exampleCaption4

Generate a protected custom metadata type with a specific label from an sObject in the default target org:

# exampleCaption5

Generate a custom metadata type from an sObject in the default target org; put the resulting type metadata file in the specified directory:

# exampleCaption6

Generate a custom metadata type from an sObject in the default target org; put the resulting record metadata file(s) in the specified directory:

# visibilityFlagDescription

visibility of the custom metadata type

# visibilityFlagLongDescription

The visibility of the custom metadata type.

# devnameFlagDescription

name of the custom metadata type

# devnameFlagLongDescription

The name of the custom metadata type.

# labelFlagDescription

label for the custom metadata type

# labelFlagLongDescription

The label for the custom metadata type.

# labelFlagExample

My CMDT

# plurallabelFlagDescription

plural version of the label value; if blank, uses label

# plurallabelFlagLongDescription

The plural version of the label value. If this flag is missing or blank, the singular label is used as the plural label.

# plurallabelFlagExample

My CMDTs

# sobjectnameFlagDescription

API name of the sObject source for custom metadata generation

# sobjectnameFlagLongDescription

The API name of the sObject source for custom metadata generation.

# targetusernameFlagExample

alias or user email of the org containing the source type

# ignoreUnsupportedFlagDescription

ignore unsupported field types

# ignoreUnsupportedFlagLongDescription

Ignore unsupported field types (these fields will not be created). The default is to create Text fields and convert the source value to text.

# typeoutputdirFlagDescription

directory to store newly-created custom metadata type files

# typeoutputdirFlagLongDescription

The directory to store newly-created custom metadata type files.

# typeoutputdirFlagExample

path/to/my/cmdt/directory

# recordsoutputdirFlagDescription

directory to store newly-created custom metadata record files

# recordsoutputdirFlagLongDescription

The directory to store newly-created custom metadata record files.

# recordsoutputdirFlagExample

path/to/my/cmdt/record/directory

# loglevelFlagDescription

logging level for this command invocation

# loglevelFlagLongDescription

The logging level for this command invocation.

# typenameFlagError

Not a valid custom metadata type name

# sobjectnameNoResultError

No sObject with name %s found in the org.

# sourceusernameError

No user found with the provided username or alias

# sourceuserAuthenticationError

Issue with authenticating to source org with targetusername provided: %s More info: %s.

# generateError

Failed to generate custom metadata. Reason: %s.

# customSettingTypeError

Cannot generate custom metadata for the custom setting %s. Check type and visibility.

# queryError

Cannot query records on %s. Failed with following error: %s.