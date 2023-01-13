# summary

Generate a field for a custom metadata type based on the provided field type.

# description

Similar to a custom object, a custom metadata type has a list of custom fields that represent aspects of the metadata.

This command creates a metadata file that describes the new custom metadata type field. By default, the file is created in a "fields" directory in the current directory. Use the --output-directory to generate the file in the directory that contains the custom metadata type metdata files, such as "force-app/main/default/objects/MyCmdt__mdt" for the custom metadata type called MyCmdt.

# examples

- Generate a metadata file for a custom checkbox field and add the file to the MyCmdt__mdt/fields directory:

  <%= config.bin %> <%= command.id %> --name MyCheckboxField --type Checkbox --output-directory force-app/main/default/objects/MyCmdt__mdt

- Generate a metadata file for a custom picklist field and add a few values:

  <%= config.bin %> <%= command.id %> --name MyPicklistField --type Picklist --picklist-values A --picklist-values B --picklist-values C --output-directory force-app/main/default/objects/MyCmdt__mdt

- Generate a metadata file for a custom number field and specify 2 decimal places:

  <%= config.bin %> <%= command.id %> --name MyNumberField --type Number --decimal-places 2 --output-directory force-app/main/default/objects/MyCmdt__mdt

# flags.name.summary

Unique name for the field.

# flags.type.summary

Type of the field.

# flags.type.description

You can't use this command to create a custom metadata type field of type "Metadata Relationship". Use the Salesforce Setup UI instead.

# flags.picklist-values.summary

Picklist values; required for picklist fields.

# flags.decimal-places.summary

Number of decimal places to use for number or percent fields.

# flags.decimal-places.description

The value must be greater than or equal to zero. Default value is 0.

# flags.label.summary

Label for the field.

# flags.output-directory.summary

Directory to store newly-created field definition files.

# flags.output-directory.description

New files are automatically created in the "fields" directory. The location can be an absolute path or relative to the current working directory. The default is the current directory.

# invalidCustomFieldError

'%s' is an invalid field. Custom fields must contain only alphanumeric characters, must begin with a letter, can't end with an underscore, and can't contain two consecutive underscore characters.

# picklistValuesNotSuppliedError

You must specify at least one picklist value when the field type is picklist.

# targetDirectory

target dir = %s

# fileCreated

created %s

# fileUpdate

updated %s
