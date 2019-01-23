import { CustomField } from './customField';

export interface CreateConfig {
  typename: string;
  recname: string;
  label: string;
  inputdir: string;
  outputdir: string;
  protection?: boolean;
  varargs?: object;
  fileData?: CustomField[];
}
