export function createObjectXML( data, visibility ){
    return `<?xml version="1.0" encoding="UTF-8"?>
    <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
        <label>${data.label}</label>
        <pluralLabel>${data.labelPlural}</pluralLabel>
        <visibility>${visibility}</visibility>
    </CustomObject>`;
}

export function createFieldXML( data ) {
    var returnValue = `<?xml version="1.0" encoding="UTF-8"?>
    <CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
        <fullName>${data.name.endsWith('__c' ? data.name: data.name + '__c')}</fullName>
        <description>${data.description || ''}</description>
        <externalId>${data.externalId || 'false' }</externalId>
        <fieldManageability>${data.fieldManageability || 'DeveloperControlled'}</fieldManageability>
        <inlineHelpText>${data.inlineHelpText || ''}</inlineHelpText>
        <label>${data.label}</label>
        `;
        returnValue += getType(data);
        returnValue += getRequiredTag(data);
        returnValue += getPercisionTag(data);
        returnValue += getScaleTag(data);
        returnValue += getLengthTag(data);
        returnValue += getVisibleLines(data);
    returnValue += '</CustomField>';
    return returnValue;
}

function getType( data ){
    let fieldTag = '<type>';
    data.type
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
        // NOTE: text area and text area long both come back as textarea
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

function getRequiredTag( data ){
    if ( data.type.toLowerCase() === 'email' || data.type.toLowerCase() === 'text'){
        return `<unique>${data.unique || false}</unique>
        `;
    }else {
        return '';
    }
}

function getPercisionTag( data ){
    if ( data.type.toLowerCase() === 'percent' || data.type.toLowerCase() === 'number'){
        return `<precision>${data.precision || 0}</precision>
        `;
    }else {
        return '';
    }
}

function getScaleTag( data ){
    if ( data.type.toLowerCase() === 'percent' || data.type.toLowerCase() === 'number'){
        return `<scale>${data.scale || 0}</scale>
        `;
    }else {
        return '';
    }
}

function getLengthTag( data ){
    if ( data.type.toLowerCase() === 'string'){
        return `<length>${data.length || 100}</length>
        `
    } else if( data.type.toLowerCase() === 'textArea' && data.length > 255){
        return `<length>${data.length || 32768}</length>
        `;
    }else {
        return '';
    }
}

// Text area describe does not have information about how many lines are visible
// This value is required and we are going to default it to 3
function getVisibleLines( data ){
    if (data.type === 'textarea' && data.length > 255 ){
        return '<visibleLines>3</visibleLines> \n';
    } else {
        return '';
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
