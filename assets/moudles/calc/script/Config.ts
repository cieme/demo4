import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Config')
export class Config {
    public plan:string = '';
    
    /**
     * 车类型
     */
    public agvType = ['doorAndCarpet'];

    /**
     * 产生速度
     */
    public span = 60;

    /**
     * 车门数量
     */
    public doorCount = 4;

    /**
     * 地毯数量
     */
    public carpetCount = 3;

    /**
     * 移动速度
     */
    public moveSpeed = 8;

    /**
     * 挂载时间
     */
    public hookTime = 20;

    /**
     * 解挂时间
     */
    public unhookTime = 20;

    /**
     * 配送效率
     */
    public deliverySpeed = 95;

    /**
     * 挂载数量
     */
    public dragCount = 2;

    /**
     * 产生间隔
     */
    public spanSpace = 10;

    /**
     * 产生的总数量
     */
    public spanTotal = 100;

    /**
     * 路径
     */
    public pointMap = {};

    /**
     * 缓存区路径点
     */
    public cachePosIndex = "";

    /**
     * 启动节点
     */
    public startPosIndex = "";

    /**
     * 出口
     */
    public exportPosIndex = [];
}

