/*
 * Copyright (c) 2018-2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxError } from '@salesforce/core';

export class Templates {

    /**
     * Using the given data and visibility, creates the body of a type metadata file
     * @param data
     * @param visibility
     */
    public createObjectXML(data, visibility) {
        let returnValue = '<?xml version="1.0" encoding="UTF-8"?>\n';
        returnValue += '<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">\n';
        returnValue += `\t<label>${data.label}</label>\n`;
        returnValue += `\t<pluralLabel>${data.pluralLabel}</pluralLabel>\n`;
        returnValue += `\t<visibility>${visibility}</visibility>\n`;
        returnValue += '</CustomObject>\n';
        return returnValue;
    }

    /**
     * Using the given data and defaultToString, creates the body for a field file.
     * @param data Record details
     * @param defaultToString If the defaultToString set type to Text for unsupported field types
     */
    public createFieldXML(data, defaultToString: boolean) {
        let returnValue = '<?xml version="1.0" encoding="UTF-8"?>\n';
        returnValue += '<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">\n';
        returnValue += this.getFullName(data);
        returnValue += this.getDescription(data);
        returnValue += this.getExternalId(data);
        returnValue += this.getFieldManageability(data);
        returnValue += this.getInlineHelpText(data);
        returnValue += this.getLabel(data);
        returnValue += this.getType(data, defaultToString);
        returnValue += this.getDefaultValue(data);
        returnValue += this.getRequiredTag(data);
        returnValue += this.getLengthTag(data);
        returnValue += this.getVisibleLines(data);

        // preventing standard objects that have fields that are being convered from passing in data
        // that is no longer relevant
        // e.g. multiselectpicklist are being converted to long text area and long text area's do not support valuesets
        if (this.canConvert(data.type)) {
            returnValue += this.getValueSet(data);
            returnValue += this.getPrecisionTag(data);
            returnValue += this.getScaleTag(data);

        }

        returnValue += '</CustomField>\n';
        return returnValue;
    }

    public createDefaultTypeStructure(fullName: string, type: string, label: string, picklistValues: string[], decimalplaces: number = 0) {
        const precision = 18 - decimalplaces;
        const scale = decimalplaces;

        switch (type) {
            case 'Checkbox':
                return { fullName, defaultValue: 'false', type, label };
            case 'Date':
                return { fullName, type, label };
            case 'DateTime':
                return { fullName, type, label };
            case 'Email':
                return { fullName, type, label, unique: 'false' };
            case 'Number':
                return { fullName, type, label, precision, scale, unique: 'false' };
            case 'Percent':
                return { fullName, type, label, precision, scale };
            case 'Phone':
                return { fullName, type, label };
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
            case 'Text':
                return { fullName, type, label, unique: 'false', length: '100' };
            case 'TextArea':
                return { fullName, type, label };
            case 'LongTextArea':
                return { fullName, type, label, length: '32768', visibleLines: 3 };
            case 'Url':
                return { fullName, type, label };
            default:
                return { fullName, type, label };
        }
    }

    public canConvert(type) {
        const metadataFieldTypes = ['Checkbox', 'Date', 'DateTime', 'Email', 'Number', 'Percent', 'Phone', 'Picklist', 'Text', 'TextArea', 'LongTextArea', 'Url'];
        return metadataFieldTypes.includes(type);
    }

    private getType(data, defaultToMetadataType: boolean) {
        if (this.canConvert(data.type)) {
            // To handle the text formula field scenario where field type will be Text with no length attribute
            if (data.type === 'Text' && data.length === undefined) {
                return '\t<type>LongTextArea</type>\n';
            }
            return `\t<type>${data.type}</type>\n`;
        } else if (defaultToMetadataType) {
            return `\t<type>${this.getConvertType(data)}</type>\n`;
        } else {
            throw SfdxError.create('@salesforce/plugin-custom-metadata', 'template', 'errorNotAValidaType', [data.type]);
        }

    }

    private getConvertType(data) {
        if (data.type === 'Html' || data.type === 'MultiselectPicklist' || (data.type === 'Text' && data.length === undefined)) {
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
        return data.externalId ? `\t<externalId>${data.externalId}</externalId>\n` : '';
    }

    private getFieldManageability(data) {
        return `\t<fieldManageability>${data.fieldManageability || 'DeveloperControlled'}</fieldManageability>\n`;
    }

    private getInlineHelpText(data) {
        return data.inlineHelpText ? `\t<inlineHelpText>${data.inlineHelpText}</inlineHelpText>\n` : '';
    }
    private getLabel(data) {
        return `\t<label>${data.label}</label>\n`;
    }

    private getRequiredTag(data) {
        return data.unique ? `\t<unique>${data.unique}</unique>\n` : '';
    }

    private getPrecisionTag(data) {
        return data.precision ? `\t<precision>${data.precision}</precision>\n` : '';
    }

    private getScaleTag(data) {
        return typeof data.scale !== 'undefined' ? `\t<scale>${data.scale}</scale>\n` : '';
    }

    private getLengthTag(data) {
        // If field type is multiselect or
        // data type is text with no length attribute then it is formula field then set the length to 32768 as we are setting the type LongTextArea
        if (data.type === 'MultiselectPicklist' || (data.type === 'Text' && data.length === undefined)) {
            return '\t<length>32768</length>\n';
        }

        if ( data.length ) {
            return `\t<length>${data.length}</length>\n`;
        }
        // For fields that are being translated from Custom objects that do not have a matching type they are
        // being defaulted to a Text field. They need to have a minimum length to them
        // e.g. Field types that are getting converted: Currency, Location, MasterDetail, Lookup
        return !this.canConvert(data.type) && this.getConvertType(data) === 'Text' ? '\t<length>100</length>\n' : '';

    }

    private getVisibleLines(data) {
        if (data.type === 'Text' && data.length === undefined) {
            return '\t<visibleLines>3</visibleLines>\n';
        }
        return data.visibleLines ? `\t<visibleLines>${data.visibleLines}</visibleLines>\n` : '';
    }

    private getDefaultValue(data) {
        if (data.type === 'Currency') {
            return data.defaultValue ? `\t<defaultValue>'${data.defaultValue}'</defaultValue>\n` : '';
        } else if (data.type === 'Checkbox' && data.defaultValue === undefined) {
            return '\t<defaultValue>false</defaultValue>\n';
        }
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

    private createPicklistValues(values: string[]) {
        const picklistValues = [];
        values.forEach(value => {
            picklistValues.push({ fullName: value, label: value });
        });
        return picklistValues;
    }

}
