import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {Params, RepoDetailResponse, RequestBuild} from '../types/Types';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {InputErrorStateMatcher} from '../utils/InputValidator';
import {PipelineService} from '../services/pipeline.service';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {HttpErrorResponse} from '@angular/common/http';
import RepositoryService from '../services/repository.service';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {forkJoin, Subscription} from 'rxjs';

/**
 * Componente que gestiona el detalle y la ejecución de builds de un repositorio específico.
 */
@Component({
  selector: 'app-repository',
  imports: [RouterModule, FormsModule, MatTooltipModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatButtonModule, MatInputModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './repository.component.html',
  styleUrl: './repository.component.scss'
})
export class RepositoryComponent implements OnInit{
  /** Mensaje de error para parámetros faltantes */
  private readonly ERROR = '¡Ups! al parecer aun no has seleccionado los parametros requeridos';
  /** Función que genera el mensaje de éxito para un build */
  private readonly SUCCESS = (id: string) => `¡Excelente! Build id: ${id}`;
  /** Instancia de snackbar inyectada */
  private _snackBar = inject(MatSnackBar);
  /** Posición horizontal del snackbar */
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  /** Posición vertical del snackbar */
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  /** Control para la selección de cuenta */
  AccountFormControl = new FormControl('', [Validators.required]);
  /** Control para la selección de región */
  RegionFormControl = new FormControl('', [Validators.required]);
  /** Control para la selección de rama */
  BranchFormControl = new FormControl('', [Validators.required]);
  /** Validador de estado para el campo cuenta */
  matcherAccount = new InputErrorStateMatcher();
  /** Validador de estado para el campo región */
  matcherRegion = new InputErrorStateMatcher();
  /** Validador de estado para el campo rama */
  matcherBranch = new InputErrorStateMatcher();
  /** Datos del repositorio cargado */
  repoData!: RepoDetailResponse;
  /** Parámetros globales disponibles */
  params!: Params;
  /** Indica si se debe habilitar el enlace de seguimiento */
  enableLink: boolean = false;
  /** Enlace al pipeline o ejecución */
  link: string = '';
  /** Identificador de la aplicación/repositorio */
  app: string = '';
  /** Estado actual del repositorio */
  state: number = 0;
  /** Suscripción para operaciones paralelas de carga */
  parallel$: Subscription = new Subscription();

  /**
   * Constructor del componente.
   * @param arouter Servicio para acceder a los parámetros de la ruta activa.
   * @param router Servicio de navegación.
   * @param pipelineService Servicio para interactuar con los pipelines de CI/CD.
   * @param repoService Servicio para la gestión de repositorios.
   */
  constructor(private arouter: ActivatedRoute, private router: Router, private pipelineService: PipelineService, private repoService: RepositoryService) {
    this.app = this.arouter.snapshot.queryParams['repository'];
  }

  /**
   * Inicializa el componente, cargando los datos del repositorio.
   */
  ngOnInit(): void {
    this.repoService.onRefreshRepo().subscribe(() => {
      this.loadRepo();
    });
    this.loadRepo();
  }

  /**
   * Carga la información del repositorio y su estado actual de forma concurrente.
   */
  loadRepo(){
    this.parallel$ = forkJoin([this.repoService.findRepoById(this.app), this.repoService.getRepoStateByApp(this.app)])
      .subscribe(([repo, state]) => {
        if(repo && state){
          this.repoData = repo.app;
          this.params = repo.params;
          this.link = repo.app.props.link !;
          this.state = state.state;
          this.link = state.link;
        }else{
          this.goBack();
        }
      });
  }

  /**
   * Navega de regreso a la pantalla principal.
   */
  goBack() {
    this.router.navigate(['/']).then(() => true);
  }

  /**
   * Inicia el proceso de ejecución (build) del repositorio con los parámetros seleccionados.
   */
  pushBuild(){
    if(this.BranchFormControl.valid && this.RegionFormControl.valid && this.AccountFormControl.valid){
      const build:RequestBuild = {
        props: this.repoData.props,
        config: this.repoData.config,
        detail: {
          branch: this.BranchFormControl.value !,
          region: this.RegionFormControl.value !,
          account: this.AccountFormControl.value !
        }
      }
      this.pipelineService.buildApiRepo(build).subscribe({
        next: (r) => {
          this.openSnackBar(this.SUCCESS(r.id), true, '🚀');
          this.enableLink = true;
          this.link = r.link;
          this.repoService.loadData(true);
        },
        error: (e) => {
          console.log(e);
          const err: string = e instanceof HttpErrorResponse ? e.error.message : 'Lo sentimos, no pudimos procesar tu solicitud, intentalo mas tarde'
          this.openSnackBar(err, false, '😰');
        }
      });
    }else{
      this.openSnackBar(this.ERROR, false, '😰');
    }
  }

  /**
   * Muestra una notificación snackbar al usuario.
   * @param message Mensaje a mostrar.
   * @param success Indica si la operación fue exitosa para aplicar estilos.
   * @param emoji Emoji descriptivo para el mensaje.
   */
  openSnackBar(message: string, success: boolean, emoji: string) {
    this._snackBar.open(message, emoji, {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: success ? 'snackbar-success' : 'snackbar-error',
    });
  }

  /**
   * Abre el enlace del pipeline en una nueva pestaña del navegador.
   */
  openLink(){
    window.open(this.link, '_blank');
  }
}
