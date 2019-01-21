export class ValidationUtil {

    /**
     * Returns a describe object from the API name you specify
     *
     * @param  fieldName API name of the object
     */
    public validateAPIName(fieldName) {
        // trimming the __c from the field during character count since it does not count towards the limit
        // Regex makes sure that the field name is alpha numeric, doesn't end in an underscore
        // and optionally if it ends in __c
        return fieldName.replace('__c', '').replace('__C', '').length <= 40 && /^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*(__[cC])?$/.test(fieldName);
    }

    /**
     * Returns a describe object from the API name you specify
     *
     * @param  fieldName API name of the field
     */
    public validateMetadataTypeName(typeName) {
        // trimming the __mdt from the field during character count since it does not count towards the limit
        // Regex makes sure that the field name is alpha numeric, doesn't end in an underscore
        // and optionally if it ends in __mdt
        return typeName.replace('__mdt', '').length <= 40 && /^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*(__mdt)?$/.test(typeName);
    }

    /**
     * Returns a describe object from the API name you specify
     *
     * @param  name label name or plural label
     */
    public validateLessThanForty(name) {
        return name.length <= 40;
    }
}
