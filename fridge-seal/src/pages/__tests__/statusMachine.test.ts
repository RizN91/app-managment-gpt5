import { describe, it, expect } from 'vitest';
import { canTransition, nextStatus } from '../../utils/statusMachine';

describe('status machine', () => {
  it('allows forward transitions', () => {
    expect(canTransition('New','Need to Measure')).toBe(true);
  });
  it('blocks after cancelled', () => {
    expect(canTransition('Cancelled','New')).toBe(false);
  });
  it('nextStatus steps forward', () => {
    expect(nextStatus('Measured')).toBe('Quoted');
  });
});