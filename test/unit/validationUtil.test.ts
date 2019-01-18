import { ValidationUtil } from '../../src/lib/helpers/validationUtil';

import { expect } from '@salesforce/command/lib/test';

const validator = new ValidationUtil();
const properName = 'thisIsExactly40CharactersInLengthxxxxxxx';
const longName = 'thisIsExactly41CharactersInLengthxxxxxxx1';
const specialCharName = '%^&*Name';
const underscoreName = '__Name';

describe('validationUtil', () => {
    describe('validateAPIName', () => {
        it('validates APIName is created when 40 characters', async () => {
            let result = validator.validateAPIName(properName);
            expect(result).to.be.true;
        });
        it('validates APIName is not created when 41 characters', async () => {
            let result = validator.validateAPIName(longName);
            expect(result).to.be.false;
        });
        it('validates APIName is not created when has special characters', async () => {
            let result = validator.validateAPIName(specialCharName);
            expect(result).to.be.false;
        });
        it('validates APIName is not created when starts with underscore', async () => {
            let result = validator.validateAPIName(underscoreName);
            expect(result).to.be.false;
        });
    })
    describe('validateMetadataTypeName', () => {
        it('validates APIName is created when 40 characters', async () => {
            let result = validator.validateAPIName(properName);
            expect(result).to.be.true;
        });
        it('validates APIName is not created when 41 characters', async () => {
            let result = validator.validateAPIName(longName);
            expect(result).to.be.false;
        });
        it('validates APIName is not created when has special characters', async () => {
            let result = validator.validateAPIName(specialCharName);
            expect(result).to.be.false;
        });
        it('validates APIName is not created when starts with underscore', async () => {
            let result = validator.validateAPIName(underscoreName);
            expect(result).to.be.false;
        });
    })
});
