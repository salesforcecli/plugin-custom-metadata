# summary

Generate a new record for a given custom metadata type in the current project.

# description

The custom metadata type must already exist in your project. You must specify a name for the new record. Use name=value pairs to specify the values for the fields, such as MyTextField="some text here" or MyNumberField=32.

# examples

- Create a record metadata file for custom metadata type 'MyCMT' with specified values for two custom fields:

  <%= config.bin %> <%= command.id %> --type-name MyCMT__mdt --record-name MyRecord My_Custom_Field_1=Foo My_Custom_Field_2=Bar

- Create a protected record metadata file for custom metadata type 'MyCMT' with a specific label and values specified for two custom fields:

  <%= config.bin %> <%= command.id %> --type-name MyCMT__mdt --record-name MyRecord --label "My Record" --protected true My_Custom_Field_1=Foo My_Custom_Field_2=Bar

# flags.type-name.summary

API name of the custom metadata type to create a record for; must end in "__mdt".

# flags.record-name.summary

Name of the new record.

# flags.label.summary

Label for the new record.

# flags.protected.summary

Protect the record when it's in a managed package.

# flags.protected.description

Protected records can only be accessed by code in the same managed package namespace.

# flags.input-directory.summary

Directory from which to get the custom metadata type definition from.

# flags.output-directory.summary

Directory to store newly-created custom metadata record files.

# successResponse

Created custom metadata record of the type '%s' with record name '%s', label '%s', and protected '%s' at '%s'.

# notAValidLabelNameError

'%s' is too long to be a label. The maximum length of the label is 40 characters.
