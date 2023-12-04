import { _decorator, Component, EditBox, Node } from 'cc';
import { BaseBind } from './BaseBind';
const { ccclass, property } = _decorator;

@ccclass('EditBoxBind')
export class EditBoxBind extends BaseBind {

    protected editBox: EditBox;

    onLoad() {
        this.editBox = this.getComponent(EditBox);
    }

    getBindValue() {
        return this.editBox.string;
    }

    /**
     * 刷新value
     * @param value 
     */
    refreshBindValue(value) {
        this.editBox.string = value;
    }
}

