import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerModule } from '../../../../shared/debug-helper/visualizer';
import { UnpatchEventsModule } from '@rx-angular/template';
import { MatButtonModule } from '@angular/material/button';
import { DirtyChecksModule } from '../../../../shared/debug-helper/dirty-checks';
import { ValueModule } from '../../../../shared/debug-helper/work';
import { RxForContainerComponent } from './parent.component';
import { RxMinimalForOf } from './rx-for-minimal.directive';
import { RxForValueComponent } from './rx-for-value.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { StrategySelectModule } from '../../../../shared/debug-helper/strategy-select';
import { PushModule, RxForModule, RxLetModule } from '../../../../rx-angular-pocs';
import { SharedModule } from '../../differ/shared';
import { RxForNormal } from './rx-for-normal.directive';

const DECLARATIONS = [
  RxForContainerComponent,
  RxMinimalForOf,
  RxForNormal,
  RxForValueComponent
];

@NgModule({
  declarations: DECLARATIONS,
  imports: [
    CommonModule,
    VisualizerModule,
    UnpatchEventsModule,
    MatButtonModule,
    DirtyChecksModule,
    ValueModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    RxLetModule,
    RxForModule,
    StrategySelectModule,
    SharedModule,
    PushModule
  ],
  exports: DECLARATIONS
})
export class RxForPocModule {
}
