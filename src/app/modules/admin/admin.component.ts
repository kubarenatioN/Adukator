import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { Course } from 'src/app/typings/course.types';

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent implements OnInit {
    public courses$!: Observable<Course[]>

	constructor(private adminService: AdminService) {
    }

	ngOnInit(): void {
		this.courses$ = this.adminService.courses$;
	}

    public publishCourse(id: number) {
        
    }
}
