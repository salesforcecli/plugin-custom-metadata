/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd } from '@salesforce/cli-plugins-testkit';

export const createOneOfEveryField = (outputDir: string) => {
  execCmd(`force:cmdt:field:create --fieldname Check --fieldtype Checkbox --outputdir ${outputDir}`, {
    ensureExitCode: 0,
  });
  execCmd(`force:cmdt:field:create --fieldname Date --fieldtype Date --outputdir ${outputDir}`, { ensureExitCode: 0 });
  execCmd(`force:cmdt:field:create --fieldname Date_Time --fieldtype DateTime --outputdir ${outputDir}`, {
    ensureExitCode: 0,
  });
  execCmd(`force:cmdt:field:create --fieldname Email --fieldtype Email --outputdir ${outputDir}`, {
    ensureExitCode: 0,
  });
  execCmd(
    `force:cmdt:field:create --fieldname Number_Int --fieldtype Number --decimalplaces 0 --outputdir ${outputDir}`,
    { ensureExitCode: 0 }
  );
  execCmd(`force:cmdt:field:create --fieldname Number_Int_No_Flag --fieldtype Number --outputdir ${outputDir}`, {
    ensureExitCode: 0,
  });
  execCmd(
    `force:cmdt:field:create --fieldname Number_Double --fieldtype Number --decimalplaces 4 --outputdir ${outputDir}`,
    { ensureExitCode: 0 }
  );
  execCmd(
    `force:cmdt:field:create --fieldname Percent_Int --fieldtype Percent --decimalplaces 0 --outputdir ${outputDir}`,
    { ensureExitCode: 0 }
  );
  execCmd(`force:cmdt:field:create --fieldname Percent_Int_No_Flag --fieldtype Percent --outputdir ${outputDir}`, {
    ensureExitCode: 0,
  });
  execCmd(
    `force:cmdt:field:create --fieldname Percent_Double --fieldtype Percent --decimalplaces 2 --outputdir ${outputDir}`,
    { ensureExitCode: 0 }
  );
  execCmd(`force:cmdt:field:create --fieldname Phone --fieldtype Phone --outputdir ${outputDir}`, {
    ensureExitCode: 0,
  });
  execCmd(
    `force:cmdt:field:create --fieldname Picklist --fieldtype Picklist --picklistvalues Dir_File_Test --outputdir ${outputDir}`,
    { ensureExitCode: 0 }
  );
  execCmd(`force:cmdt:field:create --fieldname Text --fieldtype Text --outputdir ${outputDir}`, { ensureExitCode: 0 });
  execCmd(`force:cmdt:field:create --fieldname Textarea --fieldtype TextArea --outputdir ${outputDir}`, {
    ensureExitCode: 0,
  });
  execCmd(`force:cmdt:field:create --fieldname Long_Textarea --fieldtype LongTextArea --outputdir ${outputDir}`, {
    ensureExitCode: 0,
  });
  execCmd(`force:cmdt:field:create --fieldname Url --fieldtype Url --outputdir ${outputDir}`, { ensureExitCode: 0 });
};
