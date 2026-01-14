import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CardRepositoryComponent} from './card-repository/card-repository.component';
import {MatButtonModule} from '@angular/material/button';
import {RouterModule} from '@angular/router';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
  declarations: [CardRepositoryComponent],
  exports: [CardRepositoryComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    RouterModule
  ]
})
export class ComponentsModule { }
