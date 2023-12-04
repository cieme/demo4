import { _decorator, Component, Label, Node } from 'cc';
import { BaseBind } from './BaseBind';
const { ccclass, property } = _decorator;

@ccclass('LabelBind')
export class LabelBind extends BaseBind {
    /**
     * 文本文件
     */
    private label: Label;

    onLoad() {
        this.label = this.getComponent(Label);
    }

    getBindValue() {
        return this.label.string;
    }

    /**
     * 刷新value
     * @param value 
     */
    refreshBindValue(value) {
        this.label.string = value;
    }
}

