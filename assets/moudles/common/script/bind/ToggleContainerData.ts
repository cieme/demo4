import { _decorator, CCString, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ToggleContainerData')
export class ToggleContainerData extends Component {
    @property({type: CCString})
    public toggleData: string;
}

