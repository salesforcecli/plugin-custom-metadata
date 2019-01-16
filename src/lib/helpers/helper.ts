/**
 * Using the given file system, creates a file representing a new custom metadata type.
 * @param fs
 * @param devname
 * @param label
 * @param plurallabel
 * @param visibility
 */
export async function writeTypeFile(fs, devName, objectXML) {
    // appending __mdt if they did not pass it in. 
    if ( devName.endsWith('__mdt') === false ) {
        devName += '__mdt';
    }
    const outputFilePath = `${devName}/${devName}.object-meta.xml`;
    await fs.mkdirp(`${devName}`);
    await fs.writeFile(outputFilePath, objectXML);
}

/**
 * Using the given file system, creates a file representing a new record for the given custom metadata type
 * @param fs
 * @param typename
 * @param recname
 * @param label
 * @param protection
 */
export function createRecord(fs, typename, recname, label, protection, varargs) {
    let newRecordContent =
      `<?xml version="1.0" encoding="UTF-8"?>
<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <label>${label}</label>
    <protected>${protection}</protected>
`;
    if (Object.keys(varargs).length > 0) {
        newRecordContent += buildCustomFieldXml(this.varargs);
    }
    newRecordContent +=
    `</CustomMetadata>
        `;
    const outputFilePath = 'force-app/main/default/customMetadata/${typename}.${recname}.md-meta.xml';
    fs.writeFile(outputFilePath, newRecordContent);

}

/**
 * Using the given file system, creates a file representing a new field for the given custom metadata type
 * @param fs
 * @param fieldname
 * @param fieldXML
 */
// /fields/{fieldAPI}.field-meta.xml
export function writeFieldFile(fs,fieldName, fieldXML){
    // appending __c if its not already there
    if ( fieldName.endsWith('__c') === false ) {
        fieldName += '__c';
    }
    const outputFilePath =`fields/${fieldName}.field-meta.xml`;
    fs.mkdirp('fields');
    fs.writeFile(outputFilePath,fieldXML);
}

function buildCustomFieldXml(map: object) {
    let ret = '';
    for (const key in map) {
        ret +=
    `<values>
    <field>${key}</field>
    <value xsi:type="xsd:string">${map[key]}</value>
    </values>
    `;
    }
    return ret;
}
