import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum RenderType {
    Content = 'content', 
    Point = 'point', 
}

@ccclass('RenderObject')
export class RenderObject extends Component {

    /**
     * 渲染类型
     */
    public renderType:RenderType;

    /**
     * 唯一Id
     */
    public uniqueId:string;

    /**
     * 右边的点的ID
     */
    public rightId:string;
}

