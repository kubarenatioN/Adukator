import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
    Output,
} from '@angular/core';
import { TrainingProfile } from 'src/app/typings/training.types';
import { User } from 'src/app/typings/user.types';

@Component({
	selector: 'app-course-member',
	templateUrl: './course-member.component.html',
	styleUrls: ['./course-member.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseMemberComponent {
	@Input() public profile!: TrainingProfile;
	@Input() public status!: string;

    @Output() public enroll = new EventEmitter<TrainingProfile>();
    @Output() public expel = new EventEmitter<TrainingProfile>();
    @Output() public reject = new EventEmitter<TrainingProfile>();

	constructor() {}

    public onEnroll() {
        this.enroll.emit(this.profile);
    }

    public onExpel() {
        this.expel.emit(this.profile);
    }

    public onReject() {
        this.reject.emit(this.profile);
    }
}
