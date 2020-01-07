"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var test_1 = require("@salesforce/command/lib/test");
var createUtil_1 = require("../../src/lib/helpers/createUtil");
var fileWriter_1 = require("../../src/lib/helpers/fileWriter");
var command_1 = require("@salesforce/command");
var fs = require("fs");
var util_1 = require("util");
var child_process = require('child_process');
var exec = util_1.promisify(child_process.exec);
describe('CreateUtil', function () {
    describe('appendDirectorySuffix', function () {
        it('should append a suffix of __mdt if id does not already exist', function () { return __awaiter(_this, void 0, void 0, function () {
            var createUtil, output1, output2;
            return __generator(this, function (_a) {
                createUtil = new createUtil_1.CreateUtil();
                output1 = createUtil.appendDirectorySuffix('foo');
                output2 = createUtil.appendDirectorySuffix('foobar__mdt');
                test_1.expect(output1 === 'foo__mdt').to.be["true"];
                test_1.expect(output2 === 'foobar__mdt').to.be["true"];
                return [2 /*return*/];
            });
        }); });
    });
    describe('getFieldPrimitiveType', function () {
        test_1.test
            .withOrg({
            username: 'test@org.com'
        }, true)
            .stdout()
            .withProject()
            .command(['force:cmdt:create', '--typename', 'Field_Type_Test', '--outputdir', 'fieldTypeTest'])
            .command(['force:cmdt:field:create', '--fieldname', 'Check', '--fieldtype', 'Checkbox', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Date', '--fieldtype', 'Date', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Date_Time', '--fieldtype', 'DateTime', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Email', '--fieldtype', 'Email', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Number_Int', '--fieldtype', 'Number', '--decimalplaces', '0', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Number_Int_No_Flag', '--fieldtype', 'Number', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Number_Double', '--fieldtype', 'Number', '--decimalplaces', '4', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int', '--fieldtype', 'Percent', '--decimalplaces', '0', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int_No_Flag', '--fieldtype', 'Percent', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Percent_Double', '--fieldtype', 'Percent', '--decimalplaces', '2', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Phone', '--fieldtype', 'Phone', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Picklist', '--fieldtype', 'Picklist', '--picklistvalues', 'Foo', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Text', '--fieldtype', 'Text', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Textarea', '--fieldtype', 'TextArea', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Long_Textarea', '--fieldtype', 'LongTextArea', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Url', '--fieldtype', 'Url', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .it('should return the field type needed to create a custom metadata type record', function () { return __awaiter(_this, void 0, void 0, function () {
            var createUtil, fileWriter, typename, recname, label, protection, inputdir, outputdir, dirName, fieldDirPath, fileNames, varargs, fileData, field1, field2, field3, field4, field5, field6, field7, field8, field9, field10, field11, field12, field13, field14, field15, field16, fileTypeFallback;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createUtil = new createUtil_1.CreateUtil();
                        fileWriter = new fileWriter_1.FileWriter();
                        typename = 'Field_Type_Test';
                        recname = 'Field_Type_Test_Record';
                        label = 'Field Type Test Label';
                        protection = true;
                        inputdir = 'fieldTypeTest';
                        outputdir = 'fieldTypeTest/customMetadata';
                        dirName = createUtil.appendDirectorySuffix(typename);
                        fieldDirPath = "" + fileWriter.createDir(inputdir) + dirName + "/fields";
                        return [4 /*yield*/, command_1.core.fs.readdir(fieldDirPath)];
                    case 1:
                        fileNames = _a.sent();
                        varargs = {
                            Check__c: true,
                            Date_Time__c: '2019-01-21T18:37:00.000Z',
                            Date__c: '2019-01-21',
                            Email__c: 'm@m.com',
                            Number__c: 42,
                            Percent__c: 29,
                            Phone__c: '423-903-0870',
                            Text__c: 'Hello',
                            Textarea_Long__c: 'HelloWorld',
                            Textarea__c: 'HelloWorld',
                            URL__c: 'https://salesforce.com/',
                            Picklist__c: 'Foo',
                            Double__c: 42.23,
                            Percent_Double__c: 78.91
                        };
                        return [4 /*yield*/, command_1.core.fs.mkdirp(outputdir)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, createUtil.getFileData(fieldDirPath, fileNames)];
                    case 3:
                        fileData = _a.sent();
                        return [4 /*yield*/, createUtil.createRecord({
                                typename: typename,
                                recname: recname,
                                label: label,
                                inputdir: inputdir,
                                outputdir: outputdir,
                                protection: protection,
                                varargs: varargs,
                                fileData: fileData
                            })];
                    case 4:
                        _a.sent();
                        field1 = createUtil.getFieldPrimitiveType(fileData, 'Check__c');
                        field2 = createUtil.getFieldPrimitiveType(fileData, 'Date_Time__c');
                        field3 = createUtil.getFieldPrimitiveType(fileData, 'Date__c');
                        field4 = createUtil.getFieldPrimitiveType(fileData, 'Email__c');
                        field5 = createUtil.getFieldPrimitiveType(fileData, 'Number_Int__c');
                        field6 = createUtil.getFieldPrimitiveType(fileData, 'Number_Int_No_Flag__c');
                        field7 = createUtil.getFieldPrimitiveType(fileData, 'Number_Double__c');
                        field8 = createUtil.getFieldPrimitiveType(fileData, 'Percent_Int__c');
                        field9 = createUtil.getFieldPrimitiveType(fileData, 'Percent_Int_No_Flag__c');
                        field10 = createUtil.getFieldPrimitiveType(fileData, 'Percent_Double__c');
                        field11 = createUtil.getFieldPrimitiveType(fileData, 'Phone__c');
                        field12 = createUtil.getFieldPrimitiveType(fileData, 'Picklist__c');
                        field13 = createUtil.getFieldPrimitiveType(fileData, 'Text__c');
                        field14 = createUtil.getFieldPrimitiveType(fileData, 'TextArea__c');
                        field15 = createUtil.getFieldPrimitiveType(fileData, 'LongTextArea__c');
                        field16 = createUtil.getFieldPrimitiveType(fileData, 'Url__c');
                        fileTypeFallback = createUtil.getFieldPrimitiveType(fileData, 'Field_Does_Not_Exist__c');
                        test_1.expect(field1 === 'boolean').to.be["true"];
                        test_1.expect(field2 === 'dateTime').to.be["true"];
                        test_1.expect(field3 === 'date').to.be["true"];
                        test_1.expect(field4 === 'string').to.be["true"];
                        test_1.expect(field5 === 'int').to.be["true"];
                        test_1.expect(field6 === 'int').to.be["true"];
                        test_1.expect(field7 === 'double').to.be["true"];
                        test_1.expect(field8 === 'int').to.be["true"];
                        test_1.expect(field9 === 'int').to.be["true"];
                        test_1.expect(field10 === 'double').to.be["true"];
                        test_1.expect(field11 === 'string').to.be["true"];
                        test_1.expect(field12 === 'string').to.be["true"];
                        test_1.expect(field13 === 'string').to.be["true"];
                        test_1.expect(field14 === 'string').to.be["true"];
                        test_1.expect(field15 === 'string').to.be["true"];
                        test_1.expect(field16 === 'string').to.be["true"];
                        test_1.expect(fileTypeFallback === 'string').to.be["true"];
                        return [4 /*yield*/, exec("rm -rf " + inputdir)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getFieldDataType', function () {
        test_1.test
            .withOrg({
            username: 'test@org.com'
        }, true)
            .stdout()
            .withProject()
            .command(['force:cmdt:create', '--typename', 'Field_Type_Test', '--outputdir', 'fieldTypeTest'])
            .command(['force:cmdt:field:create', '--fieldname', 'Check', '--fieldtype', 'Checkbox', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Date', '--fieldtype', 'Date', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Date_Time', '--fieldtype', 'DateTime', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Email', '--fieldtype', 'Email', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Number_Int', '--fieldtype', 'Number', '--decimalplaces', '0', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Number_Int_No_Flag', '--fieldtype', 'Number', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Number_Double', '--fieldtype', 'Number', '--decimalplaces', '4', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int', '--fieldtype', 'Percent', '--decimalplaces', '0', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int_No_Flag', '--fieldtype', 'Percent', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Percent_Double', '--fieldtype', 'Percent', '--decimalplaces', '2', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Phone', '--fieldtype', 'Phone', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Picklist', '--fieldtype', 'Picklist', '--picklistvalues', 'Foo', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Text', '--fieldtype', 'Text', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Textarea', '--fieldtype', 'TextArea', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Long_Textarea', '--fieldtype', 'LongTextArea', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Url', '--fieldtype', 'Url', '--outputdir', 'fieldTypeTest/Field_Type_Test__mdt'])
            .it('should return the field type needed to create a custom metadata type record', function () { return __awaiter(_this, void 0, void 0, function () {
            var createUtil, fileWriter, typename, recname, label, protection, inputdir, outputdir, dirName, fieldDirPath, fileNames, varargs, fileData, field1, field2, field3, field4, field5, field6, field7, field8, field9, field10, field11, field12, field13, field14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createUtil = new createUtil_1.CreateUtil();
                        fileWriter = new fileWriter_1.FileWriter();
                        typename = 'Field_Type_Test';
                        recname = 'Field_Type_Test_Record';
                        label = 'Field Type Test Label';
                        protection = true;
                        inputdir = 'fieldTypeTest';
                        outputdir = 'fieldTypeTest/customMetadata';
                        dirName = createUtil.appendDirectorySuffix(typename);
                        fieldDirPath = "" + fileWriter.createDir(inputdir) + dirName + "/fields";
                        return [4 /*yield*/, command_1.core.fs.readdir(fieldDirPath)];
                    case 1:
                        fileNames = _a.sent();
                        varargs = {
                            Check__c: true,
                            Date_Time__c: '2019-01-21T18:37:00.000Z',
                            Date__c: '2019-01-21',
                            Email__c: 'm@m.com',
                            Number__c: 42,
                            Percent__c: 29,
                            Phone__c: '423-903-0870',
                            Text__c: 'Hello',
                            Textarea_Long__c: 'HelloWorld',
                            Textarea__c: 'HelloWorld',
                            URL__c: 'https://salesforce.com/',
                            Picklist__c: 'Foo',
                            Double__c: 42.23,
                            Percent_Double__c: 78.91
                        };
                        return [4 /*yield*/, command_1.core.fs.mkdirp(outputdir)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, createUtil.getFileData(fieldDirPath, fileNames)];
                    case 3:
                        fileData = _a.sent();
                        return [4 /*yield*/, createUtil.createRecord({
                                typename: typename,
                                recname: recname,
                                label: label,
                                inputdir: inputdir,
                                outputdir: outputdir,
                                protection: protection,
                                varargs: varargs,
                                fileData: fileData
                            })];
                    case 4:
                        _a.sent();
                        field1 = createUtil.getFieldDataType(fileData, 'Check__c');
                        field2 = createUtil.getFieldDataType(fileData, 'Date_Time__c');
                        field3 = createUtil.getFieldDataType(fileData, 'Date__c');
                        field4 = createUtil.getFieldDataType(fileData, 'Email__c');
                        field5 = createUtil.getFieldDataType(fileData, 'Number_Int__c');
                        field6 = createUtil.getFieldDataType(fileData, 'Number_Int_No_Flag__c');
                        field7 = createUtil.getFieldDataType(fileData, 'Number_Double__c');
                        field8 = createUtil.getFieldDataType(fileData, 'Percent_Int__c');
                        field9 = createUtil.getFieldDataType(fileData, 'Percent_Int_No_Flag__c');
                        field10 = createUtil.getFieldDataType(fileData, 'Percent_Double__c');
                        field11 = createUtil.getFieldDataType(fileData, 'Phone__c');
                        field12 = createUtil.getFieldDataType(fileData, 'Picklist__c');
                        field13 = createUtil.getFieldDataType(fileData, 'Text__c');
                        field14 = createUtil.getFieldDataType(fileData, 'Url__c');
                        test_1.expect(field1 === 'Checkbox').to.be["true"];
                        test_1.expect(field2 === 'DateTime').to.be["true"];
                        test_1.expect(field3 === 'Date').to.be["true"];
                        test_1.expect(field4 === 'Email').to.be["true"];
                        test_1.expect(field5 === 'Number').to.be["true"];
                        test_1.expect(field6 === 'Number').to.be["true"];
                        test_1.expect(field7 === 'Number').to.be["true"];
                        test_1.expect(field8 === 'Percent').to.be["true"];
                        test_1.expect(field9 === 'Percent').to.be["true"];
                        test_1.expect(field10 === 'Percent').to.be["true"];
                        test_1.expect(field11 === 'Phone').to.be["true"];
                        test_1.expect(field12 === 'Picklist').to.be["true"];
                        test_1.expect(field13 === 'Text').to.be["true"];
                        test_1.expect(field14 === 'Url').to.be["true"];
                        return [4 /*yield*/, exec("rm -rf " + inputdir)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('createDefaultType', function () {
        test_1.test
            .withOrg({
            username: 'test@org.com'
        }, true)
            .stdout()
            .withProject()
            .command(['force:cmdt:create', '--typename', 'Default_Type', '--outputdir', 'defaultTypes'])
            .command(['force:cmdt:field:create', '--fieldname', 'Check', '--fieldtype', 'Checkbox', '--outputdir', 'defaultTypes/Default_Type__mdt'])
            .it('should handle an empty array return the field type needed to create a custom metadata type record', function () { return __awaiter(_this, void 0, void 0, function () {
            var createUtil, inputdir, field1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createUtil = new createUtil_1.CreateUtil();
                        inputdir = 'defaultTypes';
                        field1 = createUtil.getFieldPrimitiveType();
                        test_1.expect(field1 === 'string').to.be["true"];
                        return [4 /*yield*/, exec("rm -rf " + inputdir)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('createRecord', function () {
        test_1.test
            .withOrg({ username: 'test@org.com' }, true)
            .stdout()
            .withProject()
            .command(['force:cmdt:create', '--typename', 'Dir_File_Test', '--outputdir', 'dirFileTest'])
            .command(['force:cmdt:field:create', '--fieldname', 'Check', '--fieldtype', 'Checkbox', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Date', '--fieldtype', 'Date', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Date_Time', '--fieldtype', 'DateTime', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Email', '--fieldtype', 'Email', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Number_Int', '--fieldtype', 'Number', '--decimalplaces', '0', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Number_Int_No_Flag', '--fieldtype', 'Number', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Number_Double', '--fieldtype', 'Number', '--decimalplaces', '4', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int', '--fieldtype', 'Percent', '--decimalplaces', '0', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int_No_Flag', '--fieldtype', 'Percent', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Percent_Double', '--fieldtype', 'Percent', '--decimalplaces', '2', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Phone', '--fieldtype', 'Phone', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Picklist', '--fieldtype', 'Picklist', '--picklistvalues', 'Dir_File_Test', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Text', '--fieldtype', 'Text', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Textarea', '--fieldtype', 'TextArea', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Long_Textarea', '--fieldtype', 'LongTextArea', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .command(['force:cmdt:field:create', '--fieldname', 'Url', '--fieldtype', 'Url', '--outputdir', 'dirFileTest/Dir_File_Test__mdt'])
            .it('should create a customMetadata directory and a file for custom metadata type', function () { return __awaiter(_this, void 0, void 0, function () {
            var createUtil, fileWriter, typename, recname, label, protection, inputdir, outputdir, dirName, fieldDirPath, fileNames, varargs, fileData, filePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createUtil = new createUtil_1.CreateUtil();
                        fileWriter = new fileWriter_1.FileWriter();
                        typename = 'Dir_File_Test';
                        recname = 'Dir_File_Test_Record';
                        label = 'Dir File Test Record Label';
                        protection = true;
                        inputdir = 'dirFileTest';
                        outputdir = 'dirFileTest/cmdtRecords';
                        dirName = createUtil.appendDirectorySuffix(typename);
                        fieldDirPath = "" + fileWriter.createDir(inputdir) + dirName + "/fields";
                        return [4 /*yield*/, command_1.core.fs.readdir(fieldDirPath)];
                    case 1:
                        fileNames = _a.sent();
                        varargs = {
                            Check__c: true,
                            Date_Time__c: '2019-01-21T18:37:00.000Z',
                            Date__c: '2019-01-21',
                            Email__c: 'm@m.com',
                            Number__c: 42,
                            Percent__c: 29,
                            Phone__c: '423-903-0870',
                            Text__c: '',
                            Textarea_Long__c: 'HelloWorld',
                            Textarea__c: 'HelloWorld',
                            URL__c: 'https://salesforce.com/',
                            Picklist__c: 'Foo',
                            Double__c: 42.23,
                            Percent_Double__c: 78.91
                        };
                        return [4 /*yield*/, command_1.core.fs.mkdirp(outputdir)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, createUtil.getFileData(fieldDirPath, fileNames)];
                    case 3:
                        fileData = _a.sent();
                        return [4 /*yield*/, createUtil.createRecord({
                                typename: typename,
                                recname: recname,
                                label: label,
                                inputdir: inputdir,
                                outputdir: outputdir,
                                protection: protection,
                                varargs: varargs,
                                fileData: fileData
                            })];
                    case 4:
                        _a.sent();
                        filePath = outputdir + "/" + typename + "." + recname + ".md-meta.xml";
                        test_1.expect(fs.existsSync(fieldDirPath)).to.be["true"];
                        test_1.expect(fs.existsSync(filePath)).to.be["true"];
                        return [4 /*yield*/, exec("rm -rf " + inputdir)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('createFieldWithSameName', function () {
        test_1.test
            .withOrg({
            username: 'test@org.com'
        }, true)
            .stdout()
            .withProject()
            .command(['force:cmdt:create', '--typename', 'TestType', '--outputdir', 'defaultTypes'])
            .command(['force:cmdt:field:create', '--fieldname', 'myText', '--fieldtype', 'Text'])
            .command(['force:cmdt:field:create', '--fieldName', 'myText', '--fieldtype', 'TextArea'])
            .it('should create the text field on the CMT, but not the text area field; there should be an error', function () { return __awaiter(_this, void 0, void 0, function () {
            var createUtil, inputdir, field1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createUtil = new createUtil_1.CreateUtil();
                        inputdir = 'defaultTypes';
                        field1 = createUtil.getFieldPrimitiveType();
                        test_1.expect(field1 === 'string').to.be["true"];
                        test_1.expect(ctx.stderr).to.contain("The field with name 'myText' already exists.");
                        return [4 /*yield*/, exec("rm -rf " + inputdir)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
