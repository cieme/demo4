import { _decorator, Component, Node, UITransform, v2, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DirectionController')
export class DirectionController extends Component {
    /**
     * 起点
     */
    public startPos:Vec3;

    /**
     * 终点
     */
    public endPos:Vec3;
    /**
     * 更新方向
     */
    public updateDirection() {
        let dir = v2(this.endPos.x - this.startPos.x, this.endPos.y - this.startPos.y);
        let angle = dir.signAngle(v2(1,0)) / Math.PI * 180;
        
        this.node.angle = -angle;
    }
}

