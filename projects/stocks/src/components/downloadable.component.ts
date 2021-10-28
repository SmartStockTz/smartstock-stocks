import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {FileModel, FilesService} from '@smartstocktz/core-libs';

@Component({
  selector: 'app-stock-downloadable',
  template: `
    <div
      style="display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; padding: 8px 0; margin-bottom: 16px">
      <div *ngFor="let file of files; let i =index"
           style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center">
        <mat-card style="height: 50px; margin: 5px; display: flex; flex-direction: row; align-items: center">
          <span style="max-width: 200px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
            {{file.name}}
          </span>
          <span style="width: 10px"></span>
          <button mat-icon-button style="display: inline-block" (click)="removeFile($event, i)">
            <mat-icon color="warn">delete</mat-icon>
          </button>
        </mat-card>
      </div>
      <mat-card (click)="chooseFile($event)" matRipple
                style="width: auto; height: 50px; margin: 5px 0;display: flex">
        <mat-icon>attachment</mat-icon>
        <span>Add digital file</span>
      </mat-card>
    </div>
  `,
})
export class DownloadableComponent implements OnInit {
  @Input() files: FileModel[] = [];
  @Output() filesReady = new EventEmitter<FileModel[]>();

  constructor(private readonly dialog: MatDialog,
              private readonly fileService: FilesService) {
  }

  ngOnInit(): void {
  }

  removeFile($event: MouseEvent, i: number): void {
    $event.preventDefault();
    this.files.splice(i, 1);
    this.filesReady.emit(this.files);
  }

  async chooseFile($event: MouseEvent): Promise<void> {
    $event.preventDefault();
    this.fileService.browse().then(file => {
      if (file && file.url) {
        if (this.files.length === 0) {
          this.files.push({
            category: file.category,
            size: file.size,
            suffix: file.suffix,
            name: file.suffix,
            type: file.suffix,
            url: file.url
          });
        } else {
          this.files = this.files.filter(value => file.url !== value.url);
          this.files.push({
            category: file.category,
            size: file.size,
            suffix: file.suffix,
            name: file.suffix,
            type: file.suffix,
            url: file.url,
          });
        }
        this.filesReady.emit(this.files);
      }
    });
  }
}
