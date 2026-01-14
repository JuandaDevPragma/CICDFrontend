import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import RepositoryService from './services/repository.service';

/**
 * Componente principal de la aplicación que gestiona el layout base y acciones globales.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  /** Título de la aplicación */
  title = 'pipeline';

  /**
   * Constructor del componente.
   * @param repoService Servicio para la gestión de repositorios.
   */
  constructor(private repoService: RepositoryService) {
  }

  /**
   * Refresca los datos de los repositorios a través del servicio.
   */
  refreshData(){
    this.repoService.loadData(true);
  }
}
