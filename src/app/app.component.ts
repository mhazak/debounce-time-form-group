import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PersonTypeEnum } from './person-type.enum';
import { Observable, debounceTime, map, merge, of, switchMap } from 'rxjs';
import { Person } from './result';
import { ResultService } from './result.service';

enum LoadingState {
  INIT = 'INIT',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly personTypeEnum = PersonTypeEnum;
  readonly LOADING = LoadingState.LOADING;

  formGroup = new FormGroup({
    personTypeGroup: new FormGroup({
      type: new FormControl<PersonTypeEnum | null>(null, Validators.required),
    }),
    inputsGroup: new FormGroup({
      name: new FormControl<NonNullable<string>>(''),
      surname: new FormControl<NonNullable<string>>(''),
    }),
  });

  get inputsGroup() {
    return this.formGroup.controls.inputsGroup;
  }
  get personType() {
    return this.formGroup.controls.personTypeGroup.controls.type;
  }

  vm$!: Observable<{ loadingState: LoadingState; data: Person[] }>;
  displayedColumns: (keyof Person)[] = ['name', 'surname', 'type'];

  constructor(private readonly resultService: ResultService) {}

  ngOnInit(): void {
    // isolate only inputs changes
    const inputChanges$ = this.inputsGroup.valueChanges.pipe(
      debounceTime(1000), // debounce them 1000ms
      map((inputsValue) => ({ ...inputsValue, type: this.personType.value })) // we need also personType, merge object
    );

    // personType changes
    const personTypeChanges$ = this.personType.valueChanges.pipe(
      map((type) => ({ type, ...this.inputsGroup.value })) // merge object with the rest of form values
    );

    // create merged stream
    const formValueChanges$ = merge(inputChanges$, personTypeChanges$);

    const searchResult$ = formValueChanges$.pipe(
      switchMap((formValue) => {
        if (!formValue.type) {
          return of({
            data: [],
            loadingState: LoadingState.LOADED,
          });
        }
        return this.resultService.getResult(formValue as Partial<Person>).pipe(
          map((value) => {
            return {
              data: value,
              loadingState: LoadingState.LOADED,
            };
          })
        );
      })
    );

    this.vm$ = merge(
      formValueChanges$.pipe(
        map(() => ({
          loadingState: LoadingState.LOADING,
          data: [],
        }))
      ),
      searchResult$
    );
  }
}
