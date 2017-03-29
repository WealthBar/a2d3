import { Directive, Input, Output, EventEmitter, AfterContentInit } from '@angular/core';
import * as d3 from 'd3';

@Directive({
  selector: 'd3-data'
})
export class D3DataDirective implements AfterContentInit {
  @Input() accessor: (row: {[key: string]: string }) => {};
  @Input() callback: (rows: any[]) => void;
  @Output() data = new EventEmitter();

  private _d3Data: D3DataService;
  private _src: string;
  private _initialized = false;

  constructor() {
    this._d3Data = new D3DataService();
  }

  defaultFilter(row: {}): {} {
    for (const key in row) {
      const value = row[key];

      if (!isNaN(parseFloat(value)) && isFinite(value)) {
        row[key] = +value.trim();
      }

      return row;
    }
  }

  @Input()
  get src(): string {
    return this._src;
  }
  set src(value: string) {
    this._src = value;

    if (this._initialized && this._src && this.src.length > 0) {
      this.fetch();
    }
  }

  fetch() {
    if (!this._src) {
      throw new Error('No src url given');
    }

    this._d3Data.csv(this._src, this.accessor || this.defaultFilter, this.callback)
      .then(rows => {
        this.data.next({ rows: rows });
      })
      .catch(() => {
        throw new Error('Error loading CSV via D3');
      });
  }

  ngAfterContentInit() {
    this._initialized = true;
    this.fetch();
  }
}

export interface Cache {
  get(key: string);
  put(key: string, value: any);
}

export class DefaultCache {
  store = {};

  get(key: string) {
    return this.store[key];
  }

  put(key: string, value: any) {
    this.store[key] = value;
  }
}

export class D3DataService {
  cache: Cache;

  constructor() {
    this.cache = new DefaultCache();
  }

  csv(src, accessor?: (row: {[key: string]: string }) => {}, callback?: (rows: any[]) => void) {
    return new Promise((resolve, reject) => {
      const cached = this.cache.get(src);

      if (cached) {
        if (callback) {
          callback(cached);
        }

        resolve(cached);
      }

      d3.csv(src, accessor, (rows) => {
        if (callback) {
          callback(rows);
        }

        if (rows) {
          this.cache.put(src, rows);
          resolve(rows);
        } else {
          reject();
        }
      });
    });
  }
}
