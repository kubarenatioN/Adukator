import { Directive, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Directive()
export class BaseComponent implements OnDestroy {
    private componentLifecycleStore$ = new Subject<void>();
    public componentLifecycle$ = this.componentLifecycleStore$.asObservable();

    public resetLifecycle() {
        this.componentLifecycleStore$.next()
        this.componentLifecycleStore$.complete();
    }

    public ngOnDestroy(): void {
        this.resetLifecycle()
    }
}