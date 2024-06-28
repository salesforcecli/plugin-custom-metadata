/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from 'node:fs';
import path from 'node:path';

import { Flags, loglevel, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import type { Record } from '@jsforce/jsforce-node';
import { parse } from 'csv-parse/sync';
import { getFieldNames, appendDirectorySuffix, createRecord, getFileData } from '../../../shared/helpers/createUtil.js';
import { CreateConfig, CreateConfigs } from '../../../shared/interfaces/createConfig.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'records');

export default class Insert extends SfCommand<CreateConfigs> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly requiresProject = true;
  public static readonly aliases = ['force:cmdt:record:insert', 'cmdt:record:insert'];
  public static readonly deprecateAliases = true;
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    loglevel,
    csv: Flags.string({
      char: 'f',
      summary: messages.getMessage('flags.csv.summary'),
      required: true,
      aliases: ['filepath'],
    }),
    'type-name': Flags.string({
      char: 't',
      summary: messages.getMessage('flags.type-name.summary'),
      description: messages.getMessage('flags.type-name.description'),
      required: true,
      parse: (input) => Promise.resolve(input.endsWith('__mdt') ? input.replace('__mdt', '') : input),
      aliases: ['typename'],
    }),
    'input-directory': Flags.directory({
      char: 'i',
      summary: messages.getMessage('flags.input-directory.summary'),
      default: path.join('force-app', 'main', 'default', 'objects'),
      aliases: ['inputdir', 'inputdirectory'],
      exists: true,
    }),
    'output-directory': Flags.directory({
      char: 'd',
      summary: messages.getMessage('flags.output-directory.summary'),
      default: path.join('force-app', 'main', 'default', 'customMetadata'),
      aliases: ['outputdir', 'outputdirectory'],
    }),
    'name-column': Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.name-column.summary'),
      default: 'Name',
      aliases: ['namecolumn'],
    }),
  };

  public async run(): Promise<CreateConfigs> {
    const { flags } = await this.parse(Insert);
    const dirName = appendDirectorySuffix(flags['type-name']);
    const fieldDirPath = path.join(flags['input-directory'], dirName, 'fields');
    const fileNames = await fs.promises.readdir(fieldDirPath);

    // if customMetadata folder does not exist, create it
    await fs.promises.mkdir(flags['output-directory'], { recursive: true });

    const fileData = await getFileData(fieldDirPath, fileNames);
    const metadataTypeFields = getFieldNames(fileData, flags['name-column']);

    const parsedRecords = parse(await fs.promises.readFile(flags.csv), {
      columns: (header: string[]) => columnValidation(metadataTypeFields, header, flags['type-name']),
    }) as Record[];

    // Transforms on the recordname are to match the behavior of adding a new Custom Metadata Type record in the UI
    const recordConfigs: CreateConfig[] = validateUniqueNames(
      parsedRecords.map((record) => ({
        typename: flags['type-name'],
        recordname: ensureNameColumnValue(flags['name-column'])(record)
          .replace(/[^a-zA-Z0-9]/g, '_') // replace all non-alphanumeric characters with _
          .replace(/^(\d)/, 'X$1') // prepend an X if the first character is a number
          .replace(/_{2,}/g, '_') // replace multiple underscores with single underscore
          .replace(/_$/, ''), // remove trailing underscore (if any)
        label: ensureNameColumnValue(flags['name-column'])(record),
        inputdir: flags['input-directory'],
        outputdir: flags['output-directory'],
        protected: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        varargs: Object.fromEntries(
          // TODO: throw an error if any of the fields in the csvDataAry do not exist in the fileData
          fileData.map((file) => {
            if (file.fullName) {
              return record[file.fullName] ? [file.fullName, record[file.fullName]] : [];
            } else {
              throw new SfError('No fullName found in fileData');
            }
          })
        ),
        fileData,
      }))
    );

    // find the cmdt in the inputdir.
    // loop through files and create records that match fields
    await Promise.all(recordConfigs.map(createRecord));

    this.log(messages.getMessage('successResponse', [flags.csv, flags['output-directory']]));

    return recordConfigs;
  }
}

/** pass in the column name and record.  Makes sure tht the column has a non-empty value */
const ensureNameColumnValue =
  (nameColumn: string) =>
  (record: Record): string => {
    const nameColumnValue = record[nameColumn] as unknown;
    if (typeof nameColumnValue !== 'string' || !nameColumnValue.trim().length) {
      throw new SfError(
        `The column specified for the "name-column" flag (${nameColumn}) must be present in every row of the CSV file.`
      );
    }
    return nameColumnValue;
  };

/** validate name fields are unique, otherwise they'll be trying to write to the same file */
const validateUniqueNames = (recordConfigs: CreateConfig[]): CreateConfig[] => {
  const recordNameSet = new Set<string>();
  const dupes = recordConfigs
    .map((rc) => {
      if (recordNameSet.has(rc.recordname)) {
        return rc.recordname;
      } else {
        recordNameSet.add(rc.recordname);
        return undefined;
      }
    })
    .filter((rc): rc is string => rc !== undefined);
  if (dupes.length > 0) {
    throw new SfError(
      `Your CSV has duplicate values:  ${[...new Set(dupes)].join(', ')}.  CMDT require unique names in the name field.`
    );
  }
  return recordConfigs;
};

/** Validate that every column in the CSV has known metadata */
const columnValidation = (requiredFields: string[], columnList: string[], typeNameFlag: string): string[] => {
  columnList.forEach((column) => {
    if (!requiredFields.includes(column)) {
      throw new SfError(messages.getMessage('fieldNotFoundError', [column, typeNameFlag]));
    }
  });
  return columnList;
};
