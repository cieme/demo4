import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PointController')
export class PointController extends Component {

    onClick() {
        director.emit('render_pos_click', this.node);
    }
}

