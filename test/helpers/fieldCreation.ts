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
