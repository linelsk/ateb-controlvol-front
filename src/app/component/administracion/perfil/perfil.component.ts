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
  displayedColumns: string[] = ['perfil', 'descripcion', 'empresas', 'acciones', 'acciones_btn'];
  
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
  empresasSeleccionadas: ListaEmpresasDto[] = [];
  acciones: ListaAccionDto[] = [];
  accionesSeleccionadas: ListaAccionDto[] = [];

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
      perfilId: [null],
      perfil: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      empresasIds: [[]],
      accionesIds: [[]]
    });
  }

  get perfilId() { return this.perfilForm.get('perfilId'); }
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
    this.perfilService.getAcciones$Json()
      .pipe(
        catchError(error => {
          console.error('Error al cargar acciones:', error);
          this.snackBar.open('Error al cargar acciones', 'Cerrar', { duration: 3000 });
          return of({ result: [] } as any);
        })
      )
      .subscribe({
        next: (response) => {
          this.acciones = response?.result || [];
          this.cdr.detectChanges();
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
      perfilId: null,
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
    
    // Usar las nuevas listas del modelo actualizado
    // listaEmpresas y listaAcciones contienen arrays de strings (IDs)
    this.empresasSeleccionadas = perfil.listaEmpresas ? 
      this.empresas.filter(empresa => perfil.listaEmpresas!.includes(empresa.empresaId || '')) : [];
    
    this.accionesSeleccionadas = perfil.listaAcciones ?
      this.acciones.filter(accion => perfil.listaAcciones!.includes(accion.codAccion || '')) : [];
    
    this.perfilForm.patchValue({
      perfilId: perfil.perfilId,
      perfil: perfil.perfil || '',
      descripcion: perfil.descripcion || '',
      empresasIds: perfil.listaEmpresas || [],
      accionesIds: perfil.listaAcciones || []
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
          if (response) {
            this.snackBar.open('Perfil creado exitosamente', 'Cerrar', { duration: 3000 });
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
    this.perfilService.actualizarPerfil$Json({ 
      body: perfilActualizado
    })
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
          this.cancelForm();
          this.loadPerfiles();
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
}