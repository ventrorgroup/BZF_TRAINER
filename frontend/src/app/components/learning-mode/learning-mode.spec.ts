import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningMode } from './learning-mode';

describe('LearningMode', () => {
  let component: LearningMode;
  let fixture: ComponentFixture<LearningMode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningMode],
    }).compileComponents();

    fixture = TestBed.createComponent(LearningMode);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
