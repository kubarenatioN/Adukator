import { ChartConfiguration } from "chart.js";
import { ProfileProgressTraining, Training, TrainingProfileTraining } from "src/app/typings/training.types";

export interface StudentDashboard {
	profiles: TrainingProfileTraining[],
	progress: ProfileProgressTraining[],
	overallInfoCharts: {
		config: ChartConfiguration<'doughnut', number[]> | null,
		options: {
			training: Training
		},
	}[]
}