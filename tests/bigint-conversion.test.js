import { describe, it, expect } from 'vitest';
import { convertBigIntToString } from '../api/reports.js';

describe('BigInt to String Conversion', () => {
  it('should convert BigInt values to strings', () => {
    const bigIntValue = BigInt('9007199254740991'); // Max safe integer in JS + 1
    const result = convertBigIntToString(bigIntValue);
    
    expect(result).toBe('9007199254740991');
    expect(typeof result).toBe('string');
  });
  
  it('should handle nested BigInt values in objects', () => {
    const data = {
      id: BigInt('1234567890123456789'),
      name: 'Test',
      nested: {
        id: BigInt('9876543210987654321'),
        value: 42
      }
    };
    
    const result = convertBigIntToString(data);
    
    expect(typeof result.id).toBe('string');
    expect(result.id).toBe('1234567890123456789');
    expect(typeof result.nested.id).toBe('string');
    expect(result.nested.id).toBe('9876543210987654321');
    expect(result.name).toBe('Test');
    expect(result.nested.value).toBe(42);
  });
  
  it('should handle BigInt values in arrays', () => {
    const data = [
      BigInt('1234567890123456789'),
      'string value',
      42,
      { id: BigInt('9876543210987654321') }
    ];
    
    const result = convertBigIntToString(data);
    
    expect(typeof result[0]).toBe('string');
    expect(result[0]).toBe('1234567890123456789');
    expect(result[1]).toBe('string value');
    expect(result[2]).toBe(42);
    expect(typeof result[3].id).toBe('string');
    expect(result[3].id).toBe('9876543210987654321');
  });
  
  it('should handle null and undefined values', () => {
    const data = {
      id: BigInt('1234567890123456789'),
      nullValue: null,
      undefinedValue: undefined
    };
    
    const result = convertBigIntToString(data);
    
    expect(typeof result.id).toBe('string');
    expect(result.nullValue).toBe(null);
    expect(result.undefinedValue).toBe(undefined);
  });
  
  it('should not modify non-BigInt values', () => {
    const data = {
      string: 'test',
      number: 42,
      boolean: true,
      date: new Date('2023-01-01')
    };
    
    const result = convertBigIntToString(data);
    
    expect(result.string).toBe('test');
    expect(result.number).toBe(42);
    expect(result.boolean).toBe(true);
    expect(result.date).toBeInstanceOf(Date);
  });
});