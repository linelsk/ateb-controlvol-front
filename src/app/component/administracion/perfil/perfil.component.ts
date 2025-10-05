import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { PerfilService } from '../../../openapi/api/services/perfil.service';
import { EmpresaService } from '../../../openapi/api/services/empresa.service';
import { 
  ListaPerfilesDto,
  CrearPerfilDto,
  ListaEmpresasDto,
  CrearPerfilEmpresaDto,
  ListaAccionDto,
  CrearPerfilAccionDto
} from '../../../openapi/api/models';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit, AfterViewInit {
  dataSource!: MatTableDataSource<ListaPerfilesDto>;
  displayedColumns: string[] = ['perfilId', 'perfil', 'descripcion', 'acciones'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  perfilForm: FormGroup;
  searchTerm: string = '';
  isEditing: boolean = false;
  currentPerfilId: number | null = null;
  loading: boolean = false;
  showForm: boolean = false;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  pageSize: number = 10;
  empresas: ListaEmpresasDto[] = [];
  empresasSeleccionadas: string[] = [];
  acciones: ListaAccionDto[] = [];
  accionesSeleccionadas: string[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
    private readonly perfilService: PerfilService,
    private readonly empresaService: EmpresaService
  ) {
    this.perfilForm = this.createForm();
    this.dataSource = new MatTableDataSource<ListaPerfilesDto>([]);
  }

  ngOnInit(): void {
    this.loadPerfiles();
    this.loadEmpresas();
    this.loadAcciones();
  }

  ngAfterViewInit(): void {
    this.dataSource.filterPredicate = (data: ListaPerfilesDto, filter: string) => {
      const searchTerm = filter.toLowerCase();
      return (
        (data.perfil?.toLowerCase().includes(searchTerm) ?? false) ||
        (data.descripcion?.toLowerCase().includes(searchTerm) ?? false)
      );
    };
    this.setupPaginator();
  }

  private setupPaginator(): void {
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.paginator.pageSize = this.pageSize;
      this.cdr.detectChanges();
    } else {
      setTimeout(() => this.setupPaginator(), 100);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      perfil: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      empresasIds: [[]],
      accionesIds: [[]]
    });
  }

  get perfil() { return this.perfilForm.get('perfil'); }
  get descripcion() { return this.perfilForm.get('descripcion'); }
  get empresasIds() { return this.perfilForm.get('empresasIds'); }
  get accionesIds() { return this.perfilForm.get('accionesIds'); }

  loadPerfiles(): void {
    this.loading = true;
    this.perfilService.getAllPerfiles$Json()
      .pipe(
        catchError(error => {
          console.error('Error al cargar perfiles:', error);
          this.snackBar.open('Error al cargar perfiles', 'Cerrar', { duration: 3000 });
          return of({ result: [] } as any);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.dataSource.data = response?.result || [];
          this.cdr.detectChanges();
        }
      });
  }

  loadEmpresas(): void {
    this.empresaService.getAllEmpresas$Json()
      .pipe(
        catchError(error => {
          console.error('Error al cargar empresas:', error);
          this.snackBar.open('Error al cargar empresas', 'Cerrar', { duration: 3000 });
          return of({ result: [] } as any);
        })
      )
      .subscribe({
        next: (response) => {
          this.empresas = response?.result || [];
          this.cdr.detectChanges();
        }
      });
  }

  loadAcciones(): void {
    console.log('🔄 Iniciando carga de acciones desde:', '/api/Perfil/GetAcciones');
    
    this.perfilService.getAcciones$Json()
      .pipe(
        catchError(error => {
          console.error('❌ Error al cargar acciones:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          
          if (error.status === 404) {
            this.snackBar.open('Endpoint de acciones no encontrado', 'Cerrar', { duration: 5000 });
          } else if (error.status === 500) {
            this.snackBar.open('Error del servidor al cargar acciones', 'Cerrar', { duration: 5000 });
          } else {
            this.snackBar.open('Error al cargar acciones', 'Cerrar', { duration: 3000 });
          }
          
          return of({ result: [], success: false, message: 'Error' } as any);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta del API GetAcciones:', response);
          
          if (response?.success === false) {
            console.warn('⚠️ API devolvió success: false. Message:', response.message);
            this.snackBar.open(`Error: ${response.message || 'Respuesta no exitosa'}`, 'Cerrar', { duration: 4000 });
          }
          
          this.acciones = response?.result || [];
          console.log(`📋 Acciones cargadas (${this.acciones.length}):`, this.acciones);
          
          if (this.acciones.length === 0) {
            console.warn('⚠️ No se encontraron acciones en la respuesta');
          }
          
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Error en subscribe:', error);
        }
      });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  showNewForm(): void {
    this.isEditing = false;
    this.currentPerfilId = null;
    this.showForm = true;
    this.empresasSeleccionadas = [];
    this.accionesSeleccionadas = [];
    this.perfilForm.reset({
      perfil: '',
      descripcion: '',
      empresasIds: [],
      accionesIds: []
    });
  }

  editPerfil(perfil: ListaPerfilesDto): void {
    this.isEditing = true;
    this.currentPerfilId = perfil.perfilId || null;
    this.showForm = true;
    this.empresasSeleccionadas = [];
    this.accionesSeleccionadas = [];
    this.perfilForm.patchValue({
      perfil: perfil.perfil || '',
      descripcion: perfil.descripcion || '',
      empresasIds: [],
      accionesIds: []
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentPerfilId = null;
    this.empresasSeleccionadas = [];
    this.accionesSeleccionadas = [];
    this.perfilForm.reset();
  }

  onSubmit(): void {
    if (this.perfilForm.valid) {
      const formValue = this.perfilForm.value;
      if (this.isEditing) {
        this.updatePerfil(formValue);
      } else {
        this.createPerfil(formValue);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createPerfil(formValue: any): void {
    const nuevoPerfil: CrearPerfilDto = {
      perfil: formValue.perfil,
      descripcion: formValue.descripcion
    };

    this.loading = true;
    this.perfilService.crearPerfil$Json({ body: nuevoPerfil })
      .pipe(
        catchError(error => {
          console.error('Error al crear perfil:', error);
          this.snackBar.open('Error al crear perfil', 'Cerrar', { duration: 3000 });
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.result?.perfilId) {
            const perfilId = response.result.perfilId;
            this.snackBar.open('Perfil creado exitosamente', 'Cerrar', { duration: 3000 });
            
            // Guardar relaciones si existen
            if (formValue.empresasIds && formValue.empresasIds.length > 0) {
              this.savePerfilEmpresasRelation(perfilId, formValue.empresasIds);
            }
            if (formValue.accionesIds && formValue.accionesIds.length > 0) {
              this.savePerfilAccionesRelation(perfilId, formValue.accionesIds);
            }
            
            this.cancelForm();
            this.loadPerfiles();
          }
        }
      });
  }

  private updatePerfil(formValue: any): void {
    if (!this.currentPerfilId) return;

    const perfilActualizado: CrearPerfilDto = {
      perfilId: this.currentPerfilId,
      perfil: formValue.perfil,
      descripcion: formValue.descripcion
    };

    this.loading = true;
    this.perfilService.actualizarPerfil$Json({ body: perfilActualizado })
    .pipe(
      catchError(error => {
        console.error('Error al actualizar perfil:', error);
        this.snackBar.open('Error al actualizar perfil', 'Cerrar', { duration: 3000 });
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response) => {
        if (response) {
          this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', { duration: 3000 });
          
          // Guardar relaciones si existen
          if (formValue.empresasIds && formValue.empresasIds.length > 0) {
            this.savePerfilEmpresasRelation(this.currentPerfilId!, formValue.empresasIds);
          }
          if (formValue.accionesIds && formValue.accionesIds.length > 0) {
            this.savePerfilAccionesRelation(this.currentPerfilId!, formValue.accionesIds);
          }
          
          this.cancelForm();
          this.loadPerfiles();
        }
      }
    });
  }

  private savePerfilEmpresasRelation(perfilId: number, empresasIds: string[]): void {
    const relaciones: CrearPerfilEmpresaDto[] = empresasIds.map(empresaId => ({
      perfilId: perfilId,
      empresaId: empresaId,
      plantaId: null
    }));

    this.perfilService.guardaRelacionPerfilEmpresa$Json({ body: relaciones })
      .pipe(
        catchError(error => {
          console.error('Error al guardar relación perfil-empresas:', error);
          this.snackBar.open('Perfil guardado pero error en relación con empresas', 'Cerrar', { duration: 4000 });
          return of(false);
        })
      )
      .subscribe({
        next: (success) => {
          if (success) {
            this.snackBar.open('Relaciones de empresas guardadas exitosamente', 'Cerrar', { duration: 3000 });
          }
        }
      });
  }

  private savePerfilAccionesRelation(perfilId: number, accionesIds: string[]): void {
    const relaciones: CrearPerfilAccionDto[] = accionesIds.map(accionId => ({
      id: null,
      perfilId: perfilId,
      codAccion: accionId
    }));

    this.perfilService.guardaRelacionPerfilAccion$Json({ body: relaciones })
      .pipe(
        catchError(error => {
          console.error('Error al guardar relación perfil-acciones:', error);
          this.snackBar.open('Perfil guardado pero error en relación con acciones', 'Cerrar', { duration: 4000 });
          return of(false);
        })
      )
      .subscribe({
        next: (success) => {
          if (success) {
            this.snackBar.open('Relaciones de acciones guardadas exitosamente', 'Cerrar', { duration: 3000 });
          }
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.perfilForm.controls).forEach(key => {
      const control = this.perfilForm.get(key);
      control?.markAsTouched();
    });
  }

  filtrarPerfiles(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  abrirDialogNuevoPerfil(): void {
    this.isEditing = false;
    this.currentPerfilId = null;
    this.showForm = true;
    this.perfilForm.reset();
  }

  editarPerfil(perfil: ListaPerfilesDto): void {
    this.isEditing = true;
    this.currentPerfilId = perfil.perfilId || null;
    this.showForm = true;
    
    this.perfilForm.patchValue({
      perfil: perfil.perfil,
      descripcion: perfil.descripcion
    });
  }

  verDetalles(perfil: ListaPerfilesDto): void {
    this.snackBar.open(`Ver detalles del perfil: ${perfil.perfil}`, 'Cerrar', { duration: 3000 });
  }

  cambiarEstado(perfil: ListaPerfilesDto): void {
    this.snackBar.open(`Cambiar estado del perfil ${perfil.perfil}`, 'Cerrar', { duration: 3000 });
  }

  eliminarPerfil(perfil: ListaPerfilesDto): void {
    if (confirm(`¿Está seguro de eliminar el perfil "${perfil.perfil}"?`)) {
      this.snackBar.open(`Perfil ${perfil.perfil} eliminado`, 'Cerrar', { duration: 3000 });
    }
  }

  savePerfil(): void {
    if (this.perfilForm.valid) {
      if (this.isEditing) {
        this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', { duration: 3000 });
      } else {
        this.snackBar.open('Perfil creado exitosamente', 'Cerrar', { duration: 3000 });
      }
      this.cancelarEdicion();
    }
  }

  cancelarEdicion(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentPerfilId = null;
    this.perfilForm.reset();
  }
}
