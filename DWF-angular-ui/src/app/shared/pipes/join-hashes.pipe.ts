import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'joinHashes',
})
export class JoinHashesPipe implements PipeTransform {
  transform(input: any): any {
    return Array.isArray(input) ? input.join(',') : input;
  }
}
