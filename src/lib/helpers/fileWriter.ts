export class FileWriter {

    /**
     * Using the given file system, creates a file representing a new custom metadata type.
     * @param fs
     * @param devname
     * @param label
     * @param plurallabel
     * @param visibility
     */
    public async writeTypeFile(fs, devName, objectXML) {
        // appending __mdt if they did not pass it in.
        if (devName.endsWith('__mdt') === false) {
            devName += '__mdt';
        }
        const outputFilePath = `${devName}/${devName}.object-meta.xml`;
        await fs.mkdirp(`${devName}`);
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
        fs.mkdirp('fields');
        fs.writeFile(outputFilePath, fieldXML);
    }
}
