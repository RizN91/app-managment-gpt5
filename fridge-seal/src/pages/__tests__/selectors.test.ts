import { describe, it, expect } from 'vitest';
import { allStatuses } from '../../utils/statusMachine';

describe('selectors', () => {
  it('has statuses ordered', () => {
    expect(allStatuses[0]).toBe('New');
  });
});