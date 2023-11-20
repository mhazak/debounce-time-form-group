import { Injectable } from '@angular/core';
import { Person, persons } from './result';
import { Observable, delay, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResultService {
  constructor() {}

  getResult(form: Partial<Person>): Observable<typeof persons> {
    return of(persons).pipe(
      delay(500),
      map((result) => {
        return result.filter((person) => {
          if (form.name?.toLowerCase()) {
            if (!person.name.toLowerCase().includes(form.name)) {
              return;
            }
          }
          if (form.surname?.toLowerCase()) {
            if (!person.surname.toLowerCase().includes(form.surname)) {
              return;
            }
          }
          if (form.type) {
            if (!person.type.includes(form.type)) {
              return;
            }
          }
          return person;
        });
      })
    );
  }
}
