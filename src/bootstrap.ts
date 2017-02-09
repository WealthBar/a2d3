import 'script-loader!jquery/dist/jquery.js'
import 'bootstrap-loader';

import 'core-js/es7/reflect';
import 'web-animations-js';

import 'zone.js/dist/zone';
import 'zone.js/dist/long-stack-trace-zone';

import './styles/styles.scss';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
platformBrowserDynamic().bootstrapModule(AppModule);
