import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseReviewComponent } from './course-review.component';

describe('CourseReviewComponent', () => {
  let component: CourseReviewComponent;
  let fixture: ComponentFixture<CourseReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourseReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
