import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  @Input() rows: any;
  @Input() columns: string[];
  @Input() columnLabels: string[];

  // Because sometimes objects are not flat
  // https://www.competa.com/blog/angular-material-deep-nested-objects-in-sortable-table/

  // Initialize dataSource 
  dataSource: MatTableDataSource<{}> = new MatTableDataSource();

  // Define ViewChild.
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  sortingDataAccessor(item, property) {

    console.log(item, property);

    if (property.includes('.')) {
      return property.split('.')
        .reduce((object, key) => object[key], item);
    }
    return item[property];
  }
  // End table array fixin

  constructor() { }

  ngOnInit() {

    console.log('output rows');
    //console.log(this.rows);

    // Array fixin init
    this.dataSource.sortingDataAccessor = this.sortingDataAccessor;
    this.dataSource.data = this.rows;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewInit() {
    this.paginator.page
        .pipe(
            tap(() => this.loadRows())
        )
        .subscribe();
  }

  loadRows() {
  }
}
