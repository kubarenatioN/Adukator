import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
    Output,
} from '@angular/core';
import { CourseMembershipStatus } from 'src/app/typings/course.types';
import { User } from 'src/app/typings/user.types';

@Component({
	selector: 'app-course-member',
	templateUrl: './course-member.component.html',
	styleUrls: ['./course-member.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseMemberComponent {
	@Input() public user!: User;
	@Input() public status!: string;

    @Output() public enroll = new EventEmitter<number>();
    @Output() public expel = new EventEmitter<number>();
    @Output() public reject = new EventEmitter<number>();

	constructor() {}

    public onEnroll(userId: number) {
        this.enroll.emit(userId);
    }

    public onExpel(userId: number) {
        this.expel.emit(userId);
    }

    public onReject(userId: number) {
        this.reject.emit(userId);
    }
}
