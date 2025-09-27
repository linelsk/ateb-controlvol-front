import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';
import { ApiModule } from './app/openapi/api/api.module';
import { environment } from './environments/environment';
import { importProvidersFrom } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';


bootstrapApplication(App, {
  ...appConfig,
  providers: [
    provideHttpClient(),
    ...(appConfig.providers || []),
    ...(ApiModule.forRoot({ rootUrl: environment.apiUrl }).providers ?? []),
    importProvidersFrom(
      NgxsModule.forRoot([]), // Estados vacíos por ahora
      NgxsLoggerPluginModule.forRoot()
    )
  ]
}).catch((err) => console.error(err));
