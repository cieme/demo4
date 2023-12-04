import { _decorator, Component, instantiate, Node, Prefab, sys, director, Color } from 'cc';
import { PlanNameController } from './PlanNameController';
const { ccclass, property } = _decorator;

@ccclass('PlanListController')
export class PlanListController extends Component {
    @property({type: Prefab})
    public planNamePrefab: Prefab;

    @property({type: Node})
    public layout: Node;

    protected _defaultColor: Color = new Color(102, 102, 102);

    protected _selectColor: Color = new Color(0, 118, 246);

    start() {
        let planList = JSON.parse(sys.localStorage.getItem('plan_list'));
        if( planList == null) {
            planList = [
                {name: 'plan0', showName: '方案1'}, 
                {name: 'plan1', showName: '方案2'},
                {name: 'plan2', showName: '方案3'},
            ];

            sys.localStorage.setItem('plan_list', JSON.stringify(planList));
            let defaultParam = {};
            defaultParam['agvType'] = ['doorAndCarpet'];
            defaultParam['span'] = '60';
            defaultParam['doorCount'] = '40';
            defaultParam['carpetCount'] = '30';
            defaultParam['moveSpeed'] = '20';
            defaultParam['hookTime'] = '20';
            defaultParam['unhookTime'] = '20';
            defaultParam['deliverySpeed'] = '95';
            defaultParam['dragCount'] = '4';

            let json = JSON.stringify(defaultParam);

            for(let _index = 0; _index < planList.length; ++_index) {
                sys.localStorage.setItem('plan_param:' + planList[_index].name, json);
            }
        }

        for(let planIndex in planList) {
            let plan = planList[planIndex];

            this._buildPlanName(plan.name, plan.showName, false);
        }

        this._selectPlan('plan0');
    }

    /**
     * 构建
     * @param planName 
     */
    _buildPlanName(planName, showName, select) {
        let node = instantiate(this.planNamePrefab);
        node.name = planName;

        this.layout.addChild(node);

        let planNameController = node.getComponent(PlanNameController)
        planNameController.stringPlanName = showName;
        planNameController.selectEvent = (select : boolean) => {
            this._selectChange(planNameController, select);
        };

        planNameController.clickEvent = (planName) => {
            this._selectPlan(planName);
        }

        planNameController.editEvent = (planName) => {
            this._editPlan(planName);
        }
    }

    _clearAllPlanName() {
        this.layout.removeAllChildren();
    }

    _selectChange(planNameController : PlanNameController, select : boolean) {
        planNameController.planName.isUnderline = select; 
        if( select ) {
            planNameController.planName.color = this._selectColor;
        }else {
            planNameController.planName.color = this._defaultColor;
        }
    }

    _selectPlan(planName) {
        for(let nodeIndex in this.layout.children) {
            let node = this.layout.children[nodeIndex];
            let planNameController = node.getComponent(PlanNameController);

            this._selectChange(planNameController, node.name == planName);
        }

        sys.localStorage.setItem('plan_select', planName);
        director.emit('plan_select', planName);
    }

    _editPlan(planName) {
        director.emit('plan_edit_show', planName);
    }
}

