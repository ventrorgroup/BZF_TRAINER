import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamSimulation } from './exam-simulation';

describe('ExamSimulation', () => {
  let component: ExamSimulation;
  let fixture: ComponentFixture<ExamSimulation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamSimulation],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamSimulation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
