import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {
  BehaviorSubject,
  defer, from,
  merge,
  scheduled,
  Subject,
} from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ArrayProviderService } from '../../../../shared/debug-helper/value-provider';
import { ArrayProviderComponent } from '../../../../shared/debug-helper/value-provider/array-provider/array-provider.component';
import { RxState } from '@rx-angular/state';
import { Hooks } from '../../../../shared/debug-helper/hooks';
import { map, startWith, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { asyncScheduler } from '../../../../rx-angular-pocs';

let itemIdx = 0;
function getNewItem() {
  const _idx = itemIdx.toString();
  const i =  { id: _idx, value: new Array(4).fill(null).map(_ => itemIdx).join('') };
  ++itemIdx;
  return i;
}

function getItems(num: number) {
  return  new Array(num).fill(null).map(_ => getNewItem());
}


const item0 = getNewItem();
const item1 = getNewItem();
const item2 = getNewItem();
const item3 = getNewItem();
const items5 = getItems(500);
const items5k = getItems(250);
const firstItems5k = items5k[0];
const lastItems5k = items5k[249];
const items5kSwapped = [
  ...items5k
];
items5kSwapped[0] = lastItems5k;
items5kSwapped[249] = firstItems5k;

const customChangeSet = [
  [],
  // insert 0,1,2,3,4
  [item0, item1, item2, item3, ...items5],
  // unchanged 0, remove 1, update 2 => 2232, move 3,2
  [item0, item3, { ...item2, value: '2232' }, ...items5],
  [item0, item3, { ...item2, value: '2232' }],
  [],
  // insert 0,1,2,3,4
  [item0, item3, { ...item2, value: '2232' }, ...items5],
  // unchanged 0, remove 1, update 2 => 2232, move 3,2
  [item0, item1, item2, item3, ...items5],
  [item0, item3, { ...item2, value: '2232' }],
  [],
  // insert 0,1,2,3,4
  [item0, ...items5, item1, item2, item3],
  // unchanged 0, remove 1, update 2 => 2232, move 3,2
  [item0, item3, { ...item2, value: '2232' }, ...items5],
  [item0, item3, { ...item2, value: '2232' }],
];

const moveChangeSet1 = [
  items5k
];

@Component({
  selector: 'rxa-rx-for-list-actions',
  template: `
    <rxa-visualizer>
      <div visualizerHeader class="row">
        <div class="col-sm-12">
          <h2>Reactive Iterable Differ</h2>
          <rxa-array-provider
            [unpatched]=""
            [buttons]="true"
            #arrayP="rxaArrayProvider"
          ></rxa-array-provider>
          <rxa-strategy-select
            (strategyChange)="strategy$.next($event)"
          ></rxa-strategy-select>
          <mat-button-toggle-group
            name="visibleExamples"
            *rxLet="view; let viewMode"
            aria-label="Visible Examples"
            [value]="viewMode"
            #group="matButtonToggleGroup"
          >
            <mat-button-toggle value="tile" (click)="view.next('tile')"
              >Tile</mat-button-toggle
            >
            <mat-button-toggle value="list" (click)="view.next('list')"
              >List</mat-button-toggle
            >
          </mat-button-toggle-group>
          <button mat-raised-button (click)="triggerChangeSet.next()">
            ChangeSet
          </button>
          <button mat-raised-button (click)="triggerMoveSet.next()">
            MoveSet
          </button>
          <button mat-raised-button (click)="triggerMoveSetSwapped.next()">
            MoveSet Swapped
          </button>
          <p *rxLet="rendered$; let rendered">
            <strong>Rendered</strong> {{ rendered }}
          </p>
        </div>
      </div>
      <div class="d-flex flex-column justify-content-start w-100">
        <div
          class="work-container d-flex flex-wrap w-100"
          [class.list-view]="viewMode === 'list'"
          *rxLet="view; let viewMode"
        >
          <div
            #workChild
            class="work-child d-flex"
            *rxFor="
              let a of data$;
              let index = index;
              let count = count;
              let even = even;
              let odd = odd;
              let first = first;
              let last = last;
              renderCallback: renderCallback;
              trackBy: trackById;
              strategy: strategy$
            "
            [title]="a.id + '_' + index + '_' + count"
            [class.even]="even"
          >
            <div class="child-bg" [ngStyle]="{ background: color(a) }"></div>
            <!--<div class="child-bg" [class.even]="even"></div>-->
            <div class="child-context flex-column flex-wrap">
              <small>id: {{ a.id }}</small>
              <small>value: {{ a.value }}</small>
              <small>index: {{ index }}</small>
              <small>count: {{ count }}</small>
              <small>even: {{ even }}</small>
              <small>odd: {{ odd }}</small>
              <small>first: {{ first }}</small>
              <small>last: {{ last }}</small>
            </div>
          </div>
        </div>
      </div>
    </rxa-visualizer>
  `,
  changeDetection: environment.changeDetection,
  encapsulation: ViewEncapsulation.None,
  providers: [ArrayProviderService],
  styles: [
    `
      .work-container.list-view {
        flex-direction: column;
      }

      .work-container.list-view .work-child {
        width: 100%;
        height: 65px;
        margin: 0.5rem 0;
        background-color: transparent !important;
      }

      .child-context {
        display: none;
      }

      .work-container.list-view .work-child .child-context {
        display: flex;
      }

      .work-container.list-view .work-child .child-bg {
        margin-right: 0.5rem;
        width: 50px;
        position: relative;
      }

      .work-child {
        position: relative;
        width: 10px;
        height: 10px;
        margin: 0 2px 2px 0;
        padding: 0px;
        outline: 1px solid white;
        background-color: transparent;
      }

      .work-child.even {
        outline: 1px solid black;
      }

      .work-child .child-bg {
        position: absolute;
        width: 100%;
        height: 100%;
      }
      .work-child .child-bg.even {
        background-color: red;
      }
    `,
  ],
})
export class ListActionsComponent extends Hooks implements AfterViewInit {
  @ViewChild('arrayP', { read: ArrayProviderComponent, static: true }) arrayP;

  @ViewChildren('workChild') workChildren: QueryList<ElementRef<HTMLElement>>;

  private numRendered = 0;

  readonly view = new BehaviorSubject<'list' | 'tile'>('list');
  readonly triggerChangeSet = new Subject<void>();
  readonly activeChangeSet$ = this.triggerChangeSet.pipe(
    switchMapTo(scheduled(customChangeSet, asyncScheduler)),
    tap((data) => console.log(data))
  );

  readonly triggerMoveSet = new Subject<void>();
  readonly triggerMoveSetSwapped = new Subject<void>();
  readonly activeMoveSet$ = merge(
    this.triggerMoveSet.pipe(
      switchMap(() => [items5k])
    ),
    this.triggerMoveSetSwapped.pipe(
      switchMap(() => [items5kSwapped])
    )
  );

  readonly data$ = defer(() =>
    merge(this.arrayP.array$, this.activeChangeSet$, this.activeMoveSet$)
  );
  readonly renderCallback = new Subject();
  readonly rendered$ = this.renderCallback.pipe(
    startWith(null),
    map(() => ++this.numRendered)
  );
  strategy$ = new Subject<string>();
  customChangeSet = customChangeSet;
  customChangeSet$ = new Subject<any>();

  trackById = (idx, item) => {
    return item.id;
  };

  constructor(public state: RxState<any>, public cdRef: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.state.hold(this.workChildren.changes, (workChildren) => {
      console.log('workChildren', this.workChildren.toArray());
    });
  }

  trackByIdFn = (a) => a.id;

  color(a) {
    return '#' + Math.floor(a.value * 16777215).toString(16);
  }
}
