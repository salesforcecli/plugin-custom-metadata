import { SfdxError } from '@salesforce/core';

export class Templates {

    /**
     * Using the given data and visibility, creates the body of a type metadata file
     * @param data
     * @param visibility
     */
    public createObjectXML(data, visibility) {
        let returnValue = '<?xml version="1.0" encoding="UTF-8"?>\n';
        returnValue += '<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">\n';
        returnValue += `\t<label>${data.label}</label>\n`;
        returnValue += `\t<pluralLabel>${data.labelPlural}</pluralLabel>\n`;
        returnValue += `\t<visibility>${visibility}</visibility>\n`;
        returnValue += '</CustomObject>\n';
        return returnValue;
    }

    /**
     * Using the given data and defaultToString, creates the body for a field file
     * @param data
     * @param visibility
     */
    public createFieldXML(data, defaultToString) {
        let returnValue = '<?xml version="1.0" encoding="UTF-8"?>\n';
        returnValue += '<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">\n';
        returnValue += this.getFullName(data);
        returnValue += this.getDescription(data);
        returnValue += this.getExternalId(data);
        returnValue += this.getFieldManageability(data);
        returnValue += this.getInlineHelpText(data);
        returnValue += this.getLabel(data);
        returnValue += this.getType(data, defaultToString);
        returnValue += this.getValueSet(data);
        returnValue += this.getDefaultValue(data);
        returnValue += this.getRequiredTag(data);
        returnValue += this.getPercisionTag(data);
        returnValue += this.getScaleTag(data);
        returnValue += this.getLengthTag(data);
        returnValue += this.getVisibleLines(data);
        returnValue += '</CustomField>\n';
        return returnValue;
    }

    public createDefaultTypeStructure(fullName: string, type: string, label: string, picklistValues: []) {

        switch (type) {
            case 'Checkbox':
                return { fullName, defaultValue: 'false', type, label };
                break;
            case 'Date':
                return { fullName, type, label };
                break;
            case 'DateTime':
                return { fullName, type, label };
                break;
            case 'Email':
                return { fullName, type, label, unique: 'false' };
                break;
            case 'Number':
                return { fullName, type, label, precision: '18', scale: '0', unique: 'false' };
                break;
            case 'Percent':
                return { fullName, type, label, precision: '18', scale: '0' };
                break;
            case 'Phone':
                return { fullName, type, label };
                break;
            case 'Picklist':
                return {
                    fullName, type, label, valueSet: {
                        restricted: 'true',
                        valueSetDefinition: {
                            sorted: 'false',
                            value: this.createPicklistValues(picklistValues)
                        }
                    }
                };
                break;
            case 'Text':
                return { fullName, type, label, unique: 'false', length: '100' };
                break;
            case 'TextArea':
                return { fullName, type, label };
                break;
            case 'LongTextArea':
                return { fullName, type, label, length: '32768', visibleLines: 3 };
                break;
            case 'Url':
                return { fullName, type, label };
                break;
        }
    }

    public canConvert(type) {
        const metadataFieldTypes = ['Checkbox', 'Date', 'DateTime', 'Email', 'Number', 'Percent', 'Phone', 'Picklist', 'Text', 'TextArea', 'LongTextArea', 'Url'];
        return metadataFieldTypes.includes(type);
    }

    private getType(data, defaultToMetadataType) {
        if (this.canConvert(data.type)) {
            return `\t<type>${data.type}</type>\n`;
        } else if (defaultToMetadataType) {
            return `\t<type>${this.getConvertType(data.type)}</type>\n`;
        } else {
            throw SfdxError.create('custommetadata', 'template', 'errorNotAValidaType', [data.type]);
        }

    }

    private getConvertType(type) {
        if (type === 'Html') {
            return 'LongTextArea';
        } else {
            return 'Text';
        }
    }

    private getFullName(data) {
        const name = data.fullName.endsWith('__c') ? data.fullName : data.fullName + '__c';
        return `\t<fullName>${name}</fullName>\n`;
    }

    private getDescription(data) {
        return data.description ? `\t<description>${data.description}</description>\n` : '';
    }

    private getExternalId(data) {
        return data.externalId ? `\t<externalId>${data.externalId || 'false'}</externalId>\n` : '';
    }

    private getFieldManageability(data) {
        return `\t<fieldManageability>${data.fieldManageability || 'DeveloperControlled'}</fieldManageability>\n`;
    }

    private getInlineHelpText(data) {
        return data.inlineHelpText ? `\t<inlineHelpText>${data.inlineHelpText || 'false'}</inlineHelpText>\n` : '';
    }
    private getLabel(data) {
        return `\t<label>${data.label}</label>\n`;
    }

    private getRequiredTag(data) {
        return data.unique ? `\t<unique>${data.unique || false}</unique>\n` : '';
    }

    private getPercisionTag(data) {
        return data.precision ? `\t<precision>${data.precision || 18}</precision>\n` : '';
    }

    private getScaleTag(data) {
        return data.scale ? `\t<scale>${data.scale || false}</scale>\n` : '';
    }

    private getLengthTag(data) {
        return data.length ? `\t<length>${data.length || 100}</length>\n` : '';
    }

    private getVisibleLines(data) {
        return data.visibleLines ? `\t<visibleLines>${data.visibleLines || 3}</visibleLines>\n` : '';
    }

    private getDefaultValue(data) {
        return data.defaultValue ? `\t<defaultValue>${data.defaultValue}</defaultValue>\n` : '';
    }

    private getValueSet(data) {
        let fieldValue: string = '';
        if (data.valueSet) {
            fieldValue += '\t<valueSet>\n';
            fieldValue += `\t\t<restricted>${data.valueSet.restricted || false}</restricted>\n`;
            fieldValue += '\t\t<valueSetDefinition>\n';
            fieldValue += `\t\t\t<sorted>${data.valueSet.valueSetDefinition.sorted || false}</sorted>\n`;
            data.valueSet.valueSetDefinition.value.forEach(value => {
                fieldValue += '\t\t\t<value>\n';
                fieldValue += `\t\t\t\t<fullName>${value.fullName}</fullName>\n`;
                fieldValue += `\t\t\t\t<default>${value.default || false}</default>\n`;
                fieldValue += `\t\t\t\t<label>${value.label}</label>\n`;
                fieldValue += '\t\t\t</value>\n';
            });
            fieldValue += '\t\t</valueSetDefinition>\n';
            fieldValue += '\t</valueSet>\n';
        }
        return fieldValue;
    }

    private createPicklistValues(values: []) {
        const picklistValues = [];
        values.forEach(value => {
            picklistValues.push({ fullName: value, label: value });
        });
        return picklistValues;
    }

}
