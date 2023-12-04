import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlanNodeController')
export class PlanNodeController extends Component {
    @property({type: Node})
    public editNode: Node;

    @property({type: Node})
    public detailNode: Node;

    @property({type: Node})
    public detectionNode: Node;

    onLoad() {
        director.on('plan_edit_show', this._onPlanEditShow, this);
        director.on('plan_detail_show', this._onPlanDetailShow, this);
        director.on('plan_detection_show', this._onPlanDetectionShow, this);
    }

    onDestroy() {
        director.off('plan_edit_show', this._onPlanEditShow, this);
        director.off('plan_detail_show', this._onPlanDetailShow, this);
        director.off('plan_detection_show', this._onPlanDetectionShow, this);
    }

    _onPlanEditShow(plan:string) {
        this.editNode.active = true;

        this.scheduleOnce(() => {
            director.emit('plan_edit_refresh', plan);
        });
        
    }

    _onPlanDetailShow() {
        this.detailNode.active = true;
    }

    _onPlanDetectionShow() {
        this.detectionNode.active = true;
    }
}

