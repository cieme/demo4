import { _decorator, Component, Node, Toggle, ToggleContainer } from 'cc';
import { BaseBind } from './BaseBind';
import { ToggleContainerData } from './ToggleContainerData';
const { ccclass, property } = _decorator;

@ccclass('ToggleContainerBind')
export class ToggleContainerBind extends BaseBind {

    /**
     * 容器本身
     */
    protected toggleContainer: ToggleContainer;

    /**
     * 数据列表
     */
    protected toggleDataMap = {};

    onLoad() {
        this.toggleContainer = this.getComponent(ToggleContainer);
        let _toggleItems = this.getComponentsInChildren(Toggle);
        for(let index = 0; index < _toggleItems.length; ++index) {
            let toggle = _toggleItems[index];
            let toggleData = toggle.getComponent(ToggleContainerData);

            this.toggleDataMap[toggleData.toggleData] = toggle;
        }
    }

    getBindValue() {
        let bindValue = [];
        for(let key in this.toggleDataMap) {
            let toggle = this.toggleDataMap[key];
            if(toggle.isChecked) {
                if( this.toggleContainer ) {
                    return key;
                }
                
                bindValue.push(key);
            }
        }

        return bindValue;
    }

    refreshBindValue(value) {
        if( this.toggleContainer == null ) {
            for(let key in this.toggleDataMap) {
                let toggle = this.toggleDataMap[key];
                toggle.isChecked = false;
            }
        }    

        if(Array.isArray(value)) {
            for(let _index in  value) {
                this.refreshBindValueSingle(value[_index]);
            }
        } else {
            this.refreshBindValueSingle(value);
        }
    }

    refreshBindValueSingle(stringValue:string) {
        // console.error('toggle container bind: ', stringValue, this.toggleDataMap[stringValue]);
        let toggle = this.toggleDataMap[stringValue];
        toggle.isChecked = true;
        if( this.toggleContainer ) {
            this.toggleContainer.notifyToggleCheck(toggle, false);
        }
    }
}

