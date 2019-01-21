export class FileWriter {

    /**
     * Using the given file system, creates a file representing a new custom metadata type.
     * @param fs
     * @param devname
     * @param objectXML
     */
    public async writeTypeFile(fs, devName, objectXML) {
        let apiName = devName;

        // replace __c with __mdt
        if (apiName.endsWith('__c')) {
            apiName = apiName.replace('__c', '__mdt');
        }
        // appending __mdt if they did not pass it in.
        if (!apiName.endsWith('__mdt')) {
            apiName += '__mdt';
        }
        const outputFilePath = `${apiName}/${apiName}.object-meta.xml`;
        await fs.mkdirp(`${apiName}`);
        await fs.writeFile(outputFilePath, objectXML);
    }

    /**
     * Using the given file system, creates a file representing a new field for the given custom metadata type
     * @param fs
     * @param fieldname
     * @param fieldXML
     */
    // /fields/{fieldAPI}.field-meta.xml
    public async writeFieldFile(fs, fieldName, fieldXML) {
        // appending __c if its not already there
        if (fieldName.endsWith('__c') === false) {
            fieldName += '__c';
        }
        const outputFilePath = `fields/${fieldName}.field-meta.xml`;
        await fs.mkdirp('fields');
        await fs.writeFile(outputFilePath, fieldXML);
    }
}
