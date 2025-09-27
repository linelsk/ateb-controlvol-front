import { importProvidersFrom } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';

export const ngxsProviders = [
  importProvidersFrom(
    NgxsModule.forRoot([]), // Estados vacíos por ahora
    NgxsLoggerPluginModule.forRoot()
  )
];
