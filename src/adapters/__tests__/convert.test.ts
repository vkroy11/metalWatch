import { OUNCE_TO_GRAM, applyPurity, ouncesToGrams, rateToPurityAdjustedGram } from '../convert';

describe('convert', () => {
  test('ouncesToGrams divides by 31.1035', () => {
    expect(ouncesToGrams(445557.70)).toBeCloseTo(445557.70 / OUNCE_TO_GRAM, 2);
  });

  test('applyPurity 24K is identity', () => {
    expect(applyPurity(1000, '24K')).toBe(1000);
  });

  test('applyPurity 22K multiplies by 22/24', () => {
    expect(applyPurity(14324.80, '22K')).toBeCloseTo(14324.80 * (22 / 24), 2);
  });

  test('applyPurity 18K multiplies by 18/24', () => {
    expect(applyPurity(14324.80, '18K')).toBeCloseTo(14324.80 * 0.75, 2);
  });

  test('rateToPurityAdjustedGram composes both ops', () => {
    expect(rateToPurityAdjustedGram(445557.70, '22K')).toBeCloseTo(
      (445557.70 / OUNCE_TO_GRAM) * (22 / 24),
      2,
    );
  });
});
