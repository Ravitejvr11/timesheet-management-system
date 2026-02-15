import type { TemplateRef } from '@angular/core';
import {
  Component,
  HostListener,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

import type { Project } from '@core/models/project/project.model';
import { ProjectStatus } from '@core/models/project/project.model';

import { projectFeature } from 'src/app/store/project/project.reducer';
import type { TableColumn } from 'src/app/shared/components/app-table/app-table.component';
import { AppTable } from 'src/app/shared/components/app-table/app-table.component';
import { ProjectActions } from 'src/app/store/project/project.actions';
import { AppDialog } from 'src/app/shared/components/app-dialog/app-dialog';
import { MultiSelect } from 'src/app/shared/components/multi-select/multi-select';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  standalone: true,
  selector: 'app-project-page',
  imports: [CommonModule, AppTable, AppDialog, MultiSelect],
  templateUrl: './project.page.html',
  styleUrl: './project.page.scss',
})
export class ProjectPage {
  private store = inject(Store);
  private actions$ = inject(Actions);

  activeMenuId = signal<number | null>(null);
  dialogOpen = signal(false);
  isEditMode = signal(false);
  selectedProject = signal<Project | null>(null);
  selectedEmployeeIds = signal<string[]>([]);
  formCode = signal('');
  formName = signal('');
  formClientName = signal('');
  formDescription = signal('');
  formIsBillable = signal(false);
  employees = toSignal(this.store.select(projectFeature.selectEmployees), {
    initialValue: [],
  });

  assignedEmployeeIds = toSignal(
    this.store.select(projectFeature.selectAssignedEmployeeIds),
    { initialValue: [] },
  );

  employeesLoading = toSignal(
    this.store.select(projectFeature.selectEmployeesLoading),
    { initialValue: false },
  );

  projects = toSignal(this.store.select(projectFeature.selectProjects), {
    initialValue: [] as Project[],
  });

  loading = toSignal(this.store.select(projectFeature.selectLoading), {
    initialValue: false,
  });

  isFormValid = computed(() => {
    return (
      this.formCode().trim().length > 0 &&
      !this.isDuplicateCode() &&
      this.formName().trim().length > 0 &&
      this.formClientName().trim().length > 0 &&
      this.selectedEmployeeIds().length > 0
    );
  });

  isDuplicateCode = computed(() => {
    const code = this.formCode().trim().toLowerCase();
    if (!code) return false;

    const currentId = this.selectedProject()?.id;

    return this.projects().some((p) => {
      const sameCode = p.code.toLowerCase() === code;

      // If editing → ignore the same project
      if (this.isEditMode() && currentId) {
        return sameCode && p.id !== currentId;
      }

      return sameCode;
    });
  });

  isCodeInvalid = computed(() => this.formCode().trim().length === 0);
  isNameInvalid = computed(() => this.formName().trim().length === 0);
  isClientInvalid = computed(() => this.formClientName().trim().length === 0);
  isEmployeesInvalid = computed(() => this.selectedEmployeeIds().length === 0);

  @ViewChild('actionsTemplate', { static: true })
  actionsTemplate!: TemplateRef<{ $implicit: Project }>;

  columns = signal<TableColumn<Project>[]>([
    { header: 'Code', field: 'code' },
    { header: 'Name', field: 'name' },
    { header: 'Client', field: 'clientName' },
    { header: 'Billable', field: 'isBillable' },
    {
      header: 'Status',
      template: undefined,
      width: '120px',
    },
    {
      header: 'Actions',
      template: undefined,
      width: '120px',
    },
  ]);

  @ViewChild('actionsTemplate')
  set actionsTpl(template: TemplateRef<{ $implicit: Project }>) {
    if (!template) return;

    this.columns.update((cols) =>
      cols.map((col) =>
        col.header === 'Actions' ? { ...col, template } : col,
      ),
    );
  }

  @ViewChild('statusTemplate')
  set statusTpl(template: TemplateRef<{ $implicit: Project }>) {
    if (!template) return;

    this.columns.update((cols) =>
      cols.map((col) => (col.header === 'Status' ? { ...col, template } : col)),
    );
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.action-menu-wrapper')) {
      this.activeMenuId.set(null);
    }
  }

  constructor() {
    this.store.dispatch(ProjectActions.loadProjects());
    this.assignedEmployeeIds = toSignal(
      this.store.select(projectFeature.selectAssignedEmployeeIds),
      { initialValue: [] },
    );

    this.employees = toSignal(
      this.store.select(projectFeature.selectEmployees),
      { initialValue: [] },
    );

    this.employeesLoading = toSignal(
      this.store.select(projectFeature.selectEmployeesLoading),
      { initialValue: false },
    );

    // Sync assigned employees when editing
    effect(() => {
      const assigned = this.assignedEmployeeIds();
      const isEdit = this.isEditMode();

      if (isEdit && assigned.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.selectedEmployeeIds.set(assigned.map((as: any) => as.id));
      }
    });

    this.actions$
      .pipe(
        ofType(
          ProjectActions.createProjectSuccess,
          ProjectActions.updateProjectSuccess,
        ),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.closeDialog();
      });
  }

  onEdit(project: Project): void {
    this.openEdit(project);
  }

  onDelete(project: Project): void {
    console.log('Delete', project);
  }

  toggleActionMenu(id: number): void {
    this.activeMenuId.update((current) => (current === id ? null : id));
  }

  closeMenu(): void {
    this.activeMenuId.set(null);
  }

  getStatusLabel(status: ProjectStatus): string {
    return ProjectStatus[status];
  }

  openAdd(): void {
    this.selectedProject.set(null);
    this.isEditMode.set(false);
    this.dialogOpen.set(true);

    this.formCode.set('');
    this.formName.set('');
    this.formClientName.set('');
    this.formDescription.set('');
    this.formIsBillable.set(false);
    this.selectedEmployeeIds.set([]);

    this.store.dispatch(ProjectActions.loadEmployees());
  }

  openEdit(project: Project): void {
    this.selectedProject.set(project);
    this.isEditMode.set(true);
    this.dialogOpen.set(true);

    this.formCode.set(project.code);
    this.formName.set(project.name);
    this.formClientName.set(project.clientName);
    this.formDescription.set(project.description ?? '');
    this.formIsBillable.set(project.isBillable);

    this.store.dispatch(ProjectActions.loadEmployees());
    this.store.dispatch(
      ProjectActions.loadAssignedEmployees({ projectId: project.id }),
    );
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }

  onEmployeeSelectionChange(ids: string[]): void {
    this.selectedEmployeeIds.set(ids);
  }

  submit(): void {
    if (!this.isFormValid()) return;

    const request = {
      name: this.formName(),
      code: this.formCode(),
      status: ProjectStatus.Active, // default
      clientName: this.formClientName(),
      isBillable: this.formIsBillable(),
      description: this.formDescription() || null,
      employeeIds: this.selectedEmployeeIds(),
    };

    if (this.isEditMode() && this.selectedProject()) {
      this.store.dispatch(
        ProjectActions.updateProject({
          id: this.selectedProject()!.id,
          request,
        }),
      );
    } else {
      this.store.dispatch(ProjectActions.createProject({ request }));
    }
  }
}
