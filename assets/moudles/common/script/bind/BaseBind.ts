import { _decorator, CCString, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BaseBind')
export class BaseBind extends Component {

    @property({type: CCString})
    public bindName: string;

    getBindName() {
        return this.bindName;
    }

    getBindValue() {
        return null;
    }

    /**
     * 刷新value
     * @param value 
     */
    refreshBindValue(value) {
    }
}

