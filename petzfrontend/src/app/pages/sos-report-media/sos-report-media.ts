import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Navbar } from '../../shared/navbar/navbar';
import { SosService } from '../../core/sos/sos.service';

interface FilePreview {
  file: File;
  url: string;
  kind: 'photo' | 'video';
  sizeMb: string;
}

const MAX_PHOTOS = 3;
const MAX_VIDEO_MB = 50;
const MAX_PHOTO_MB = 10;

@Component({
  selector: 'petz-sos-report-media',
  imports: [Navbar],
  templateUrl: './sos-report-media.html',
  styleUrl: './sos-report-media.scss'
})
export class SosReportMedia implements OnInit, OnDestroy {
  private sos = inject(SosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  reportId = signal('');
  previews = signal<FilePreview[]>([]);
  uploading = signal(false);
  error = signal<string | null>(null);

  get hasPhotos(): boolean { return this.previews().some(p => p.kind === 'photo'); }
  get hasVideo():  boolean { return this.previews().some(p => p.kind === 'video'); }
  get photoCount(): number { return this.previews().filter(p => p.kind === 'photo').length; }
  get canAddMore(): boolean {
    if (this.hasVideo) return false;
    return this.photoCount < MAX_PHOTOS;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/sos/report']); return; }
    this.reportId.set(id);
  }

  ngOnDestroy(): void {
    this.previews().forEach(p => URL.revokeObjectURL(p.url));
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;
    this.error.set(null);
    this.addFiles(files);
  }

  private addFiles(files: File[]): void {
    const current = [...this.previews()];
    for (const f of files) {
      const isPhoto = f.type.startsWith('image/');
      const isVideo = f.type.startsWith('video/');
      if (!isPhoto && !isVideo) {
        this.error.set(`${f.name} is not an image or video.`);
        continue;
      }
      if (isVideo && (current.length > 0 || current.some(p => p.kind === 'photo'))) {
        this.error.set('You can send either up to 3 photos OR 1 video — not both.');
        continue;
      }
      if (isPhoto && current.some(p => p.kind === 'video')) {
        this.error.set('You can send either up to 3 photos OR 1 video — not both.');
        continue;
      }
      if (isPhoto && current.filter(p => p.kind === 'photo').length >= MAX_PHOTOS) {
        this.error.set(`Maximum ${MAX_PHOTOS} photos.`);
        continue;
      }
      if (isVideo && current.some(p => p.kind === 'video')) {
        this.error.set('Only 1 video allowed.');
        continue;
      }
      const sizeMb = f.size / (1024 * 1024);
      if (isPhoto && sizeMb > MAX_PHOTO_MB) {
        this.error.set(`${f.name} is over ${MAX_PHOTO_MB} MB.`);
        continue;
      }
      if (isVideo && sizeMb > MAX_VIDEO_MB) {
        this.error.set(`${f.name} is over ${MAX_VIDEO_MB} MB.`);
        continue;
      }
      current.push({
        file: f,
        url: URL.createObjectURL(f),
        kind: isPhoto ? 'photo' : 'video',
        sizeMb: sizeMb.toFixed(1)
      });
    }
    this.previews.set(current);
  }

  remove(index: number): void {
    const next = [...this.previews()];
    const [removed] = next.splice(index, 1);
    if (removed) URL.revokeObjectURL(removed.url);
    this.previews.set(next);
  }

  upload(): void {
    if (!this.previews().length || this.uploading()) return;
    this.error.set(null);
    this.uploading.set(true);
    const files = this.previews().map(p => p.file);
    this.sos.uploadMedia(this.reportId(), files).subscribe({
      next: report => {
        this.uploading.set(false);
        sessionStorage.setItem('petz.activeReport', JSON.stringify(report));
        this.router.navigate(['/sos/report', report.id, 'confirmed']);
      },
      error: (err: HttpErrorResponse) => {
        this.uploading.set(false);
        this.error.set(err.error?.message ?? 'Could not upload media. You can skip this step.');
      }
    });
  }

  skip(): void {
    this.router.navigate(['/sos/report', this.reportId(), 'confirmed']);
  }
}
