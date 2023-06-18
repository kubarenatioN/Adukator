import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';
import { BehaviorSubject, Observable, filter, map, shareReplay, switchMap } from 'rxjs';
import { CoursesSelectFields } from 'src/app/config/course-select-fields.config';
import { StudentCharts } from 'src/app/helpers/charts.config';
import { TrainingDataService } from 'src/app/services/training-data.service';
import { UserService } from 'src/app/services/user.service';
import { ModuleTopic } from 'src/app/typings/course.types';
import { ProfileProgress, TrainingProfileTraining } from 'src/app/typings/training.types';
import { UserTrainingResults } from 'src/app/typings/user.types';

type ProgressMode = 'overall' | 'training'

@Component({
  selector: 'app-student-progress',
  templateUrl: './student-progress.component.html',
  styleUrls: ['./student-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentProgressComponent implements OnInit {
  private resultsStore$ = new BehaviorSubject<ProfileProgress[]>([]);

  private progress: ProfileProgress[] = []
  private results: ProfileProgress[] = []

  public chartsStore$ = new BehaviorSubject<{
    modulesProgress: {
      config: ChartConfiguration<'bar', number[]>,
      options: {},
    } | null,
    modulesTimeProgress: {
      config: ChartConfiguration<'bar', number[]>,
      options: {},
    } | null,
    courseTopicsRatio: {
      config: ChartConfiguration<'bar', number[]>,
      options: {},
    } | null,
    tasksRadar: {
      config: ChartConfiguration<'polarArea', number[]>,
      options: {},
    } | null,
    overallTrainings: {
      config: ChartConfiguration<'line', number[]>,
      options: {},
    } | null,
  }>({
    modulesProgress: null,
    modulesTimeProgress: null,
    courseTopicsRatio: null,
    tasksRadar: null,
    overallTrainings: null,
  })

  public modeForm;
  public trainingForm;
  public overallForm;
  public profiles$!: Observable<TrainingProfileTraining[]>;
  public chartView$ = new BehaviorSubject<null | 
    'module|progress' | 
    'module|time-progress' |
    'course|topics-ratio' | 
    'topic|tasks-radar' | 
    'overall|all-trainings' 
  >(null)
  public results$ = this.resultsStore$.asObservable().pipe(
    shareReplay(1)
  )
  public profiles: TrainingProfileTraining[] = []

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private trainingDataService: TrainingDataService,
  ) {
    this.modeForm = this.fb.group<{
      mode: ProgressMode | null
    }>({
      mode: null,
    })

    this.trainingForm = this.fb.group<{
      profile: TrainingProfileTraining | null
      level: 'course' | 'module' | 'topic'
      courseType: 'topics-ratio'
      module: string | null
      topic: ModuleTopic | null
      moduleType: 'progress' | 'time-progress'
      topicType: 'done-overdue'
    }>({
      profile: null,
      level: 'course',
      courseType: 'topics-ratio',
      module: null,
      topic: null,
      moduleType: 'progress',
      topicType: 'done-overdue',
    })

    this.overallForm = this.fb.group<{
      results: UserTrainingResults[] | null
    }>({
      results: null,
    })

  }

  ngOnInit(): void {
    this.profiles$ = this.getProfiles()

    this.trainingForm.controls.profile.valueChanges.pipe(
      filter(Boolean),
      switchMap(profile => {
        return this.getProfileProgress(profile._id)
      }),
    ).subscribe(progress => {
      this.progress = progress
    })

    this.trainingForm.valueChanges.subscribe(model => {
      this.getChartConfig(model)      
    })

    this.modeForm.valueChanges.subscribe(res => {
      if (res.mode === 'overall') {
        this.getOverallChartConfig()
      }
    })

    this.getTrainingsResults().subscribe(res => {
      this.results = res;
      this.resultsStore$.next(res)
    })

    this.getProfiles().subscribe(profiles => {
      this.profiles = profiles
    })
  }

  private getProfiles() {
    return this.userService.user$.pipe(
      switchMap(user => {
        return this.trainingDataService.getStudentProfiles(user._id, CoursesSelectFields.Modules)
      }),
      map(res => {
        return res.profiles ?? []
      })
    )
  }

  private getProfileProgress(profileId: string) {
    return this.trainingDataService.getProfileProgress(profileId)
  }

  private getTrainingsResults() {
    return this.userService.user$.pipe(
      switchMap(user => {
        return this.trainingDataService.getUserTrainingResults(user._id)
      })
    )
  }

  private getChartConfig(model: typeof this.trainingForm.value) {
    const { profile, module, moduleType, level, courseType, topicType, topic } = model
    if (!profile) {
      return;
    }

    if (level === 'module' && module && moduleType) {
      
      switch (moduleType) {
        case 'progress': {
          this.chartView$.next('module|progress')
          const { config } = StudentCharts.moduleProgress(profile.training, this.progress)
          console.log(config);
          this.chartsStore$.next({
              ...this.chartsStore$.value,
              modulesProgress: {
                config,
                options: {
                  indexAxis: 'y',
                }
              }
          })
          return;
        }

        case 'time-progress': {
          this.chartView$.next('module|time-progress')
          const { config } = StudentCharts.moduleTimeProgress(profile.training, this.progress)
          console.log(config);
          this.chartsStore$.next({
              ...this.chartsStore$.value,
              modulesTimeProgress: {
                config,
                options: {},
              }
          })
          return;
        }
      
        default:
          this.chartView$.next(null)
          return;
      }
    }

    if (level === 'topic' && topic && topicType) {
      this.chartView$.next('topic|tasks-radar')
          const { config } = StudentCharts.tasksRadar(topic.id, profile.training, this.progress)
          this.chartsStore$.next({
            ...this.chartsStore$.value,
            tasksRadar: {
              config,
              options: {}
            }
          })
    }

    if (level === 'course' && courseType) {

      switch (courseType) {
        case 'topics-ratio': {
          this.chartView$.next('course|topics-ratio')
          const { config } = StudentCharts.courseTopicsRatio(profile.training, this.progress)
          this.chartsStore$.next({
            ...this.chartsStore$.value,
            courseTopicsRatio: {
              config,
              options: {
                scales: {
                    x: {
                      stacked: true
                    },
                    y: {
                      stacked: true
                    }
                }
              }
            }
          })
          return;
        }
                
        default:
          this.chartView$.next(null)
          return;
      }

    }
  }

  private getOverallChartConfig() {
    this.chartView$.next('overall|all-trainings')
    const { config } = StudentCharts.overallChart(this.profiles, this.results)
    console.log(config);
    this.chartsStore$.next({
        ...this.chartsStore$.value,
        overallTrainings: {
          config,
          options: {},
        }
    })
  }
}
