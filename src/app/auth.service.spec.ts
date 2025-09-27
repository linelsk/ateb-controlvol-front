import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { ClientesService } from './openapi/api/services/clientes.service';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;
  let clientesServiceSpy: jasmine.SpyObj<ClientesService>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    clientesServiceSpy = jasmine.createSpyObj('ClientesService', ['obtenerClientePorNumeroDeIdentificacion$Json']);
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
        { provide: ClientesService, useValue: clientesServiceSpy }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('debe autenticar admin correctamente', (done) => {
    service.login('admin', 'admin').subscribe(success => {
      expect(success).toBeTrue();
      expect(service.getRole()).toBe('Administrador');
      done();
    });
  });

  it('debe autenticar cliente si el endpoint responde con datos', (done) => {
  clientesServiceSpy.obtenerClientePorNumeroDeIdentificacion$Json.and.returnValue(of({ result: [{}] }));
    service.login('cliente', 'cliente').subscribe(success => {
      expect(success).toBeTrue();
      expect(service.getRole()).toBe('Cliente');
      done();
    });
  });

  it('debe fallar login cliente si endpoint responde vacío', (done) => {
  clientesServiceSpy.obtenerClientePorNumeroDeIdentificacion$Json.and.returnValue(of({ result: [] }));
    service.login('cliente', 'malpass').subscribe(success => {
      expect(success).toBeFalse();
      done();
    });
  });
});
