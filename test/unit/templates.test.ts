import { expect } from '@salesforce/command/lib/test';
import { Templates } from '../../src/lib/templates/templates';

describe('Templates', () => {
    const templates = new Templates();
    describe('createObjectXML', () => {
        const testData = {
            "label": "Sample",
            "pluralLabel": "Samples"
        };
        let xml: string = templates.createObjectXML(testData, 'Public');
        expect(xml.includes(`<label>Sample</label>`)).to.be.true;
        expect(xml.includes(`<pluralLabel>Samples</pluralLabel>`)).to.be.true;
        expect(xml.includes(`<visibility>Public</visibility>`)).to.be.true;
    });

    describe('createFieldXML', () => {

        it('Checkbox field created', () => {
            let data: any = { fullName: 'Checkbox', defaultValue: 'false', type: 'Checkbox', label: 'test' };
            let xml: String = templates.createFieldXML(data, false);
            expect(xml.includes(`<fullName>Checkbox__c</fullName>`)).to.be.true;
            expect(xml.includes(`<type>Checkbox</type>`)).to.be.true;
            expect(xml.includes(`<label>test</label>`)).to.be.true;
        });
        it('Date field created', () => {
            let data: any = { fullName: 'Date', type: 'Date', label: 'test' };
            let xml: String = templates.createFieldXML(data, false);
            expect(xml.includes(`<fullName>Date__c</fullName>`)).to.be.true;
            expect(xml.includes(`<type>Date</type>`)).to.be.true;
            expect(xml.includes(`<label>test</label>`)).to.be.true;
        });
        it('DateTime field created', () => {
            let data: any = { fullName: 'DateTime', type: 'DateTime', label: 'test' };
            let xml: String = templates.createFieldXML(data, false);
            expect(xml.includes(`<fullName>DateTime__c</fullName>`)).to.be.true;
            expect(xml.includes(`<type>DateTime</type>`)).to.be.true;
            expect(xml.includes(`<label>test</label>`)).to.be.true;
        });
        it('Email field created', () => {
            let data: any = { fullName: 'Email', type: 'Email', label: 'test', unique: 'false' };
            let xml: String = templates.createFieldXML(data, false);
            expect(xml.includes(`<fullName>Email__c</fullName>`)).to.be.true;
            expect(xml.includes(`<type>Email</type>`)).to.be.true;
            expect(xml.includes(`<label>test</label>`)).to.be.true;
            expect(xml.includes(`<unique>false</unique>`)).to.be.true;
        });
        it('Number field created', () => {
            let data: any = { fullName: 'Number', type: 'Number', label: 'test', precision: '18', scale: '0', unique: 'false' };
            let xml: String = templates.createFieldXML(data, false);
            expect(xml.includes(`<fullName>Number__c</fullName>`)).to.be.true;
            expect(xml.includes(`<type>Number</type>`)).to.be.true;
            expect(xml.includes(`<label>test</label>`)).to.be.true;
            expect(xml.includes(`<unique>false</unique>`)).to.be.true;
            expect(xml.includes(`<precision>18</precision>`)).to.be.true;
            expect(xml.includes(`<scale>0</scale>`)).to.be.true;
        });
        it('Percent field created', () => {
            let data: any = { fullName: 'Percent', type: 'Percent', label: 'test', precision: '18', scale: '0' };
            let xml: String = templates.createFieldXML(data, false);
            expect(xml.includes(`<fullName>Percent__c</fullName>`)).to.be.true;
            expect(xml.includes(`<type>Percent</type>`)).to.be.true;
            expect(xml.includes(`<label>test</label>`)).to.be.true;
            expect(xml.includes(`<precision>18</precision>`)).to.be.true;
            expect(xml.includes(`<scale>0</scale>`)).to.be.true;
        });
        it('Phone field created', () => {
            let data: any = { fullName: 'Phone', type: 'Phone', label: 'test' };
            let xml: String = templates.createFieldXML(data, false);
            expect(xml.includes(`<fullName>Phone__c</fullName>`)).to.be.true;
            expect(xml.includes(`<type>Phone</type>`)).to.be.true;
            expect(xml.includes(`<label>test</label>`)).to.be.true;
        });
        it('Picklist field created', () => {
            let data: any = {
                fullName: 'Picklist', type: 'Picklist', label: 'test', valueSet: {
                    restricted: 'true',
                    valueSetDefinition: {
                        sorted: 'false',
                        value: [{ fullName: 'value', label: 'value' }, { fullName: 'value2', label: 'value2' }]
                    }
                }
            };
            let xml: String = templates.createFieldXML(data, false);
            expect(xml.includes(`<fullName>Picklist__c</fullName>`)).to.be.true;
            expect(xml.includes(`<type>Picklist</type>`)).to.be.true;
            expect(xml.includes(`<label>test</label>`)).to.be.true;
            expect(xml.includes(`<fullName>value</fullName>`)).to.be.true;
            expect(xml.includes(`<fullName>value2</fullName>`)).to.be.true;
            expect(xml.includes(`<label>value</label>`)).to.be.true;
            expect(xml.includes(`<label>value2</label>`)).to.be.true;
        });
        it('Text field created', () => {
            let data: any = { fullName: 'Text', type: 'Text', label: 'test', unique: 'false', length: '100' };
            let xml: String = templates.createFieldXML(data, false);
            expect(xml.includes(`<fullName>Text__c</fullName>`)).to.be.true;
            expect(xml.includes(`<type>Text</type>`)).to.be.true;
            expect(xml.includes(`<label>test</label>`)).to.be.true;
            expect(xml.includes(`<unique>false</unique>`)).to.be.true;
            expect(xml.includes(`<length>100</length>`)).to.be.true;
        });
        it('default toText field', () => {
            let data: any = { fullName: 'Text', type: 'Lookup', label: 'test', unique: 'false', length: '100' };
            let xml: String = templates.createFieldXML(data, true);
            expect(xml.includes(`<fullName>Text__c</fullName>`)).to.be.true;
            expect(xml.includes(`<type>Text</type>`)).to.be.true;
            expect(xml.includes(`<label>test</label>`)).to.be.true;
            expect(xml.includes(`<unique>false</unique>`)).to.be.true;
            expect(xml.includes(`<length>100</length>`)).to.be.true;
        });
        it('TextArea field created', () => {
            let data: any = { fullName: 'TextArea', type: 'TextArea', label: 'test', unique: 'false', length: '100' };
            let xml: String = templates.createFieldXML(data, false);
            expect(xml.includes(`<fullName>TextArea__c</fullName>`)).to.be.true;
            expect(xml.includes(`<type>TextArea</type>`)).to.be.true;
            expect(xml.includes(`<label>test</label>`)).to.be.true;
            expect(xml.includes(`<unique>false</unique>`)).to.be.true;
            expect(xml.includes(`<length>100</length>`)).to.be.true;
        });
        it('LongTextArea field created', () => {
            let data: any = { fullName: 'LongTextArea', type: 'LongTextArea', label: 'test', length: '32768', visibleLines: 3 };
            let xml: String = templates.createFieldXML(data, false);
            expect(xml.includes(`<fullName>LongTextArea__c</fullName>`)).to.be.true;
            expect(xml.includes(`<type>LongTextArea</type>`)).to.be.true;
            expect(xml.includes(`<label>test</label>`)).to.be.true;
            expect(xml.includes(`<length>32768</length>`)).to.be.true;
            expect(xml.includes(`<visibleLines>3</visibleLines>`)).to.be.true;
        });
        it('default to LongTextArea field', () => {
            let data: any = { fullName: 'LongTextArea', type: 'Html', label: 'test', length: '32768', visibleLines: 3 };
            let xml: String = templates.createFieldXML(data, true);
            expect(xml.includes(`<fullName>LongTextArea__c</fullName>`)).to.be.true;
            expect(xml.includes(`<type>LongTextArea</type>`)).to.be.true;
            expect(xml.includes(`<label>test</label>`)).to.be.true;
            expect(xml.includes(`<length>32768</length>`)).to.be.true;
            expect(xml.includes(`<visibleLines>3</visibleLines>`)).to.be.true;
        });
        it('Url field created', () => {
            let data: any = { fullName: 'Url', type: 'Url', label: 'test' };
            let xml: String = templates.createFieldXML(data, false);
            expect(xml.includes(`<fullName>Url__c</fullName>`)).to.be.true;
            expect(xml.includes(`<type>Url</type>`)).to.be.true;
            expect(xml.includes(`<label>test</label>`)).to.be.true;
        });
        it('default to LongTextArea field', () => {
            let data: any = { fullName: 'LongTextArea', type: 'Html', label: 'test', length: '32768', visibleLines: 3 };
            try {
                templates.createFieldXML(data, false);
            } catch( ex){
                expect(ex.message).to.contain('\'Html\' is not a valid field type.');
            }
        });

    });
    describe('createDefaultTypeStructure', () => {
        let struct: any;
        it('should return Checkbox structure', () => {
            struct = templates.createDefaultTypeStructure('Checkbox', 'Checkbox', 'test', null);
            expect(struct.fullName === 'Checkbox').to.be.true;
            expect(struct.type === 'Checkbox').to.be.true;
            expect(struct.label === 'test').to.be.true;
            expect(struct.defaultValue === 'false').to.be.true;
        });
        it('should return Date structure', () => {
            struct = templates.createDefaultTypeStructure('Date', 'Date', 'test', null);
            expect(struct.fullName === 'Date').to.be.true;
            expect(struct.type === 'Date').to.be.true;
            expect(struct.label === 'test').to.be.true;
        });
        it('should return DateTime structure', () => {
            struct = templates.createDefaultTypeStructure('DateTime', 'DateTime', 'test', null);
            expect(struct.fullName === 'DateTime').to.be.true;
            expect(struct.type === 'DateTime').to.be.true;
            expect(struct.label === 'test').to.be.true;
        });
        it('should return Email structure', () => {
            struct = templates.createDefaultTypeStructure('Email', 'Email', 'test', null);
            expect(struct.fullName === 'Email').to.be.true;
            expect(struct.type === 'Email').to.be.true;
            expect(struct.label === 'test').to.be.true;
            expect(struct.unique === 'false').to.be.true;
        });
        it('should return Number structure', () => {
            struct = templates.createDefaultTypeStructure('Number', 'Number', 'test', null);
            expect(struct.fullName === 'Number').to.be.true;
            expect(struct.type === 'Number').to.be.true;
            expect(struct.label === 'test').to.be.true;
            expect(struct.precision === 18).to.be.true;
            expect(struct.scale === 0).to.be.true;
            expect(struct.unique === 'false').to.be.true;
        });
        it('should return Percent structure', () => {
            struct = templates.createDefaultTypeStructure('Percent', 'Percent', 'test', null);
            expect(struct.fullName === 'Percent').to.be.true;
            expect(struct.type === 'Percent').to.be.true;
            expect(struct.label === 'test').to.be.true;
            expect(struct.precision === 18).to.be.true;
            expect(struct.scale === 0).to.be.true;
        });
        it('should return Phone structure', () => {
            struct = templates.createDefaultTypeStructure('Phone', 'Phone', 'test', null);
            expect(struct.fullName === 'Phone').to.be.true;
            expect(struct.type === 'Phone').to.be.true;
            expect(struct.label === 'test').to.be.true;
        });
        it('should return Picklist structure', () => {
            struct = templates.createDefaultTypeStructure('Picklist', 'Picklist', 'test', ['value1', 'value2']);
            expect(struct.fullName === 'Picklist').to.be.true;
            expect(struct.type === 'Picklist').to.be.true;
            expect(struct.label === 'test').to.be.true;
            expect(struct.valueSet.restricted === 'true').to.be.true;
            expect(struct.valueSet.valueSetDefinition.sorted === 'false').to.be.true;
            expect(struct.valueSet.valueSetDefinition.value[0].label === 'value1').to.be.true;
        });
        it('should return Phone structure', () => {
            struct = templates.createDefaultTypeStructure('Phone', 'Phone', 'test', null);
            expect(struct.fullName === 'Phone').to.be.true;
            expect(struct.type === 'Phone').to.be.true;
            expect(struct.label === 'test').to.be.true;
        });
        it('should return Text structure', () => {
            struct = templates.createDefaultTypeStructure('Text', 'Text', 'test', null);
            expect(struct.fullName === 'Text').to.be.true;
            expect(struct.type === 'Text').to.be.true;
            expect(struct.label === 'test').to.be.true;
            expect(struct.unique === 'false').to.be.true;
            expect(struct.length === '100').to.be.true;
        });
        it('should return TextArea structure', () => {
            struct = templates.createDefaultTypeStructure('TextArea', 'TextArea', 'test', null);
            expect(struct.fullName === 'TextArea').to.be.true;
            expect(struct.type === 'TextArea').to.be.true;
            expect(struct.label === 'test').to.be.true;
        });
        it('should return LongTextArea structure', () => {
            struct = templates.createDefaultTypeStructure('LongTextArea', 'LongTextArea', 'test', null);
            expect(struct.fullName === 'LongTextArea').to.be.true;
            expect(struct.type === 'LongTextArea').to.be.true;
            expect(struct.label === 'test').to.be.true;
            expect(struct.length === '32768').to.be.true;
            expect(struct.visibleLines === 3).to.be.true;
        });
        it('should return Url structure', () => {
            struct = templates.createDefaultTypeStructure('Url', 'Url', 'test', null);
            expect(struct.fullName === 'Url').to.be.true;
            expect(struct.type === 'Url').to.be.true;
            expect(struct.label === 'test').to.be.true;
        });
    });
    describe('canConvert', () => {
        it('type should convert', () => {
            ['Checkbox',
                'Date',
                'DateTime',
                'Email',
                'Number',
                'Percent',
                'Phone',
                'Picklist',
                'Text',
                'TextArea',
                'LongTextArea',
                'Url']
                .forEach(type => {
                    expect(templates.canConvert(type)).to.be.true;
                })
        });
        it('type should not convert', () => {
            expect(templates.canConvert('test')).to.be.false;
        })
    });
});
