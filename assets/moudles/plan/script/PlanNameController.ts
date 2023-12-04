import { _decorator, Component, Label, Node, EventTarget, Color } from 'cc';
const { ccclass, property } = _decorator;
const eventTarget = new EventTarget();

@ccclass('PlanNameController')
export class PlanNameController extends Component {
    @property({type: Label})
    public planName: Label;

    public stringPlanName: string;

    public clickEvent: Function;

    public editEvent: Function;

    public selectEvent: Function;

    onLoad () {
    }

    onDestroy () {
    }

    start() {
        this._setPlanName(this.stringPlanName);
    }

    _setPlanName(planName) {
        if( this.planName == null )
            return;

        this.planName.string = planName; 
    }

    onClick() {
        if(this.clickEvent) {
            this.clickEvent(this.node.name);
        }
    }

    onEditClick() {
        if(this.editEvent) {
            this.editEvent(this.node.name);
        }
    }
}

