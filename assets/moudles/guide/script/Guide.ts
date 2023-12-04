import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Guide')
export class Guide extends Component {

    // 项目
    @property({type: Label})
    public project: Label;
    // 方案
    @property({type: Label})
    public plan: Label;

    start() {
        this.project.string = "仿真工具";
        this.plan.string = "物流Demo";
    }

    update(deltaTime: number) {
        
    }
}

