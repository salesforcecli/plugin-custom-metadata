# commandDescription

create new custom metadata type records from a CSV file

# commandLongDescription

Create new custom metadata type records from a CSV file.

# examples

- Create record metadata files for type 'My_CMDT_Name' (from your local project) based on values in a CSV file, using 'Name' as the column that specifies the record name:

  <%= config.bin %> <%= command.id %> --csv path/to/my.csv --type-name My_CMDT_Name

- Create record metadata files for type 'My_CMDT_Name' (from the specified directory) based on values in a CSV file, using 'PrimaryKey' as the column that specifies the record name:

  <%= config.bin %> <%= command.id %> --csv path/to/my.csv --type-name My_CMDT_Name --input-directory path/to/my/cmdt/directory --name-column "PrimaryKey"

# filepathFlagDescription

path to the CSV file

# filepathFlagLongDescription

The path to the CSV file.

# inputDirectoryFlagDescription

directory to pull the custom metadata type definition from

# inputDirectoryFlagLongDescription

The directory to pull the custom metadata type definition from.

# outputDirectoryFlagDescription

directory to store newly-created custom metadata record files

# outputDirectoryFlagLongDescription

The directory to store newly-created custom metadata record files.

# typenameFlagDescription

API name of the custom metadata type

# typenameFlagLongDescription

The API Name of the custom metadata type. The '\_\_mdt' suffix will be appended to the end of the name if it is omitted.

# namecolumnFlagDescription

column that is used to determine the name of the record

# namecolumnFlagLongDescription

The column that is used to determine the name of the record.

# successResponse

Created custom metadata type records from '%s' at '%s'.

# fieldNotFoundError

The column %s is not found on the custom metadata type %s.
