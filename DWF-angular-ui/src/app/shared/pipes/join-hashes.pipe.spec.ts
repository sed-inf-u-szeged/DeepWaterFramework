import { JoinHashesPipe } from './join-hashes.pipe';

describe('JoinHashesPipe', () => {
  it('create an instance', () => {
    const pipe = new JoinHashesPipe();
    expect(pipe).toBeTruthy();
  });

  it('should join array', () => {
    const pipe = new JoinHashesPipe();
    expect(pipe.transform(['1', 2, '3'])).toBe('1,2,3');
  });

  it('should not join if input is not array', () => {
    const pipe = new JoinHashesPipe();
    expect(pipe.transform('123')).toBe('123');
  });
});
