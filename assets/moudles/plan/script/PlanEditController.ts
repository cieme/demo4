import { _decorator, Component, director, Node, sys } from 'cc';
import { BindController } from '../../common/script/bind/BindController';
const { ccclass, property } = _decorator;

@ccclass('PlanEditController')
export class PlanEditController extends Component {

    private bindController : BindController;

    public _editPlan : string;

    onLoad() {
        console.error('PlanEditController: ', this.node.name);
        this.bindController = this.getComponentInChildren(BindController);
        director.on('plan_edit_refresh', this._onPlanEditRefresh, this);
    }

    onDestroy() {
        director.off('plan_edit_refresh', this._onPlanEditRefresh, this);
    }

    onClose() {
        this.node.active = false;
    }

    onSave() {
        this._save();
        this.onClose();
    }

    onSaveAnCalc() {
        this._save();
        this.onClose();
        this._calc();
    }

    /**
     * 保存
     */
    _save() {
        let param = this.bindController.getBindValueMap();
        console.error('_save: ', this._editPlan, param);

        sys.localStorage.setItem('plan_param:' + this._editPlan, JSON.stringify(param));
    }

    /**
     * 重新计算
     */
    _calc() {
        director.emit('render_calc', this._editPlan);
    }

    /**
     * 刷新数据
     * @param plan 
     */
    _onPlanEditRefresh(plan:string) {
        this._editPlan = plan;
        this._refreshPlan();
    }

    _refreshDefault() {
        this.bindController.refreshBindValue('agvType', ['doorAndCarpet']);
        this.bindController.refreshBindValue('span', '60');
        this.bindController.refreshBindValue('doorCount', '4');
        this.bindController.refreshBindValue('carpetCount', '3');

        this.bindController.refreshBindValue('moveSpeed', '8');
        this.bindController.refreshBindValue('hookTime', '20');
        this.bindController.refreshBindValue('unhookTime', '20');
        this.bindController.refreshBindValue('deliverySpeed', '95');
        this.bindController.refreshBindValue('dragCount', '2');
    }

    _refreshPlan() {
        console.error('refresh: ', this._editPlan);
        let param = JSON.parse(sys.localStorage.getItem('plan_param:' + this._editPlan));
        if( param == null ) {
            this._refreshDefault();
        } else {
            this._refreshBindData(param);
        }
    }

    _refreshBindData(param:any) {
        for(let key in param) {
            // console.error('before refresh bind data: ', key, param[key]);
            this.bindController.refreshBindValue(key, param[key]);
        }
    }
}

