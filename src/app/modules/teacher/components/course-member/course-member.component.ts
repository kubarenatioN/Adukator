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

    @Output() public enroll = new EventEmitter<string>();
    @Output() public expel = new EventEmitter<string>();
    @Output() public reject = new EventEmitter<string>();

	constructor() {}

    public onEnroll(userId: string) {
        this.enroll.emit(userId);
    }

    public onExpel(userId: string) {
        this.expel.emit(userId);
    }

    public onReject(userId: string) {
        this.reject.emit(userId);
    }
}
