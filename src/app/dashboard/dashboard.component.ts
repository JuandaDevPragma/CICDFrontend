import {Component, OnInit} from '@angular/core';
import {Params, RepoDetailResponse} from '../types/Types';
import {ComponentsModule} from '../components/components.module';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import RepositoryService from '../services/repository.service';

/**
 * Componente de tablero principal que muestra la lista de repositorios.
 * Incluye funcionalidades de filtrado y carga de datos.
 */
@Component({
  selector: 'app-dashboard',
  imports: [ComponentsModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  /** Lista completa de repositorios obtenida del servicio */
  data: RepoDetailResponse[] = [];
  /** Lista filtrada de repositorios que se muestra en la interfaz */
  temp: RepoDetailResponse[] = [];
  /** Parámetros globales de configuración */
  params: Params = {} as Params;
  /** Valor del filtro de búsqueda */
  value: string = '';

  /**
   * Constructor del componente.
   * @param repoService Servicio para la gestión de datos de repositorios.
   */
  constructor(private repoService: RepositoryService) {
  }

  /**
   * Inicializa el componente, suscribiéndose a los cambios de datos de repositorios.
   */
  async ngOnInit() {
    this.repoService.onRefresh().subscribe({
      next: res => {
        this.data = res.repos;
        this.params = res.params;
        this.temp = this.data;
      },
      error: () => {
        this.data = [];
        this.temp = [];
      }
    });
    this.repoService.loadData(false);
  }

  /**
   * Función para optimizar el renderizado de la lista de repositorios.
   * @param index Índice del elemento en la lista.
   * @param repo Detalle del repositorio.
   * @returns Identificador único para el repositorio.
   */
  trackByRepoId(index: number, repo: RepoDetailResponse) {
    return repo.props.app + '-' + index; // garantizado único
  }


  /**
   * Filtra los datos de los repositorios basándose en el valor de búsqueda ingresado.
   */
  filterData(): void {
    if (this.value != '') {
      this.temp = this.data.filter(p => p.props.app.toLowerCase().includes(this.value.toLowerCase()))
    } else {
      this.temp = this.data;
    }
  }
}
