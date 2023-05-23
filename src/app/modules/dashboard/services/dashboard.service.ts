import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ProfileProgress, ProfileProgressTraining, TrainingProfileTraining } from 'src/app/typings/training.types';
import { DATA_ENDPOINTS } from 'src/app/constants/network.constants';
import { DashboardCharts } from 'src/app/helpers/charts.config';

@Injectable()
export class DashboardService {
	constructor(
		private dataService: DataService,
	) {

	}

	public getDashboard(studentId: string) {
		return this.dataService.http.get<{ data: { profiles: TrainingProfileTraining[], progress: ProfileProgress[] } }>(`${DATA_ENDPOINTS.user}/${studentId}/dashboard`)
			.pipe(map(res => {
				const profiles = res.data.profiles
				const progress = res.data.progress.map(progress => {
					return {
						...progress,
						profile: res.data.profiles.find(p => p._id === progress.profile)
					}
				})
				const overallInfoCharts = this.getTrainingOverallChartConfigs(profiles, progress)
				return {
					profiles,
					progress,
					overallInfoCharts, 
				}
			}))
	}

	private getTrainingOverallChartConfigs(profiles: TrainingProfileTraining[], progress: ProfileProgressTraining[]) {
		const trainingsProgress = profiles
			.map(profile => progress.filter(p => p.profile?._id === profile._id))
			.filter(arr => arr.length > 0)
			
		const configs = trainingsProgress
			.map((progress, i) => {
				return {
					config: DashboardCharts.getTrainingProgressChartConfig(progress),
					options: {
						training: profiles[i].training
					},
				}
			})

		return configs
	}
}
