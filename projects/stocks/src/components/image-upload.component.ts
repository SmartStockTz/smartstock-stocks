import {Component, EventEmitter, Output} from '@angular/core';
import {FilesService} from '@smartstocktz/core-libs';
import {of} from 'rxjs';

@Component({
  selector: 'app-image-upload',
  template: `
    <cdk-virtual-scroll-viewport class="image-container" orientation="horizontal" itemSize="140">
      <div class="image-list">
        <div class="image-preview-container" *cdkVirtualFor="let image of imagesOf | async">
          <img src="{{image}}" class="image-preview" alt="">
          <div matRipple (click)="removeImage(image)" class="image-preview-remove">
            <mat-icon class="no-select remove-icon">close</mat-icon>
          </div>
        </div>
        <div (click)="browserMedia($event)" matRipple class="add-image">
          <mat-icon class="no-select add-icon" color="primary">add_circle</mat-icon>
        </div>
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styleUrls: ['../styles/image-upload.style.scss']
})
export class ImageUploadComponent {
  @Output() imagesReady = new EventEmitter<string[]>();
  images = new Set<string>();
  imagesOf = of([]);

  constructor(private readonly fileService: FilesService) {
  }

  removeImage(image: string): void {
    this.images.delete(image);
    this.imagesReady.emit(Array.from(this.images));
    this.imagesOf = of(Array.from(this.images));
  }

  async browserMedia($event: MouseEvent): Promise<void> {
    $event.preventDefault();
    this.fileService.browse().then(value => {
      if (value && value.url) {
        this.images.add(value.url);
        this.imagesReady.emit(Array.from(this.images));
        this.imagesOf = of(Array.from(this.images));
      } else {
      }
    });
  }
}
