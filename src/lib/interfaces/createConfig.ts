import { CustomField } from './customField';

export interface CreateConfig {
  typename: string;
  recordname: string;
  label: string;
  inputdir: string;
  outputdir: string;
  protected?: boolean;
  varargs?: object;
  fileData?: CustomField[];
  ignorefields?: boolean;
}
