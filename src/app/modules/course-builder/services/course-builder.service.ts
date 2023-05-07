import { Injectable } from '@angular/core';
import { of, ReplaySubject, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { getEmptyCourseFormData, isEmptyCourseFormData } from 'src/app/constants/common.constants';
import { convertCourseFormDataToCourse, convertCourseFormDataToCourseReview, generateUUID, removeComments } from 'src/app/helpers/courses.helper';
import { AdminCoursesService } from 'src/app/services/admin-courses.service';
import { CoursesService } from 'src/app/services/courses.service';
import { UploadPathSegment, UploadService } from 'src/app/services/upload.service';
import { UserService } from 'src/app/services/user.service';
import { CourseBuilderViewData, CourseBuilderViewType, CourseFormData, CourseFormMetadata, CourseFormViewMode, CourseReview, CourseReviewStatus, ModuleTopic } from 'src/app/typings/course.types';
import { User } from 'src/app/typings/user.types';

@Injectable()
export class CourseBuilderService {
    private viewDataStore$ = new ReplaySubject<CourseBuilderViewData>(1);
    private courseMetadata!: CourseFormMetadata;

	public courseId: string;

    public get metadata() {
        return this.courseMetadata
    }

    public viewData$ = this.viewDataStore$.asObservable().pipe(
        shareReplay(1)
    )

	constructor(
		private userService: UserService,
		private coursesService: CoursesService,
		private adminCoursesService: AdminCoursesService,
        private uploadService: UploadService,
    ) {
        this.courseId = generateUUID()
    }

    public getFormData(courseId: string, mode: CourseFormViewMode) {
        return this.userService.user$.pipe(
            switchMap((user) => {                
                return this.getCourse(mode, courseId, user)
            }),
            shareReplay(1),
        )
    }

    public setViewData(navQuery: { type: CourseBuilderViewType; module?: string; topic?: string; }, mode: CourseFormViewMode) {
        const viewData = {
            viewPath: { ...navQuery },
            mode,
            metadata: this.metadata,
        }
        this.viewDataStore$.next(viewData)
    }

    public publishCourse(formData: CourseFormData) {
        if (!this.courseMetadata) {
            return throwError(() => new Error('Metadata required to pubslish course.'))
        }
        formData = this.restoreCourseMetadata(formData, this.courseMetadata)
        let courseData = convertCourseFormDataToCourse(formData)
        courseData = removeComments(courseData)
        const masterId = formData.metadata.masterCourseId || formData.metadata.uuid

        // regenerate new UUID for course after publishing current one
        this.courseId = generateUUID();

        console.log('Course publishing has just started. Please wait...');
        const rootCourseId = this.metadata.masterCourseId ?? this.metadata.uuid
        
        return this.uploadService.moveFilesToRemote({
            fromFolder: `review/${rootCourseId}`,
            toFolder: `course/${rootCourseId}`,
            subject: 'course:build',
        }).pipe(
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
            return throwError(() => new Error('No metadata provided for new course version.'))
        }
        
        this.restoreCourseMetadata(formData, this.courseMetadata);
        const courseData = convertCourseFormDataToCourseReview(formData);
        
        // TODO: Uncomment method below
        return this.coursesService.createCourseReviewVersion(courseData, { isMaster })
    }

    public saveCourseReview(comments: { overallComments: unknown; modules: unknown }) {
        const id = this.courseMetadata?._id;
        if (!id) {
            return throwError(() => new Error('No _id provided to save review'))
        }
        return this.adminCoursesService.saveCourseReview(id, comments)
    }

    public getCourse(mode: CourseFormViewMode, courseId: string, author: User) {
        return of(null).pipe(
            switchMap(() => {
                if (mode === CourseFormViewMode.Create) {
                    this.courseMetadata = this.getMasterCourseMetadata(courseId, author.uuid)
                    return of(getEmptyCourseFormData(courseId));
                }

                if (mode === CourseFormViewMode.Review) {
                    return this.adminCoursesService.getCourseReviewVersion(courseId);
                }
                else if (mode === CourseFormViewMode.Edit) {
                    return this.coursesService.getCourseReviewVersion(courseId);
                } 
                else {
                    throw new Error('Cannot get course')
                }
            }),
            tap(course => {
                if (!isEmptyCourseFormData(course)) {
                    this.courseMetadata = this.cloneParentCourseMetadata(course)
                }
            })
        )
    }

    public getUploadFolder(segments: UploadPathSegment[], controlId: string) {
        const rootCourseId = this.metadata.masterCourseId === null ? this.metadata.uuid : this.metadata.masterCourseId
        return this.uploadService.getFilesFolder('review', rootCourseId, ...segments, controlId)
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
