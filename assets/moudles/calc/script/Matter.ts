import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 物料类型
 */
export enum TypeList {
    Door = "door", 
    Carpet = "carpet", 
};

/**
 * 物料
 */
@ccclass('Matter')
export class Matter {
    /**
     * 类型
     */
    public type:string;

    /**
     * 产生时间
     */
    public spanTime:number;

    /**
     * 进入缓存区时间
     */
    public inputCacheTime:number;

    /**
     * 离开缓存区时间
     */
    public outputCacheTime:number;
}

