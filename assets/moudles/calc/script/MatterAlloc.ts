import { _decorator, Color, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MatterAlloc')
export class MatterAlloc {

    public type:string;

    public name:string;

    public ratio:number;

    public color:Color;
}

