# summary

Generate a custom metadata type and all its records from a Salesforce object.

# description

Use this command to migrate existing custom objects or custom settings in an org to custom metadata types. If a field of the Salesforce object is of an unsupported type, the field type is automatically converted to text. Run "<%= config.bin %> cmdt generate field --help" to see the list of supported cmdt field types, listed in the --type flag summary. Use the --ignore-unsupported to ignore these fields.

This command creates the metadata files that describe the new custom metadata type and its fields in the "force-app/main/default/objects/TypeName__mdt" directory by default, where "TypeName" is the value of the required --dev-name flag. Use --type-output-directory to create them in a different directory.

# examples

- Generate a custom metadata type from a custom object called MySourceObject__c in your default org:

  <%= config.bin %> <%= command.id %> --dev-name MyCMDT --sobject MySourceObject\_\_c

- Generate a custom metadata type from a custom object in an org with alias my-scratch-org; ignore unsupported field types instead of converting them to text:

  <%= config.bin %> <%= command.id %> --dev-name MyCMDT --sobject MySourceObject\_\_c --ignore-unsupported --target-org my-scratch-org

- Generate a protected custom metadata type from a custom object:

  <%= config.bin %> <%= command.id %> --dev-name MyCMDT --sobject MySourceObject\_\_c --visibility Protected

- Generate a protected custom metadata type from a custom setting with a specific singular and plural label:

  <%= config.bin %> <%= command.id %> --dev-name MyCMDT --label "My CMDT" --plural-label "My CMDTs" --sobject MySourceSetting\_\_c --visibility Protected

- Generate a custom metadata type and put the resulting metadata files in the specified directory:

  <%= config.bin %> <%= command.id %> --dev-name MyCMDT --sobject MySourceObject\_\_c --type-output-directory path/to/my/cmdt/directory

- Generate a custom metadata type and put the resulting record metadata file(s) in the specified directory:

  <%= config.bin %> <%= command.id %> --dev-name MyCMDT --sobject MySourceObject\_\_c --records-output-dir path/to/my/cmdt/record/directory

# flags.visibility.summary

Who can see the custom metadata type.

# flags.visibility.description

For more information on what each option means, see this topic in Salesforce Help: https://help.salesforce.com/s/articleView?id=sf.custommetadatatypes_ui_create.htm&type=5.

# flags.dev-name.summary

Name of the custom metadata type.

# flags.label.summary

Label for the custom metadata type.

# flags.plural-label.summary

Plural version of the label value; if blank, uses label.

# flags.sobject.summary

API name of the source Salesforce object used to generate the custom metadata type.

# flags.ignore-unsupported.summary

Ignore unsupported field types.

# flags.ignore-unsupported.description

In this context, "ignore" means that the fields aren't created. The default behavior is to create fields of type text and convert the field values to text.

# flags.type-output-directory.summary

Directory to store newly-created custom metadata type files.

# flags.records-output-dir.summary

Directory to store newly-created custom metadata record files.

# sobjectnameNoResultError

No sObject with name %s found in the org.

# generateError

Failed to generate custom metadata. Reason: %s.

# customSettingTypeError

Cannot generate custom metadata for the custom setting %s. Check type and visibility.
