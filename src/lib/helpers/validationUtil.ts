export class ValidationUtil {

    public validateAPIName( fieldName ){
        return fieldName.length <= 40 && /^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*(__[cC])?$/.test( fieldName);
    }

    public validateMetadataTypeName( typeName){
        return typeName.length <= 40 && /^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*(__mdt)?$/.test( typeName);
    }
}