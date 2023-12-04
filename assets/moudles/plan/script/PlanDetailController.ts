import { _decorator, Color, Component, instantiate, Node, Prefab, sys, Toggle, ToggleContainer } from 'cc';
import { PageController } from '../../common/page/PageController';
import { PlanNameController } from './PlanNameController';
import { BindController } from '../../common/script/bind/BindController';
import { TableController } from '../../common/table/TableController';
import { TypeList } from '../../calc/script/Matter';
import { ResultController } from '../../render/script/ResultController';
const { ccclass, property } = _decorator;

@ccclass('PlanDetailController')
export class PlanDetailController extends Component {

    @property({type : PageController})
    public pageController : PageController;

    @property({type: Prefab})
    public planNamePrefab: Prefab;

    @property({type: Node})
    public layout: Node;

    @property({type: BindController})
    public bindController: BindController;

    @property({type: TableController})
    public agvParamController: TableController;

    @property({type: ResultController})
    public agvResult: ResultController;

    protected _defaultColor: Color = new Color(0, 118, 246);

    protected _selectColor: Color = new Color(255, 255, 255);

    private _curPlan : string;

    onLoad() {
    }

    start() {
        this._refreshPlanList();
    }

    onEnable() {
        
    }

    onClose() {
        this.node.active = false;
    }

    private _refreshPlanList() {
        this.layout.removeAllChildren();
        let planList = JSON.parse(sys.localStorage.getItem('plan_list'));
        if( planList == null) {
            return;
        }

        for(let planIndex in planList) {
            let plan = planList[planIndex];

            this._buildPlanName(plan.name, plan.showName, false);
        }
    }

    private _buildPlanName(planName, showName, select) {
        let node = instantiate(this.planNamePrefab);
        node.name = planName;

        this.layout.addChild(node);

        let planNameController = node.getComponent(PlanNameController)
        planNameController.stringPlanName = showName;
        planNameController.selectEvent = (select : boolean) => {
            this._selectChange(planNameController, select);
        };

        this._selectChange(planNameController, select);
    }

    private _selectChange(planNameController : PlanNameController, select : boolean) {
        planNameController.getComponent(Toggle).isChecked = select;
    }

    private onPlanChange() {
        let _toggleItems = this.layout.getComponent(ToggleContainer).toggleItems;
        for( let _index = 0; _index < _toggleItems.length; ++_index ) {
            let _toggle = _toggleItems[_index];
            if( _toggle.isChecked ) {
                // console.error('on plan change in detail: ', _toggle.node.name);
                this._onPlanSelect(_toggle.node.name);
            }

            let _planNameController = _toggle.getComponent(PlanNameController);
            if ( _toggle.isChecked ) {
                _planNameController.planName.color = this._selectColor;
            } else {
                _planNameController.planName.color = this._defaultColor;
            }
        }
    }

    private _getAgvName(agvType:string) {
        if( agvType == TypeList.Carpet ) {
            return '地毯'
        } else if( agvType == TypeList.Door ) {
            return '车门内饰板'
        } else {
            return '车门内饰板+地毯'
        }
    }

    /**
     * 计划被选择
     * @param plan 
     */
    private _onPlanSelect(plan: string) {
        this._curPlan = plan;
        let param = JSON.parse(sys.localStorage.getItem('plan_param:' + this._curPlan));
        for(let key in param) {
            this.bindController.refreshBindValue(key, param[key]);
        }

        this.agvParamController.refreshBegin();
        let agvList = param['agvType'];
        for(let _index in agvList) {
            let _agvType = agvList[_index];
            let _agvName = this._getAgvName(_agvType);
            let _data = [_agvName, param['moveSpeed'], param['unhookTime'], param['hookTime'], param['deliverySpeed']];

            this.agvParamController.refreshRow(Number(_index), _data);
        }

        this._refreshResult(plan, param);
    }

    /**
     * 刷新结果
     * @param plan 
     */
    private _refreshResult(plan: string, paramConfig:{}) {
        let param = JSON.parse(sys.localStorage.getItem('plan_result:' + this._curPlan));
        if( param == null ) {
            this.agvResult.node.active = false;
            return true;
        }

        this.pageController.refresh(param.length, 1, (page : number) => { this._onPageChange(page); });

        this.agvResult.node.active = true;
    }

    /**
     * 页数发生变化的时候
     * @param page 
     */
    private _onPageChange(page : number) {
        let paramCofig = JSON.parse(sys.localStorage.getItem('plan_param:' + this._curPlan));
        if( paramCofig == null || paramCofig['agvType'] == null  )
            return;

        let param = JSON.parse(sys.localStorage.getItem('plan_result:' + this._curPlan));
        if( page - 1 < 0 || page - 1 >= param.length ) {
            return null;
        }

        let _data = param[ page - 1 ];

        let _agvType = _data['agvType'];
        let _agvName = this._getAgvName(_agvType);
        this.agvResult.title.string = _agvName;

        this.agvResult.refresh(_data);
    }
}

