# commandDescription

create a new record for a given custom metadata type in the current project

# commandLongDescription

Create a new record for a given custom metadata type in the current project.

# exampleCaption1

Create a record metadata file for custom metadata type 'MyCMT' with values specified for two custom fields:

# exampleCaption2

Create a protected record metadata file for custom metadata type 'MyCMT' with a specific label and values specified for two custom fields:

# typenameFlagDescription

API name of the custom metadata type to create a record for

# typenameFlagLongDescription

The API name of the custom metadata type to create a record for.

# recordNameFlagDescription

name for the new record

# recordNameFlagLongDescription

The name for the new record.

# labelFlagDescription

label for the new record

# labelFlagLongDescription

The label for the new record.

# labelFlagExample

My Record

# protectedFlagDescription

protect the record when it is in a managed package

# protectedFlagLongDescription

Protect the record when it is in a managed package. Protected records can only be accessed by code in the same managed package namespace.

# inputDirectoryFlagDescription

directory to pull the custom metadata type definition from

# inputDirectoryFlagLongDescription

The directory to pull the custom metadata type definition from.

# outputDirectoryFlagDescription

directory to store newly-created custom metadata record files

# outputDirectoryFlagLongDescription

The directory to store newly-created custom metadata record files.

# errorInvalidCustomField

Custom fields must end in \_\_c.

# successResponse

Created custom metadata record of the type '%s' with record name '%s', label '%s', and protected '%s' at '%s'.

# notValidAPINameError

'%s' is not a valid API name for a custom metadata type.

# notAValidRecordNameError

'%s' is not a valid record name for a custom metadata record. Record names can only contain alphanumeric characters, must begin with a letter, cannot end with an underscore, and cannot contain two consecutive underscore characters.

# notAValidLabelNameError

'%s' is too long to be a label. The maximum length of the label is 40 characters.