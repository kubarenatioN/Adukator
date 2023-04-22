import { Injectable } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Injectable()
export class StudentProfileService {
    
	constructor(private dataService: DataService) {

    }

	public loadAllProfiles() {}

	public loadProfile(profileId: string) {}
}
