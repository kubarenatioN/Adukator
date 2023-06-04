import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '../services/config.service';

@Pipe({
  name: 'competency'
})
export class CompetencyPipe implements PipeTransform {

  constructor(private configService: ConfigService) {

  }

  transform(compId: string): string {
    return this.configService.competencies.find(c => c.id === compId)?.label ?? compId    
  }

}
