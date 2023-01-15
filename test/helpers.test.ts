import { IdentifierMeta, getIdentifier } from '../utils';

describe('getIdentifier', () => {
  const examples: IdentifierMeta[] = [
    { name: 'abc', themeSuffix: 'Baseline' },
    { name: 'abc', themeSuffix: 'Outline' },
    { name: 'abc', themeSuffix: 'Round' },
    { name: 'abc', themeSuffix: 'Sharp' },
    { name: 'abc', themeSuffix: 'TwoTone' },

    { name: 'test', themeSuffix: void 0 },
    { name: 'test', themeSuffix: '' as any },
    { name: `__test_what's that??`, themeSuffix: 'Baseline' }
  ];

  it('should computed identifiers correctly.', () => {
    expect(examples.map((meta) => getIdentifier(meta))).toStrictEqual([
      'AbcBaseline',
      'AbcOutline',
      'AbcRound',
      'AbcSharp',
      'AbcTwoTone',
      'Test',
      'Test',
      'TestWhatsThatBaseline'
    ]);
  });
});
