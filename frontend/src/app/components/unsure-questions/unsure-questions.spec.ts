import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsureQuestions } from './unsure-questions';

describe('UnsureQuestions', () => {
  let component: UnsureQuestions;
  let fixture: ComponentFixture<UnsureQuestions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnsureQuestions],
    }).compileComponents();

    fixture = TestBed.createComponent(UnsureQuestions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
