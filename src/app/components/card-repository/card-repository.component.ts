import {Component, inject, Input} from '@angular/core';
import {Params, RepoDetailResponse} from '../../types/Types';
import {Router} from '@angular/router';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

/**
 * Componente que representa una tarjeta visual para un repositorio individual.
 * Permite visualizar información básica y navegar al detalle del repositorio.
 */
@Component({
  selector: 'app-card-repository',
  standalone: false,
  templateUrl: './card-repository.component.html',
  styleUrl: './card-repository.component.scss'
})
export class CardRepositoryComponent {

  private _snackBar = inject(MatSnackBar);

  /** Posición horizontal del snackbar */
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  /** Posición vertical del snackbar */
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  /**
   * Constructor del componente.
   * @param router Servicio de navegación de Angular.
   */
  constructor(private router: Router) {}

  /** Detalle del repositorio a mostrar */
  @Input({required: true}) repositoryDetail !: RepoDetailResponse;
  /** Parámetros globales de configuración */
  @Input({required: true}) params !: Params;

  /**
   * Navega a la vista de detalle del repositorio si tiene ramas disponibles.
   * En caso contrario, muestra un mensaje de advertencia.
   */
  navigate(){

    if(this.repositoryDetail.branches.length > 0){
      this.router.navigate(['/Repository'], {
        queryParams: {repository: this.repositoryDetail.props.app}
      }).then(() => true);
    }else{
      this.openSnackBar();
    }
  }

  /**
   * Muestra un mensaje de alerta (snackbar) indicando que el repositorio no tiene ramas.
   */
  openSnackBar() {
    this._snackBar.open('¡Ups! este repositorio no cuenta con ramas aun', '😰', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: 'snackbar-error'
    });
  }
}
