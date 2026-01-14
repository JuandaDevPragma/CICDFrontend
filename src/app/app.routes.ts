import {Routes} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {RepositoryComponent} from './repository/repository.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: DashboardComponent
  },
  {
    path: 'Repository',
    component: RepositoryComponent
  }
];
