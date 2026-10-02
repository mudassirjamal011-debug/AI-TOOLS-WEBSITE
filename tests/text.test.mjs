import test from 'node:test';
import assert from 'node:assert/strict';

import {
  countWords,
  countSentences,
  countParagraphs,
  textStats,
  wordFrequency,
  toTitleCase,
  toSentenceCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toAlternatingCase,
  removeDuplicateLines,
  removeExtraSpaces,
  removeEmptyLines,
  sortLines,
  reverseLines,
  reverseText,
  removeLineBreaks,
  slugify,
  formatJson,
  minifyJson,
  validateJson,
  parseCsv,
  csvToJson,
  jsonToCsv,
  encodeBase64,
  decodeBase64,
  generateLorem,
  generatePassword,
  passwordEntropy,
  testRegex,
} from '../lib/text.ts';

test('word, sentence and paragraph counting', () => {
  assert.equal(countWords('one two three'), 3);
  assert.equal(countWords(''), 0);
  assert.equal(countWords('   '), 0);
  assert.equal(countWords('state-of-the-art'), 1);
  assert.equal(countWords('a — b'), 2, 'punctuation-only tokens are ignored');
  assert.equal(countSentences('One. Two! Three?'), 3);
  assert.equal(countSentences(''), 0);
  assert.equal(countParagraphs('a\n\nb\n\nc'), 3);
  assert.equal(countParagraphs('a\nb'), 1);
});

test('textStats reports characters, unique words and reading time', () => {
  const stats = textStats('Hello world.\n\nThis is a test of the counter.');
  assert.equal(stats.words, 9);
  assert.equal(stats.paragraphs, 2);
  assert.equal(stats.sentences, 2);
  assert.equal(stats.characters, 44);
  assert.equal(stats.charactersNoSpaces, 35);
  assert.equal(stats.readingMinutes, 1);
  assert.equal(stats.uniqueWords, 9);
});

test('wordFrequency ranks repeated words and skips stop words', () => {
  const frequency = wordFrequency('the cat sat on the mat and the cat slept', 3);
  assert.equal(frequency[0].word, 'cat');
  assert.equal(frequency[0].count, 2);
  assert.ok(!frequency.some((entry) => entry.word === 'the'));
});

test('case conversions', () => {
  assert.equal(toTitleCase('the lord of the rings'), 'The Lord of the Rings');
  assert.equal(toTitleCase('an "example" of (title) case'), 'An "Example" of (Title) Case');
  assert.equal(toSentenceCase('hello WORLD. this IS a TEST.'), 'Hello WORLD. This IS a TEST.');
  assert.equal(toSentenceCase('we USE PDF files EVERY day. do you?'), 'We USE PDF files EVERY day. Do you?');
  assert.equal(toCamelCase('hello world foo-bar'), 'helloWorldFooBar');
  assert.equal(toPascalCase('hello world'), 'HelloWorld');
  assert.equal(toSnakeCase('Hello World'), 'hello_world');
  assert.equal(toKebabCase('Hello World'), 'hello-world');
  assert.equal(toAlternatingCase('abcd'), 'aBcD');
});

test('text formatting operations', () => {
  assert.equal(removeExtraSpaces('a    b   c'), 'a b c');
  assert.equal(removeEmptyLines('a\n\n\nb'), 'a\nb');
  assert.equal(removeDuplicateLines('a\nb\na\nc'), 'a\nb\nc');
  assert.equal(removeDuplicateLines('A\na', false), 'A');
  assert.equal(sortLines('b\nA\nc'), 'A\nb\nc');
  assert.equal(sortLines('b\nA\nc', true), 'c\nb\nA');
  assert.equal(reverseLines('a\nb\nc'), 'c\nb\na');
  assert.equal(reverseText('abc'), 'cba');
  assert.equal(removeLineBreaks('a\nb'), 'a b');
  assert.equal(slugify('Héllo Wörld! 2026'), 'hello-world-2026');
});

test('JSON formatting, minifying and validation', () => {
  const formatted = formatJson('{"a":1,"b":[1,2]}');
  assert.equal(formatted.ok, true);
  assert.equal(formatted.value, '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');

  const minified = minifyJson('{ "a" : 1 }');
  assert.equal(minified.value, '{"a":1}');

  assert.equal(validateJson('{"a":1}').ok, true);

  const invalid = validateJson('{"a":1,}');
  assert.equal(invalid.ok, false);
  assert.ok(invalid.error.length > 0);
  assert.equal(invalid.line, 1);
  assert.equal(invalid.column, 8);

  const empty = formatJson('   ');
  assert.equal(empty.ok, false);
  assert.match(empty.error, /Nothing to format/);

  const duplicates = formatJson('{"a":1,"a":2}');
  assert.ok(duplicates.warnings?.length, 'duplicate keys are reported');
});

test('CSV parsing handles quotes, delimiters and type inference', () => {
  assert.deepEqual(parseCsv('a,b\n"c,d",e'), [
    ['a', 'b'],
    ['c,d', 'e'],
  ]);
  assert.deepEqual(parseCsv('a;b\n1;2', ';'), [
    ['a', 'b'],
    ['1', '2'],
  ]);
  assert.deepEqual(parseCsv('a,b\n"say ""hi""",2'), [
    ['a', 'b'],
    ['say "hi"', '2'],
  ]);

  const converted = csvToJson('name,age,active\n"Ana, Maria",30,true\nBob,25,false');
  assert.deepEqual(converted.headers, ['name', 'age', 'active']);
  assert.deepEqual(converted.objects, [
    { name: 'Ana, Maria', age: 30, active: true },
    { name: 'Bob', age: 25, active: false },
  ]);

  const noTypes = csvToJson('v\n1', { inferTypes: false });
  assert.equal(noTypes.objects[0].v, '1');

  const withoutHeader = csvToJson('1,2', { hasHeader: false });
  assert.deepEqual(withoutHeader.headers, ['column_1', 'column_2']);

  const back = jsonToCsv('[{"a":1,"b":"x, y"},{"a":2,"b":"z"}]');
  assert.equal(back.csv, 'a,b\n1,"x, y"\n2,z');

  const bad = jsonToCsv('{not json}');
  assert.ok(bad.error);
});

test('Base64 round-trips UTF-8 text', () => {
  const input = 'héllo ✓ — 日本語';
  const encoded = encodeBase64(input);
  assert.equal(decodeBase64(encoded), input);

  const urlSafe = encodeBase64('a??b>>c', true);
  assert.ok(!urlSafe.includes('+') && !urlSafe.includes('/') && !urlSafe.includes('='));
  assert.equal(decodeBase64(urlSafe, true), 'a??b>>c');

  assert.equal(decodeBase64('data:image/png;base64,aGk='), 'hi');
});

test('Lorem ipsum generator honours the unit and classic start', () => {
  const words = generateLorem(12, 'words');
  assert.ok(words.startsWith('Lorem ipsum dolor sit amet'));
  assert.ok(words.split(/\s+/).length >= 12);

  const sentences = generateLorem(3, 'sentences');
  assert.equal(sentences.split('. ').length >= 3, true);

  const paragraphs = generateLorem(2, 'paragraphs');
  assert.equal(paragraphs.split('\n\n').length, 2);
});

test('password generator respects length, character sets and entropy', () => {
  const password = generatePassword({
    length: 20,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  assert.equal(password.length, 20);
  assert.ok(/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password));
  assert.ok(passwordEntropy(password) > 100);

  const digitsOnly = generatePassword({
    length: 10,
    lowercase: false,
    uppercase: false,
    numbers: true,
    symbols: false,
    excludeAmbiguous: true,
  });
  assert.match(digitsOnly, /^[2-9]{10}$/);

  const two = generatePassword({
    length: 12,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  assert.notEqual(password, two, 'successive passwords differ');
});

test('regex tester reports matches, groups and replacements', () => {
  const result = testRegex('(\\w+)@(\\w+)', 'gi', 'mail a@b.com or c@d.org', '[$1]');
  assert.equal(result.error, undefined);
  assert.equal(result.count, 2);
  assert.deepEqual(result.matches[0].groups, ['a', 'b']);
  assert.equal(result.replaced, 'mail [a].com or [c].org');

  const named = testRegex('(?<user>\\w+)@', 'g', 'hi ada@', '<$<user>>');
  assert.deepEqual({ ...named.matches[0].namedGroups }, { user: 'ada' });
  assert.equal(named.replaced, 'hi <ada>');

  const broken = testRegex('([', 'g', 'x');
  assert.ok(broken.error, 'invalid patterns surface an error');

  const noGlobal = testRegex('o', '', 'foo');
  assert.equal(noGlobal.count >= 1, true);
});
