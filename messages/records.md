# summary

Generate new custom metadata type records from a CSV file.

# description

The custom metadata type must already exist in your project. By default, the Name column is used to determine the record name; use the --name-column flag to specify a different column.

# examples

- Generate record metadata files from values in a CSV file for the custom metadata type MyCmdt. Use 'Name' as the column that specifies the record name:

  <%= config.bin %> <%= command.id %> --csv path/to/my.csv --type-name MyCmdt

- Generate record metadata files from a CSV file in the directory different from the default, and use 'PrimaryKey' as the column that specifies the record name:

  <%= config.bin %> <%= command.id %> --csv path/to/my.csv --type-name MyCmdt --input-directory path/to/my/cmdt/directory --name-column "PrimaryKey"

# flags.csv.summary

Pathname of the CSV file.

# flags.input-directory.summary

Directory from which to get the custom metadata type definition from.

# flags.output-directory.summary

Directory to store newly-created custom metadata record files.

# flags.type-name.summary

API name of the custom metadata type to create a record for.

# flags.type-name.description

The '\_\_mdt' suffix is appended to the end of the name if it's omitted.

# flags.name-column.summary

Column used to determine the name of the record.

# successResponse

Created custom metadata type records from '%s' at '%s'.

# fieldNotFoundError

The column %s is not found on the custom metadata type %s.
