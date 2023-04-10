import { Injectable } from '@angular/core';
import { Observable, of, switchMap, tap } from 'rxjs';
import { getEmptyCourseFormData } from 'src/app/constants/common.constants';
import { convertCourseFormDataToCourse, convertCourseFormDataToCourseReview, generateUUID } from 'src/app/helpers/courses.helper';
import { AdminCoursesService } from 'src/app/services/admin-courses.service';
import { CoursesService } from 'src/app/services/courses.service';
import { TeacherCoursesService } from 'src/app/services/teacher-courses.service';
import { UploadService } from 'src/app/services/upload.service';
import { CourseFormData, CourseFormMetadata, CourseFormViewMode, CourseReview, CourseReviewStatus } from 'src/app/typings/course.types';
import { User } from 'src/app/typings/user.types';

@Injectable()
export class CourseBuilderService {
    private courseMetadata!: CourseFormMetadata;
	public courseId: string;

    public get metadata() {
        return this.courseMetadata
    }

	constructor(
		private coursesService: CoursesService,
		private teacherCoursesService: TeacherCoursesService,
		private adminCoursesService: AdminCoursesService,
        private uploadService: UploadService,
    ) {
        this.courseId = generateUUID()
    }

    public publishCourse(formData: CourseFormData) {
        if (!this.courseMetadata) {
            console.warn('Metadata required to pubslish course.');
            return of();
        }
        formData = this.restoreCourseMetadata(formData, this.courseMetadata)
        const courseData = convertCourseFormDataToCourse(formData)
        const masterId = formData.metadata.masterCourseId || formData.metadata.uuid

        // Show upload, then redirect. Create course in background
        console.log('Course is publishing. Please wait...');
        const rootCourseId = this.metadata.masterCourseId ?? this.metadata.uuid
        return this.uploadService.moveFilesToRemote(rootCourseId).pipe(
            tap(upload => {
                console.log('Uploaded files to remote', upload);
            }),
            switchMap(upload => {
                courseData.uuid = masterId // Adjust course ID after review
                return this.adminCoursesService.publish(courseData, masterId)
            }),
            tap(() => {
                console.log('Course published!');
            })
        )
    }

    public createCourseReviewVersion({ formData, isMaster }: { formData: CourseFormData, isMaster: boolean }) {
        if (!this.courseMetadata) {
            console.log('No metadata provided for new course version.');
            return of(null)
        }
        
        this.restoreCourseMetadata(formData, this.courseMetadata);
        const courseData = convertCourseFormDataToCourseReview(formData);
        
        // TODO: Uncomment method below
        return this.coursesService.createCourseReviewVersion(courseData, { isMaster })
    }

    public saveCourseReview(comments: { overallComments: unknown; modules: unknown }) {
        const id = this.courseMetadata?._id;
        if (!id) {
            console.error('No _id provided to save review');
            return of(null);
        }
        return this.adminCoursesService.saveCourseReview(id, comments)
    }

    public getCourse(mode: CourseFormViewMode, courseId: string, author: User) {
        if (mode === CourseFormViewMode.Create) {
            this.courseMetadata = this.getMasterCourseMetadata(this.courseId, author.uuid)
            return of(getEmptyCourseFormData(courseId));
        }

        let course$: Observable<CourseReview>
        if (mode === CourseFormViewMode.Review) {
            course$ = this.adminCoursesService.getCourseReviewVersion(courseId);
        }
        else if (mode === CourseFormViewMode.Edit) {
            course$ = this.teacherCoursesService.getCourseReviewVersion(courseId);
        } 
        else {
            throw new Error('Cannot get course')
        }
        course$ = course$.pipe(
            tap(course => {
                this.courseMetadata = this.cloneParentCourseMetadata(course)
            })
        )
        return course$
    }

    public getUploadFolder(type: 'tasks' | 'topics', controlId: string) {
        const rootCourseId = this.metadata.masterCourseId === null ? this.metadata.uuid : this.metadata.masterCourseId
        return this.uploadService.getFilesFolder(rootCourseId, type, controlId)
    }

    private restoreCourseMetadata(formData: CourseFormData, metadata: CourseFormMetadata): CourseFormData {
        formData.metadata = metadata
        return formData
    }

    private getMasterCourseMetadata(courseId: string, authorId: string): CourseFormMetadata {
        return {
            uuid: courseId,
            authorId,
            masterCourseId: null,
            status: CourseReviewStatus.Default
        }
    }

    private cloneParentCourseMetadata(parentCourse: CourseReview): CourseFormMetadata {
        return {
            _id: parentCourse._id,
            uuid: generateUUID(),
            authorId: parentCourse.authorId,
            masterCourseId: parentCourse.masterId === null ? parentCourse.uuid : parentCourse.masterId, // all the versions point to the most first course version, the first one points to null
            status: parentCourse.status
        }
    }
}
