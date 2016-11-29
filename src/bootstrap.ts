require('script-loader!jquery/dist/jquery.js');
require('bootstrap-loader');

require('core-js/es6');
require('core-js/es7/reflect')
require('zone.js/dist/zone')

require('web-animations-js')

require('zone.js/dist/long-stack-trace-zone');

require('./styles/styles.scss')

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
platformBrowserDynamic().bootstrapModule(AppModule);
