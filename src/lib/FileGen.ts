import * as yeoman from 'yeoman-environment';
import * as Generator from 'yeoman-generator';

const env = yeoman.createEnv();

export class FileGen extends Generator {
    public constructor(args: string | string[], options: {}) {
        super(args, options);
    }

    public async createFile() {
        // if (this.options['template'] === 'EqualityPolicy.xml') {
        //   const fieldAndTypeMap = await helperFunctions.createFieldAndTypeMap(this.options['org'], this.options['answers']['EntityName']);
        //   await validationFunctions.validateField(fieldAndTypeMap, this.options['answers']['EntityName'], this.options['answers']['ResourceField']);
        //   const sfType = fieldAndTypeMap[this.options['answers']['ResourceField']];
        //   const xmlType = await helperFunctions.convertSfTypeToXMLType(sfType);
        //   this.options['answers']['Type'] = xmlType;
        // }
        
        const filePath = 'files';
        const templatePath = 'newType.xml';
        this.fs.copyTpl(
          this.templatePath(templatePath),
          this.destinationPath(filePath),
          { label: 'I hardcoded this label'}
        //   this.options['answers']
        );
    }
    
}

env.registerStub(FileGen, 'type:create');

export function typerun(command: string, options: object) {
    return new Promise((resolve, reject) => {
      env.run(command, options, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }