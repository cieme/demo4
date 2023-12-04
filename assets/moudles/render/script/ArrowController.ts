import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ArrowController')
export class ArrowController extends Component {
    /**
     * 起点
     */
    public startPos:Vec3;

    /**
     * 终点
     */
    public endPos:Vec3;

    public updateDirection() {
        
    }
}

