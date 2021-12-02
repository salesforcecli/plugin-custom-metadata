/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export class ValidationUtil {
  /**
   * Returns true if the fieldname is a valid api name
   *
   * @param  fieldName API name of the object
   */
  public validateAPIName(fieldName) {
    // trimming the __c from the field during character count since it does not count towards the limit
    // Regex makes sure that the field name is alpha numeric, doesn't end in an underscore
    // and optionally if it ends in __c
    return (
      fieldName.replace('__c', '').replace('__C', '').length <= 40 &&
      /^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*(__[cC])?$/.test(fieldName)
    );
  }

  /**
   * Returns true if the fieldname is a valid metadata object name
   *
   * @param  fieldName API name of the field
   */
  public validateMetadataTypeName(typeName) {
    // trimming the __mdt from the field during character count since it does not count towards the limit
    // Regex makes sure that the field name is alpha numeric, doesn't end in an underscore
    // and optionally if it ends in __mdt
    return (
      typeName.replace('__mdt', '').length <= 40 &&
      /^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*(__mdt)?$/.test(typeName)
    );
  }

  /**
   * Returns true if the fieldname is a valid metadata record name
   *
   * @param  fieldName record name of a metadata record
   */
  public validateMetadataRecordName(typeName) {
    // Regex makes sure that the field name is alpha numeric, doesn't end in an underscore
    return (
      typeName.length <= 40 &&
      /^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*$/.test(typeName)
    );
  }

  /**
   * Returns true if name is below 40 characters
   *
   * @param  name label name or plural label
   */
  public validateLessThanForty(name) {
    return name.length <= 40;
  }
}
