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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { EmpresaService } from '../../openapi/api/services/empresa.service';
import { 
  ListaEmpresasDto, 
  CrearEmpresaDto,
  ListaPlantaDto,
  ListaProveedoresDto,
  CrearEmpresaPlantaDto,
  CrearEmpresaProveedorDto
} from '../../openapi/api/models';
import { catchError, finalize } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

@Component({
  selector: 'app-empresa',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './empresa.component.html',
  styleUrl: './empresa.component.css'
})
export class EmpresaComponent implements OnInit, AfterViewInit {
  // Datos y configuración de la tabla
  dataSource!: MatTableDataSource<ListaEmpresasDto>;
  displayedColumns: string[] = ['razonSocial', 'rfc', 'rfcRepresentanteLegal', 'plantas', 'proveedores', 'activa', 'fechaCreacion', 'acciones'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // Formularios
  empresaForm: FormGroup;
  searchTerm: string = '';
  isEditing: boolean = false;
  currentEmpresaId: string | null = null;
  
  // Estado del componente
  loading: boolean = false;
  showForm: boolean = false;
  
  // Datos para los selects
  plantas: ListaPlantaDto[] = [];
  proveedores: ListaProveedoresDto[] = [];
  loadingPlantas: boolean = false;
  loadingProveedores: boolean = false;
  
  // Configuración del paginador
  pageSizeOptions: number[] = [5, 10, 25, 100];
  pageSize: number = 10;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
    private readonly empresaService: EmpresaService
  ) {
    this.empresaForm = this.createForm();
    // Inicializar dataSource en el constructor
    this.dataSource = new MatTableDataSource<ListaEmpresasDto>([]);
  }

  ngOnInit(): void {
    this.loadEmpresas();
    this.loadPlantas();
    this.loadProveedores();
  }

  ngAfterViewInit(): void {
    // Configurar filtro personalizado primero
    this.dataSource.filterPredicate = (data: ListaEmpresasDto, filter: string) => {
      const searchTerm = filter.toLowerCase();
      return (
        (data.razonSocial?.toLowerCase().includes(searchTerm) ?? false) ||
        (data.rfc?.toLowerCase().includes(searchTerm) ?? false) ||
        (data.rfcRepresentanteLegal?.toLowerCase().includes(searchTerm) ?? false)
      );
    };
    
    // Configurar paginador y sort
    this.setupPaginator();
  }

  private setupPaginator(): void {
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      
      // Configurar opciones del paginador
      this.paginator.pageSize = this.pageSize;
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
    } else {
      // Intentar de nuevo después de un delay si no están disponibles
      setTimeout(() => this.setupPaginator(), 100);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      empresaId: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z0-9_-]+$/)]],
      razonSocial: ['', [Validators.required, Validators.maxLength(255)]],
      rfc: ['', [Validators.required]],
      rfcRepresentanteLegal: ['', [Validators.required]],
      activa: [true],
      versionCtrVol: [''],
      plantasIds: [[]],
      proveedoresIds: [[]]
    });
  }

  loadEmpresas(): void {
    this.loading = true;
    
    this.empresaService.getAllEmpresas$Json()
      .pipe(
        catchError(error => {
          console.error('Error cargando empresas:', error);
          this.showSnackBar('Error al cargar las empresas', 'error');
          return of({ result: [], success: false, message: 'Error al cargar empresas' });
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(response => {
        if (response.success && response.result) {
          this.dataSource.data = response.result;
          this.refreshDataSource();
        } else {
          this.showSnackBar(response.message || 'Error al cargar empresas', 'error');
        }
      });
  }

  loadPlantas(): void {
    this.loadingPlantas = true;
    
    this.empresaService.getAllPlantas$Json()
      .pipe(
        catchError(error => {
          console.error('Error cargando plantas:', error);
          this.showSnackBar('Error al cargar las plantas', 'error');
          return of({ result: [], success: false, message: 'Error al cargar plantas' });
        }),
        finalize(() => {
          this.loadingPlantas = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(response => {
        if (response.success && response.result) {
          this.plantas = response.result;
        } else {
          this.showSnackBar(response.message || 'Error al cargar plantas', 'error');
        }
      });
  }

  loadProveedores(): void {
    this.loadingProveedores = true;
    
    this.empresaService.getAllProveedores$Json()
      .pipe(
        catchError(error => {
          console.error('Error cargando proveedores:', error);
          this.showSnackBar('Error al cargar los proveedores', 'error');
          return of({ result: [], success: false, message: 'Error al cargar proveedores' });
        }),
        finalize(() => {
          this.loadingProveedores = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(response => {
        if (response.success && response.result) {
          this.proveedores = response.result;
        } else {
          this.showSnackBar(response.message || 'Error al cargar proveedores', 'error');
        }
      });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    
    // Resetear a la primera página cuando se aplica un filtro
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  showNewForm(): void {
    this.isEditing = false;
    this.currentEmpresaId = null;
    this.empresaForm.reset();
    this.empresaForm.patchValue({ 
      empresaId: '', // Limpiar explícitamente el empresaId para nueva empresa
      activa: true,
      plantasIds: [],
      proveedoresIds: []
    });
    this.showForm = true;
  }

  editEmpresa(empresa: ListaEmpresasDto): void {
    this.isEditing = true;
    this.currentEmpresaId = empresa.empresaId || null;
    this.empresaForm.patchValue({
      empresaId: empresa.empresaId,
      razonSocial: empresa.razonSocial,
      rfc: empresa.rfc,
      rfcRepresentanteLegal: empresa.rfcRepresentanteLegal,
      activa: empresa.activa,
      versionCtrVol: empresa.versionCtrVol,
      plantasIds: empresa.listaPlantas || [],
      proveedoresIds: empresa.listaProveedores || []
    });
    this.showForm = true;
  }



  onSubmit(): void {
    if (this.empresaForm.valid) {
      const formData: CrearEmpresaDto = {
        empresaId: this.empresaForm.value.empresaId,
        razonSocial: this.empresaForm.value.razonSocial,
        rfc: this.empresaForm.value.rfc,
        rfcRepresentanteLegal: this.empresaForm.value.rfcRepresentanteLegal,
        activa: this.empresaForm.value.activa,
        versionCtrVol: this.empresaForm.value.versionCtrVol,
        fechaCreacion: this.isEditing ? undefined : new Date().toISOString()
      };
      
      // Log para debuggear
      console.log('Datos del formulario a enviar:', formData);
      console.log('Es edición:', this.isEditing);
      console.log('EmpresaId del formulario:', this.empresaForm.value.empresaId);
      
      this.loading = true;
      
      const empresaRequest = this.isEditing 
        ? this.empresaService.actualizarEmpresa$Json({ body: formData })
        : this.empresaService.crearEmpresa$Json({ body: formData });
      
      empresaRequest
        .pipe(
          catchError(error => {
            console.error('Error guardando empresa:', error);
            const message = this.isEditing ? 'Error al actualizar la empresa' : 'Error al crear la empresa';
            this.showSnackBar(message, 'error');
            return of({ success: false, message, result: null });
          })
        )
        .subscribe(empresaResponse => {
          if (empresaResponse.success && empresaResponse.result) {
            const empresaId = empresaResponse.result.empresaId;
            
            // Preparar las relaciones a guardar
            const relaciones = [];
            
            // Agregar relaciones de plantas si se seleccionaron
            if (this.empresaForm.value.plantasIds && this.empresaForm.value.plantasIds.length > 0) {
              const plantasData: CrearEmpresaPlantaDto[] = this.empresaForm.value.plantasIds.map((plantaId: string) => ({
                empresaId: empresaId,
                plantaId: plantaId
              }));
              relaciones.push(this.empresaService.guardaRelacionEmpresaPlanta$Json({ body: plantasData }));
            }
            
            // Agregar relaciones de proveedores si se seleccionaron
            if (this.empresaForm.value.proveedoresIds && this.empresaForm.value.proveedoresIds.length > 0) {
              const proveedoresData: CrearEmpresaProveedorDto[] = this.empresaForm.value.proveedoresIds.map((proveedorId: string) => ({
                empresaId: empresaId,
                proveedorId: proveedorId,
                disponibilidad: true
              }));
              relaciones.push(this.empresaService.guardaRelacionEmpresaProveedor$Json({ body: proveedoresData }));
            }
            
            // Ejecutar las relaciones si existen
            if (relaciones.length > 0) {
              forkJoin(relaciones)
                .pipe(
                  catchError(error => {
                    console.error('Error guardando relaciones:', error);
                    this.showSnackBar('Empresa guardada, pero error al guardar relaciones', 'error');
                    return of([]);
                  }),
                  finalize(() => {
                    this.loading = false;
                    this.cdr.detectChanges();
                  })
                )
                .subscribe(() => {
                  const message = this.isEditing ? 'Empresa y relaciones actualizadas exitosamente' : 'Empresa y relaciones creadas exitosamente';
                  this.showSnackBar(message, 'success');
                  this.cancelForm();
                  this.loadEmpresas();
                });
            } else {
              // No hay relaciones que guardar
              this.loading = false;
              const message = this.isEditing ? 'Empresa actualizada exitosamente' : 'Empresa creada exitosamente';
              this.showSnackBar(message, 'success');
              this.cancelForm();
              this.loadEmpresas();
              this.cdr.detectChanges();
            }
          } else {
            this.loading = false;
            this.showSnackBar(empresaResponse.message || 'Error al guardar la empresa', 'error');
            this.cdr.detectChanges();
          }
        });
    } else {
      this.showSnackBar('Por favor, complete todos los campos requeridos', 'error');
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentEmpresaId = null;
    
    // Reset completo del formulario
    this.empresaForm.reset();
    
    // Restablecer valores por defecto
    this.empresaForm.patchValue({
      empresaId: '',
      activa: true,
      plantasIds: [],
      proveedoresIds: []
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: type === 'success' ? 'snack-success' : 'snack-error'
    });
  }

  // Método auxiliar para refrescar el dataSource
  private refreshDataSource(): void {
    this.dataSource.data = [...this.dataSource.data];
    
    // Asegurar que el paginador esté configurado
    this.setupPaginator();
  }

  // Getters para validación del formulario
  get empresaId() { return this.empresaForm.get('empresaId'); }
  get razonSocial() { return this.empresaForm.get('razonSocial'); }
  get rfc() { return this.empresaForm.get('rfc'); }
  get rfcRepresentanteLegal() { return this.empresaForm.get('rfcRepresentanteLegal'); }
  get plantasIds() { return this.empresaForm.get('plantasIds'); }
  get proveedoresIds() { return this.empresaForm.get('proveedoresIds'); }

  // Métodos helper para mostrar nombres en tooltips
  getPlantasNames(plantasIds: string[]): string {
    if (!plantasIds || plantasIds.length === 0) return 'Sin plantas';
    
    const nombres = plantasIds.map(id => {
      const planta = this.plantas.find(p => p.plantaId === id);
      return planta ? planta.descripcionPlanta : `ID: ${id}`;
    });
    
    return nombres.join(', ');
  }

  getProveedoresNames(proveedoresIds: string[]): string {
    if (!proveedoresIds || proveedoresIds.length === 0) return 'Sin proveedores';
    
    const nombres = proveedoresIds.map(id => {
      const proveedor = this.proveedores.find(p => p.noProveedor === id);
      return proveedor ? proveedor.razonSocialP : `ID: ${id}`;
    });
    
    return nombres.join(', ');
  }
}
