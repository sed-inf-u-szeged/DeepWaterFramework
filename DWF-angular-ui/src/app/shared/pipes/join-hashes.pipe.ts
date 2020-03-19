import { Pipe, PipeTransform } from '@angular/core';

/** A pipe that joins an array with ',' character or if it's not an array then just return it. */
@Pipe({ name: 'joinHashes' })
export class JoinHashesPipe implements PipeTransform {
  /**
   * Joins an array with ',' character, or just returns the parameter if its not an array.
   * @param input The array to join.
   * @returns The joined string or the input parameter if it was not an array.
   */
  transform(input: any): any {
    return Array.isArray(input) ? input.join(',') : input;
  }
}
