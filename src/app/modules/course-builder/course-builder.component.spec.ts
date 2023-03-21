import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseBuilderComponent } from './course-builder.component';

describe('CourseBuilderComponent', () => {
  let component: CourseBuilderComponent;
  let fixture: ComponentFixture<CourseBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourseBuilderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
