/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect } from 'chai';
import { SfError } from '@salesforce/core';
import {
  validateAPIName,
  validateMetadataTypeName,
  isValidMetadataRecordName,
} from '../../src/shared/helpers/validationUtil.js';

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
