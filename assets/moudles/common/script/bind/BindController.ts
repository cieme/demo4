import { _decorator, Component, Node } from 'cc';
import { BaseBind } from './BaseBind';
const { ccclass, property } = _decorator;

@ccclass('BindController')
export class BindController extends Component {
    /**
     * 绑定数据列表
     */
    private bindList = [];
    private bindMap = {};

    start() {
        this.bindList = this.node.getComponentsInChildren(BaseBind);
        for(let index = 0; index < this.bindList.length; index = index + 1) {
            let bindData = this.bindList[index];
            this.bindMap[bindData.bindName] = bindData;
        }
    }

    /**
     * 获取bind列表
     * @returns 
     */
    getBindValueMap() {
        let bind = {};
        for(let index = 0; index < this.bindList.length; index = index + 1) {
            let bindData = this.bindList[index];
            bind[bindData.getBindName()] = bindData.getBindValue();
        }

        return bind;
    }

    refreshBindValue(bindName:string, bindValue:any) {
        let bindData = this.bindMap[bindName];
        if(bindData == null)
            return;

        bindData.refreshBindValue(bindValue);
    }

    getBindValue(bindName) {
        let bindData = this.bindMap[bindName];
        if(bindData == null)
            return '';

        return bindData.getBindValue();
    }
}

