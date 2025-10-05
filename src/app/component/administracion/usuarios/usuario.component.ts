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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UsuariosService } from '../../../openapi/api/services/usuarios.service';
import { EmpresaService } from '../../../openapi/api/services/empresa.service';
import { 
  UsuarioDto, 
  CrearUsuarioDto,
  ListaPlantaDto,
  CrearUsuarioPlantaDto
} from '../../../openapi/api/models';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-usuario',
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
    MatSlideToggleModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent implements OnInit, AfterViewInit {
  dataSource!: MatTableDataSource<UsuarioDto>;
  displayedColumns: string[] = ['nombre', 'correo', 'perfil', 'activo', 'primeraVez', 'acciones'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  usuarioForm: FormGroup;
  searchTerm: string = '';
  isEditing: boolean = false;
  currentUsuarioId: string | null = null;
  loading: boolean = false;
  showForm: boolean = false;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  pageSize: number = 10;
  plantas: ListaPlantaDto[] = [];
  plantasSeleccionadas: string[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
    private readonly usuariosService: UsuariosService,
    private readonly empresaService: EmpresaService
  ) {
    this.usuarioForm = this.createForm();
    this.dataSource = new MatTableDataSource<UsuarioDto>([]);
  }

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadPlantas();
  }

  ngAfterViewInit(): void {
    this.dataSource.filterPredicate = (data: UsuarioDto, filter: string) => {
      const searchTerm = filter.toLowerCase();
      return (
        (data.nombre?.toLowerCase().includes(searchTerm) ?? false) ||
        (data.correo?.toLowerCase().includes(searchTerm) ?? false) ||
        (data.perfil?.perfil?.toLowerCase().includes(searchTerm) ?? false)
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
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      perfilId: [null, [Validators.required]],
      activo: [true],
      plantasIds: [[]]
    });
  }

  get nombre() { return this.usuarioForm.get('nombre'); }
  get correo() { return this.usuarioForm.get('correo'); }
  get password() { return this.usuarioForm.get('password'); }
  get perfilId() { return this.usuarioForm.get('perfilId'); }
  get activo() { return this.usuarioForm.get('activo'); }
  get plantasIds() { return this.usuarioForm.get('plantasIds'); }

  loadUsuarios(): void {
    this.loading = true;
    this.usuariosService.getAllUsers$Json()
      .pipe(
        catchError(error => {
          console.error('Error al cargar usuarios:', error);
          this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
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

  loadPlantas(): void {
    this.empresaService.getAllPlantas$Json()
      .pipe(
        catchError(error => {
          console.error('Error al cargar plantas:', error);
          this.snackBar.open('Error al cargar plantas', 'Cerrar', { duration: 3000 });
          return of({ result: [] } as any);
        })
      )
      .subscribe({
        next: (response) => {
          this.plantas = response?.result || [];
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
    this.currentUsuarioId = null;
    this.showForm = true;
    this.plantasSeleccionadas = [];
    this.usuarioForm.reset({
      nombre: '',
      correo: '',
      password: '',
      perfilId: null,
      activo: true,
      plantasIds: []
    });
  }

  editUsuario(usuario: UsuarioDto): void {
    this.isEditing = true;
    this.currentUsuarioId = usuario.usuarioId || null;
    this.showForm = true;
    this.plantasSeleccionadas = [];
    this.usuarioForm.patchValue({
      nombre: usuario.nombre || '',
      correo: usuario.correo || '',
      password: '',
      perfilId: usuario.perfilId || null,
      activo: usuario.activo ?? true,
      plantasIds: []
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentUsuarioId = null;
    this.plantasSeleccionadas = [];
    this.usuarioForm.reset();
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      const formValue = this.usuarioForm.value;
      if (this.isEditing) {
        this.updateUsuario(formValue);
      } else {
        this.createUsuario(formValue);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createUsuario(formValue: any): void {
    const nuevoUsuario: CrearUsuarioDto = {
      nombre: formValue.nombre,
      correo: formValue.correo,
      password: formValue.password,
      perfilId: formValue.perfilId,
      activo: formValue.activo
    };

    this.loading = true;
    this.usuariosService.crearUsuario$Json({ body: nuevoUsuario })
      .pipe(
        catchError(error => {
          console.error('Error al crear usuario:', error);
          this.snackBar.open('Error al crear usuario', 'Cerrar', { duration: 3000 });
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
            this.snackBar.open('Usuario creado exitosamente', 'Cerrar', { duration: 3000 });
            if (formValue.plantasIds && formValue.plantasIds.length > 0) {
              this.saveUsuarioPlantasRelation(response.result?.usuarioId || '', formValue.plantasIds);
            }
            this.cancelForm();
            this.loadUsuarios();
          }
        }
      });
  }

  private updateUsuario(formValue: any): void {
    if (!this.currentUsuarioId) return;

    const usuarioActualizado: CrearUsuarioDto = {
      nombre: formValue.nombre,
      correo: formValue.correo,
      password: formValue.password,
      perfilId: formValue.perfilId,
      activo: formValue.activo
    };

    this.loading = true;
    this.usuariosService.actualizarUsuario$Json({ 
      body: { ...usuarioActualizado, usuarioId: this.currentUsuarioId }
    })
    .pipe(
      catchError(error => {
        console.error('Error al actualizar usuario:', error);
        this.snackBar.open('Error al actualizar usuario', 'Cerrar', { duration: 3000 });
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
          this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', { duration: 3000 });
          if (formValue.plantasIds && formValue.plantasIds.length > 0) {
            this.saveUsuarioPlantasRelation(this.currentUsuarioId!, formValue.plantasIds);
          }
          this.cancelForm();
          this.loadUsuarios();
        }
      }
    });
  }

  private saveUsuarioPlantasRelation(usuarioId: string, plantasIds: string[]): void {
    const relaciones: CrearUsuarioPlantaDto[] = plantasIds.map(plantaId => ({
      usuarioId: usuarioId,
      plantaId: plantaId,
      plantaDescripcion: this.plantas.find(p => p.plantaId === plantaId)?.descripcionPlanta || null
    }));

    this.usuariosService.guardaRelacionUsuarioPlanta$Json({ body: relaciones })
      .pipe(
        catchError(error => {
          console.error('Error al guardar relación usuario-plantas:', error);
          this.snackBar.open('Usuario guardado pero error en relación con plantas', 'Cerrar', { duration: 4000 });
          return of(false);
        })
      )
      .subscribe({
        next: (success: boolean) => {
          if (success) {
            this.snackBar.open('Relaciones de plantas guardadas exitosamente', 'Cerrar', { duration: 3000 });
          }
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      control?.markAsTouched();
    });
  }
}