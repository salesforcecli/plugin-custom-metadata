export class FileWriter {

    /**
     * Using the given file system, creates a file representing a new custom metadata type.
     * @param fs
     * @param devname
     * @param objectXML
     */
    public async writeTypeFile(fs, dir, devName, objectXML) {
        let apiName = devName;
        const dirName = this.createDir(dir);

        // replace __c with __mdt
        if (apiName.endsWith('__c')) {
            apiName = apiName.replace('__c', '__mdt');
        }
        // appending __mdt if they did not pass it in.
        if (!apiName.endsWith('__mdt')) {
            apiName += '__mdt';
        }
        const outputFilePath = `${dirName}${apiName}/${apiName}.object-meta.xml`;
        await fs.mkdirp(`${dirName}${apiName}`);
        await fs.writeFile(outputFilePath, objectXML);
        return outputFilePath;
    }

    /**
     * Using the given file system, creates a file representing a new field for the given custom metadata type
     * @param fs
     * @param fieldname
     * @param fieldXML
     */
    // /fields/{fieldAPI}.field-meta.xml
    public async writeFieldFile(fs, dir, fieldName, fieldXML) {
        const dirName = this.createDir(dir);

        // appending __c if its not already there
        if (fieldName.endsWith('__c') === false) {
            fieldName += '__c';
        }
        const outputFilePath = `${dirName}fields/${fieldName}.field-meta.xml`;
        await fs.mkdirp(`${dirName}fields`);
        await fs.writeFile(outputFilePath, fieldXML);
        return outputFilePath;
    }

    public createDir(dir) {
        if (dir) {
            if (dir.endsWith('/')) {
                return dir;
            } else {
                return dir + '/';
            }
        }
        return '';
    }
}
