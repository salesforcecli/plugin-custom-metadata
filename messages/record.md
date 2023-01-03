# commandDescription

create a new record for a given custom metadata type in the current project

# commandLongDescription

Create a new record for a given custom metadata type in the current project.

# examples

- Create a record metadata file for custom metadata type 'MyCMT' with values specified for two custom fields:

  <%= config.bin %> <%= command.id %> --type-name MyCMT\_\_mdt --record-name MyRecord My_Custom_Field_1=Foo My_Custom_Field_2=Bar

- Create a protected record metadata file for custom metadata type 'MyCMT' with a specific label and values specified for two custom fields:

  <%= config.bin %> <%= command.id %> --type-name MyCMT\_\_mdt --record-name MyRecord --label "My Record" --protected true My_Custom_Field_1=Foo My_Custom_Field_2=Bar

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

# successResponse

Created custom metadata record of the type '%s' with record name '%s', label '%s', and protected '%s' at '%s'.

# notAValidLabelNameError

'%s' is too long to be a label. The maximum length of the label is 40 characters.