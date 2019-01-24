import { expect } from '@salesforce/command/lib/test';
import { ValidationUtil } from '../../src/lib/helpers/validationUtil';


describe( 'validationUtil', () => {
    describe( 'validateAPIName', () => {
        
        it('should be a valid salesforce api name', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateAPIName('Candle')).to.be.true;
        });
        it('should not have a number as the starting character', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateAPIName('1World')).to.be.false;
        });
        it('should be fine if it has __c at the end', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateAPIName('Torch__c')).to.be.true;
        });
        it('should be fine if it has __C at the end', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateAPIName('Torch__C')).to.be.true;
        });
        it('should be fine if it has an underscore in it', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateAPIName('Torch_Wood')).to.be.true;
        });
        it('should not be more than 40 characters', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateAPIName('I_Have_More_Than_The_fourty_Characters_Allowed')).to.be.false;
        });
    });

    describe( 'validateMetadataTypeName', () => {
        it('should be a valid salesforce metadata api name', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateMetadataTypeName('Candle')).to.be.true;
        });
        it('should not have a number as the starting character', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateMetadataTypeName('1World')).to.be.false;
        });
        it('should be fine if it has __mdt at the end', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateMetadataTypeName('Torch__mdt')).to.be.true;
        });
        it('should be fine if it has an underscore in it', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateMetadataTypeName('Torch_Wood')).to.be.true;
        });
        it('should not be more than 40 characters', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateMetadataTypeName('I_Have_More_Than_The_fourty_Characters_Allowed')).to.be.false;
        });
    });

    describe( 'validateMetadataRecordName', () => {
        it('should be a valid salesforce metadata record name', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateMetadataRecordName('Candle')).to.be.true;
        });
        it('should not have a number as the starting character', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateMetadataRecordName('1World')).to.be.false;
        });
        it('should be fine if it has an underscore in it', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateMetadataRecordName('Torch_Wood')).to.be.true;
        });
        it('should not be fine if it has __mdt at the end', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateMetadataRecordName('Torch__mdt')).to.be.false;
        });
        it('should not be more than 40 characters', () => {
            const validationUtil = new ValidationUtil();
            expect(validationUtil.validateMetadataRecordName('I_Have_More_Than_The_fourty_Characters_Allowed')).to.be.false;
        });
    });

});
