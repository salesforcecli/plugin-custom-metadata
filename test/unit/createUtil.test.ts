/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { appendDirectorySuffix } from '../../src/lib/helpers/createUtil';

describe('CreateUtil', () => {
  describe('appendDirectorySuffix', () => {
    it('should append a suffix of __mdt if id does not already exist', async () => {
      const output1 = appendDirectorySuffix('foo');
      const output2 = appendDirectorySuffix('foobar__mdt');

      expect(output1 === 'foo__mdt').to.be.true;
      expect(output2 === 'foobar__mdt').to.be.true;
    });
  });
});
