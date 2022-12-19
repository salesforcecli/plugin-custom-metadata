# commandDescription

generate a custom metadata field based on the field type provided

# commandLongDescription

Generate a custom metadata field based on the field type provided.

# exampleCaption1

Create a metadata file for a custom checkbox field:

# exampleCaption2

Create a metadata file for a custom picklist field:

# exampleCaption3

Create a metadata file for a custom number field:

# nameFlagDescription

unique name for the field

# nameFlagLongDescription

The unique name for the field.

# fieldTypeDescription

type of field

# fieldTypeLongDescription

The type of field.

# picklistValuesFlagDescription

comma-separated list of picklist values; required for Picklist fields

# picklistValuesFlagLongDescription

A comma-separated list of picklist values. These values are required when creating a Picklist field.

# decimalplacesFlagDescription

number of decimal places to use for Number or Percent fields

# decimalplacesFlagLongDescription

The number of decimal places to use for Number or Percent fields. The value must be greater than or equal to zero.

# labelFlagDescription

label for the field

# labelFlagLongDescription

The label for the field.

# outputDirectoryFlagDescription

directory to store newly-created field definition files

# outputDirectoryFlagLongDescription

The directory to store the newly-created field definition files. The location can be an absolute path or relative to the current working directory. The default is the current directory.

# invalidCustomFieldError

'%s' is an invalid field. Custom fields can only contain alphanumeric characters, must begin with a letter, cannot end with an underscore, and cannot contain two consecutive underscore characters.

# picklistValuesNotSuppliedError

Picklist values are required when field type is Picklist.

# targetDirectory

target dir = %s

# fileCreated

created %s

# fileUpdate

updated %s