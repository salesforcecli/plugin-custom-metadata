/**
 * Using the given file system, creates a file representing a new custom metadata type.
 * @param fs
 * @param devname
 * @param label
 * @param plurallabel
 * @param visibility
 */
export async function createTypeFile(fs, devname, label, plurallabel, visibility) {

    const newTypeContent =
      `<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>${label}</label>
    <pluralLabel>${plurallabel}</pluralLabel>
    <visibility>${visibility}</visibility>
</CustomObject>`;
    const outputFilePath = `force-app/main/default/objects/${devname}__mdt/${devname}__mdt.object-meta.xml`;
    await fs.mkdirp(`force-app/main/default/objects/${devname}__mdt`);
    await fs.writeFile(outputFilePath, newTypeContent);
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
