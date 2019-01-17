
export class Templates {

    public createObjectXML( data, visibility ){
        return `<?xml version="1.0" encoding="UTF-8"?>
        <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
            <label>${data.label}</label>
            <pluralLabel>${data.labelPlural}</pluralLabel>
            <visibility>${visibility}</visibility>
        </CustomObject>`;
    }


    public createFieldXML( data , defaultToString ) {
        var returnValue = `<?xml version="1.0" encoding="UTF-8"?>
        <CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
            <fullName>${data.name.endsWith('__c' ? data.name: data.name + '__c')}</fullName>
            <description>${data.description || ''}</description>
            <externalId>${data.externalId || 'false' }</externalId>
            <fieldManageability>${data.fieldManageability || 'DeveloperControlled'}</fieldManageability>
            <inlineHelpText>${data.inlineHelpText || ''}</inlineHelpText>
            <label>${data.label}</label>
            `;
            returnValue += this.getType(data, defaultToString);
            returnValue += this.getRequiredTag(data);
            returnValue += this.getPercisionTag(data);
            returnValue += this.getScaleTag(data);
            returnValue += this.getLengthTag(data);
            returnValue += this.getVisibleLines(data);
        returnValue += '</CustomField>';
        return returnValue;
    }
    // Note: GEO Location decimal is stored as a and double has a compoundFieldName: 'Decimal_GEo__c',
    // Other geo location is stored as location
    
    private getType( data, defaultToString ){
        let fieldTag = '<type>';
        switch (data.type.toLowerCase()){
            case 'boolean':
                fieldTag += 'Checkbox';
                break;
            case 'double':
                fieldTag += 'Number';
                break;
            case 'string':
                fieldTag += 'Text';
                break;
            case 'reference':
                if ( defaultToString ){
                    fieldTag += 'Text';
                } else {
                    throw `Type not found: ${data.type}`; // TODO: update error to tell them that it is not supported and to override
                }
                break;
            case 'currency':
                if ( defaultToString ){
                    fieldTag += 'Text';
                } else {
                    throw `Type not found: ${data.type}`;
                }
                break;
            case 'encryptedstring':
                if ( defaultToString ){
                    fieldTag += 'Text';
                } else {
                    throw `Type not found: ${data.type}`;
                }
                break;
            case 'multipicklist':
                if ( defaultToString ){
                    fieldTag += 'Text';
                } else {
                    throw `Type not found: ${data.type}`;
                }
                break;
            case 'location':
                if ( defaultToString ){
                    fieldTag += 'Text';
                } else {
                    throw `Type not found: ${data.type}`;
                }
                break;
            case 'date':
                fieldTag += 'Date';
                break;
            case 'datetime':
                fieldTag += 'DateTime';
                break;
            case 'email':
                fieldTag += 'Email';
                break;
            case 'percent':
                fieldTag += 'Percent';
                break;
            case 'phone':
                fieldTag += 'Phone';
                break;
            case 'picklist':
                fieldTag += 'Picklist';
                break;
            case 'textarea':
            // NOTE: text area, rich text area, and text area long both come back as textarea
                if ( data.htmlFormatted ){ // TODO: do we want this as a text area instead of a string
                    if ( defaultToString ){
                        fieldTag += 'Text';
                    } else {
                        throw `Type not found: ${data.type}`;
                    }
                    break;
                }
                if(data.length > 255){
                    fieldTag += 'LongTextArea';
                } else {
                    fieldTag += 'TextArea';
                }
                break;
            case 'url':
                fieldTag += 'Url';
                break;
            default :
                throw `Type not found: ${data.type}`;
                break;
        }
    
        fieldTag += '</type> \n';
        return fieldTag;
    
    }

    public convertInputToFieldType ( input ){
        let fieldType = input;
        switch (input.toLowerCase()){
            case 'checkbox':
                fieldType = 'boolean';
                break;
            case 'number':
                fieldType = 'double';
                break;
            case 'text':
                fieldType = 'string';
                break;
            case 'textarealong':
                fieldType = 'textArea';
                break;
        }
        return fieldType;
    }
    
    private getRequiredTag( data ){
        if ( data.type.toLowerCase() === 'email' || data.type.toLowerCase() === 'text'){
            return `<unique>${data.unique || false}</unique>
            `;
        }else {
            return '';
        }
    }
    
    private getPercisionTag( data ){
        if ( data.type.toLowerCase() === 'percent' || data.type.toLowerCase() === 'number'){
            return `<precision>${data.precision || 18}</precision>
            `;
        }else {
            return '';
        }
    }
    
    private getScaleTag( data ){
        if ( data.type.toLowerCase() === 'percent' || data.type.toLowerCase() === 'number'){
            return `<scale>${data.scale || 0}</scale>
            `;
        }else {
            return '';
        }
    }
    
    private getLengthTag( data ){
        if ( data.type.toLowerCase() === 'string'){
            return `<length>${data.length || 100}</length>
            `
        } else if( data.type.toLowerCase() === 'textarea' && data.length > 255){
            return `<length>${data.length || 32768}</length>
            `;
        }else {
            return '';
        }
    }
    
    // Text area describe does not have information about how many lines are visible
    // This value is required and we are going to default it to 3
    private getVisibleLines( data ){
        if (data.type === 'textarea' && data.length > 255 ){
            return '<visibleLines>3</visibleLines> \n';
        } else {
            return '';
        }
    }

}





// TODO: Picklist
// <valueSet>
// <restricted>true</restricted>
// <valueSetDefinition>
// <sorted>false</sorted>
// <value>
// <fullName>A</fullName>
// <default>true</default>
// <label>A</label>
// </value>
// <value>
// <fullName>B</fullName>
// <default>false</default>
// <label>B</label>
// </value>
// <value>
// <fullName>C</fullName>
// <default>false</default>
// <label>C</label>
// </value>
// </valueSetDefinition>
// </valueSet>
