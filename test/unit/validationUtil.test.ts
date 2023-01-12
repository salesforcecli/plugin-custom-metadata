/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { SfError } from '@salesforce/core';
import {
  validateAPIName,
  validateMetadataTypeName,
  isValidMetadataRecordName,
} from '../../src/lib/helpers/validationUtil';

describe('validationUtil', () => {
  describe('validateAPIName', () => {
    it('should be a valid salesforce api name', () => {
      expect(validateAPIName('Candle')).to.equal('Candle');
    });
    it('should not have a number as the starting character', () => {
      try {
        validateAPIName('1World');
        throw new Error('did not throw');
      } catch (e) {
        expect(e instanceof SfError).to.be.true;
      }
    });
    it('should be fine if it has __c at the end', () => {
      expect(validateAPIName('Torch__c')).to.equal('Torch__c');
    });
    it('should be fine if it has __C at the end', () => {
      expect(validateAPIName('Torch__C')).to.equal('Torch__C');
    });
    it('should be fine if it has an underscore in it', () => {
      expect(validateAPIName('Torch_Wood')).to.equal('Torch_Wood');
    });
    it('should not be more than 40 characters', () => {
      try {
        validateAPIName('I_Have_More_Than_The_forty_Characters_Allowed');
        throw new Error('did not throw');
      } catch (e) {
        expect(e instanceof SfError).to.be.true;
      }
    });
  });

  describe('validateMetadataTypeName', () => {
    it('should be a valid salesforce metadata api name', () => {
      expect(validateMetadataTypeName('Candle')).to.equal('Candle');
    });
    it('should not have a number as the starting character', () => {
      try {
        validateMetadataTypeName('1World');
        throw new Error('did not throw');
      } catch (e) {
        expect(e instanceof SfError).to.be.true;
      }
    });
    it('should be fine if it has __mdt at the end (automatically trims)', () => {
      expect(validateMetadataTypeName('Torch__mdt')).to.equal('Torch');
    });
    it('should be fine if it has an underscore in it', () => {
      expect(validateMetadataTypeName('Torch_Wood')).to.equal('Torch_Wood');
    });
    it('should not be more than 40 characters', () => {
      try {
        validateMetadataTypeName('I_Have_More_Than_The_forty_Characters_Allowed');
        throw new Error('did not throw');
      } catch (e) {
        expect(e instanceof SfError).to.be.true;
      }
    });
  });

  describe('validateMetadataRecordName', () => {
    it('should be a valid salesforce metadata record name', () => {
      expect(isValidMetadataRecordName('Candle')).to.be.true;
    });
    it('should not have a number as the starting character', () => {
      expect(isValidMetadataRecordName('1World')).to.be.false;
    });
    it('should be fine if it has an underscore in it', () => {
      expect(isValidMetadataRecordName('Torch_Wood')).to.be.true;
    });
    it('should not be fine if it has __mdt at the end', () => {
      expect(isValidMetadataRecordName('Torch__mdt')).to.be.false;
    });
    it('should not be more than 40 characters', () => {
      expect(isValidMetadataRecordName('I_Have_More_Than_The_forty_Characters_Allowed')).to.be.false;
    });
  });
});
